import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Obras from './pages/Obras';
import ObraEditor from './pages/ObraEditor';
import Artigos from './pages/Artigos';
import ArtigoEditor from './pages/ArtigoEditor';
import Fotos from './pages/Fotos';
import Configuracoes from './pages/Configuracoes';
import PaginaEditor from './pages/PaginaEditor';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#e5e5e5',
              border: '1px solid #333',
              borderRadius: '8px'
            }
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="obras" element={<Obras />} />
            <Route path="obras/nova" element={<ObraEditor />} />
            <Route path="obras/:id" element={<ObraEditor />} />
            <Route path="artigos" element={<Artigos />} />
            <Route path="artigos/novo" element={<ArtigoEditor />} />
            <Route path="artigos/:id" element={<ArtigoEditor />} />
            <Route path="fotos" element={<Fotos />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="paginas/:slug" element={<PaginaEditor />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
