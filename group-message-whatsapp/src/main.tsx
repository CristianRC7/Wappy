import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SessionProvider } from './context/Context'
import { NotificationProvider } from './context/NotificationContext'
import Notification from './components/Notification'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <NotificationProvider>
        <App />
        <Notification />
        <Toaster position="bottom-right" richColors />
      </NotificationProvider>
    </SessionProvider>
  </StrictMode>,
)
