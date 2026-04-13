import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import ArtigoPage from './pages/ArtigoPage.jsx';
import SobrePage from './pages/SobrePage.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/ArtHack">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/artigo/:id" element={<ArtigoPage />} />
        <Route path="/sobre" element={<SobrePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

