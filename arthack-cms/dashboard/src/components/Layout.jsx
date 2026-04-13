import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/obras', label: 'Obras', icon: '🗿' },
  { to: '/artigos', label: 'Artigos', icon: '✍️' },
  { to: '/fotos', label: 'Fotos & Sessões', icon: '📷' },
  { to: '/configuracoes', label: 'Configurações', icon: '⚙️' },
  { to: '/paginas/sobre', label: 'Minha História', icon: '📖' },
  { to: '/paginas/contato', label: 'Contato', icon: '✉️' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    toast.success('Até logo!');
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-neutral-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-800">
          <span className="text-2xl">🎨</span>
          {!collapsed && (
            <div>
              <p className="font-bold text-sm text-white tracking-wide">ArtHack</p>
              <p className="text-xs text-neutral-500">CMS Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-neutral-500 hover:text-white transition-colors text-xs"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`
              }
            >
              <span className="text-base flex-shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-neutral-800">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.username}</p>
                <p className="text-xs text-neutral-500">Admin</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="text-neutral-500 hover:text-red-400 transition-colors text-xs">
                Sair
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
