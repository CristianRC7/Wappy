import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Qr from './pages/Qr';
import Message from './pages/Message';
import Group from './pages/Group';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Qr />} />
          <Route path="/message" element={<Message />} />
          <Route path="/group" element={<Group />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
