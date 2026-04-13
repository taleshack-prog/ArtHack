const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Cloudinary (optional - falls back to local)
let cloudinary = null;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    const { v2: cld } = require('cloudinary');
    cld.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    cloudinary = cld;
    console.log('✓ Cloudinary configured');
  }
} catch (e) {
  console.log('⚠ Cloudinary not available, using local storage');
}

// Multer config — memory storage for processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/upload/image
router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });

  try {
    const timestamp = Date.now();
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

    // Process with sharp: optimize + generate thumbnail
    const optimized = await sharp(req.file.buffer)
      .rotate()
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const thumbnail = await sharp(req.file.buffer)
      .rotate()
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer();

    if (cloudinary) {
      // Upload to Cloudinary
      const [mainResult, thumbResult] = await Promise.all([
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'arthack/obras', public_id: filename, resource_type: 'image' },
            (err, result) => err ? reject(err) : resolve(result)
          ).end(optimized);
        }),
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'arthack/thumbnails', public_id: `${filename}_thumb`, resource_type: 'image' },
            (err, result) => err ? reject(err) : resolve(result)
          ).end(thumbnail);
        })
      ]);

      return res.json({
        url: mainResult.secure_url,
        thumbnail_url: thumbResult.secure_url,
        public_id: mainResult.public_id,
        width: mainResult.width,
        height: mainResult.height,
        storage: 'cloudinary'
      });
    } else {
      // Save locally
      const uploadsDir = path.join(__dirname, '../uploads');
      const mainPath = path.join(uploadsDir, `${filename}.webp`);
      const thumbPath = path.join(uploadsDir, `${filename}_thumb.webp`);

      await fs.promises.writeFile(mainPath, optimized);
      await fs.promises.writeFile(thumbPath, thumbnail);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      return res.json({
        url: `${baseUrl}/uploads/${filename}.webp`,
        thumbnail_url: `${baseUrl}/uploads/${filename}_thumb.webp`,
        storage: 'local'
      });
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum 15MB.' });
    }
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
