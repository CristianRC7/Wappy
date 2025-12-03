import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QrCode, MessageCircle, Users, MessageSquare, LogOut } from 'lucide-react';
import { useSession } from '../context/Context';

const navItems = [
  { name: 'QR', path: '/qr', icon: <QrCode size={22} /> },
  { name: 'Mensajes', path: '/message', icon: <MessageCircle size={22} /> },
  { name: 'Grupos', path: '/group', icon: <Users size={22} /> },
  { name: 'Chats', path: '/chats', icon: <MessageSquare size={22} /> },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser, user } = useSession();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur bg-opacity-90">
      <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
        <QrCode size={28} className="text-blue-500" /> WhatsApp
      </div>
      <div className="flex items-center gap-6">
        {user && (
          <div className="text-sm text-gray-700 flex flex-col items-end">
            <div>
              <span className="font-semibold">{user.nombre} {user.apellido}</span>
            </div>
            <div className="text-xs text-gray-500">
              <span>Rol: <span className="font-medium">{user.rol}</span></span>
              {user.grupoNombre && (
                <span className="ml-3">Grupo: <span className="font-medium">{user.grupoNombre}</span></span>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4">
        <ul className="flex gap-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 ${location.pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-red-100 hover:text-red-700 text-gray-700"
          title="Cerrar sesión"
        >
          <LogOut size={22} />
          <span className="hidden sm:inline">Salir</span>
        </button>
        </div>
      </div>
    </nav>
  );
}
