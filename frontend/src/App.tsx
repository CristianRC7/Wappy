import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Navbar from './components/Navbar';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import Sidebar from './components/Sidebar';
import Qr from './pages/Qr';
import Message from './pages/Message';
import Group from './pages/Group';
import Chats from './pages/Chats';
import AddToGroup from './pages/AddToGroup';
import Troubleshooting from './pages/Troubleshooting';

function AppContent() {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* Main Content - Se empuja cuando el sidebar se expande */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Qr />} />
            <Route path="/message" element={<Message />} />
            <Route path="/group" element={<Group />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/add-to-group" element={<AddToGroup />} />
            <Route path="/troubleshooting" element={<Troubleshooting />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;