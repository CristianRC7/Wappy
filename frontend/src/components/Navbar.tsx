import { Link, useLocation } from 'react-router-dom';
import { QrCode, MessageCircle, Users, MessageSquare, UserPlus } from 'lucide-react';

const navItems = [
  { name: 'QR',          path: '/',             icon: <QrCode      size={22} /> },
  { name: 'Mensajes',    path: '/message',       icon: <MessageCircle size={22} /> },
  { name: 'Grupos',      path: '/group',         icon: <Users       size={22} /> },
  { name: 'Agregar',     path: '/add-to-group',  icon: <UserPlus    size={22} /> },
  { name: 'Chats',       path: '/chats',         icon: <MessageSquare size={22} /> },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="bg-white shadow-lg px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur bg-opacity-90">
      <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
        <QrCode size={28} className="text-blue-500" /> Wappy
      </div>
      <ul className="flex gap-6">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 ${
                location.pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
