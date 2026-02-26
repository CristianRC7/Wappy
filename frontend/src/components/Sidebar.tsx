import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  QrCode,
  MessageCircle,
  Users,
  MessageSquare,
  UserPlus,
  HelpCircle,
  BookOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import iconLogo from '../assets/icon.png';

const navItems = [
  { name: 'QR Code',     path: '/',                icon: QrCode },
  { name: 'Mensajes',    path: '/message',         icon: MessageCircle },
  { name: 'Grupos',      path: '/group',           icon: Users },
  { name: 'Agregar',     path: '/add-to-group',    icon: UserPlus },
  { name: 'Chats',       path: '/chats',           icon: MessageSquare },
  { name: 'Ayuda',       path: '/troubleshooting', icon: HelpCircle },
  { name: 'Tutoriales',  path: '/tutorials',       icon: BookOpen },
];

export default function Sidebar() {
  const { isExpanded, setIsExpanded } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* ── Mobile Menu Button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ── Overlay para móvil ─────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out shadow-sm ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isExpanded ? 'w-64' : 'w-20'}`}
      >
        {/* ── Header con logo ──────────────────────────────────────────────── */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-gray-200">

          {/* Logo expandido */}
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${
              isExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0'
            }`}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white">
              <img src={iconLogo} alt="Wappy Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Wappy</span>
          </div>

          {/* Logo colapsado — ID único, sin duplicar */}
          {!isExpanded && (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center mx-auto bg-white">
              <img src={iconLogo} alt="Wappy Logo" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* ── Toggle Button (solo desktop) ──────────────────────────────────── */}
        <button
          id="sidebar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-white border-2 border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 z-50 shadow-sm cursor-pointer"
          aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
        >
          {isExpanded ? (
            <ChevronLeft size={14} className="text-gray-600" />
          ) : (
            <ChevronRight size={14} className="text-gray-600" />
          )}
        </button>

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <nav className="p-3 mt-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`flex-shrink-0 transition-all duration-200 ${isExpanded ? '' : 'mx-auto'}`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>

                    <span
                      className={`font-medium whitespace-nowrap transition-all duration-300 ${
                        isExpanded
                          ? 'opacity-100 translate-x-0 max-w-full'
                          : 'opacity-0 -translate-x-2 max-w-0 overflow-hidden'
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Tooltip modo colapsado */}
                    {!isExpanded && (
                      <div className="absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                        {item.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}

                    {/* Indicador página activa */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l transition-all duration-200" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200">
          {/* Footer expandido */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'
            }`}
          >
            <p className="text-xs font-semibold text-gray-900 mb-2">v1.0.0</p>
            <a
              id="github-link"
              href="https://github.com/CristianRC7/Wappy.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="truncate">Ver repositorio</span>
            </a>
          </div>

          {/* Footer colapsado */}
          {!isExpanded && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-gray-900">v1.0</p>
              <a
                href="https://github.com/CristianRC7/Wappy.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors"
                title="Ver repositorio en GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}