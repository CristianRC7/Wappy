import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Qr from './pages/Qr';
import Message from './pages/Message';
import Group from './pages/Group';
import Chats from './pages/Chats';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {!isLoginPage && <Navbar />}
      <div className={isLoginPage ? '' : 'p-4'}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/qr" element={<Qr />} />
          <Route path="/message" element={<Message />} />
          <Route path="/group" element={<Group />} />
          <Route path="/chats" element={<Chats />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
