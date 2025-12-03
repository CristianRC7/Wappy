import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import API_URL from '../Config';
import { useSession } from '../context/Context';
import { RefreshCw, LogOut, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

let socket: Socket | null = null;

function Qr() {
  const { isAuthenticated, setIsAuthenticated, user } = useSession();
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isEncargado = user?.rol === 'encargado_grupo';
  const isIntegrante = user?.rol === 'integrante_grupo';

  useEffect(() => {
    if (!user?.grupoId) {
      setLoading(false);
      return;
    }

    // Solo los encargados pueden iniciar sesión
    if (isIntegrante) {
      setLoading(false);
      checkSessionStatus();
      return;
    }

    if (!socket) {
      socket = io(API_URL);
    }

    socket.on('qr', (qrImage: string) => {
      setQr(qrImage);
      setIsAuthenticated(false);
      setLoading(false);
    });

    socket.on('authenticated', () => {
      setQr(null);
      setIsAuthenticated(true);
      setLoading(false);
    });

    socket.on('logout', () => {
      setQr(null);
      setIsAuthenticated(false);
      setLoading(false);
    });

    socket.on('error', (message: string) => {
      console.error('Error del servidor:', message);
      setLoading(false);
    });

    // Iniciar sesión con el grupoId del usuario
    if (isEncargado) {
      socket.emit('init-session', user.grupoId);
    }

    return () => {
      socket?.off('qr');
      socket?.off('authenticated');
      socket?.off('logout');
      socket?.off('error');
    };
  }, [setIsAuthenticated, user, isEncargado, isIntegrante]);

  const checkSessionStatus = async () => {
    if (!user?.grupoId) return;
    
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/api/whatsapp-session/status/${user.grupoId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(data.hasSession);
      }
    } catch (error) {
      console.error('Error al verificar estado de sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo verificar el estado de la sesión',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (!user?.grupoId) return;

    const result = await Swal.fire({
      title: '¿Cerrar sesión de WhatsApp?',
      text: 'Esto eliminará la sesión actual y tendrás que escanear el QR nuevamente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      // Cerrar sesión en el socket
      socket?.emit('logout', user.grupoId);
      
      // Eliminar sesión de la base de datos y archivos
      const response = await fetch(`${API_URL}/api/whatsapp-session/${user.grupoId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'La sesión de WhatsApp ha sido cerrada correctamente',
          confirmButtonColor: '#3b82f6',
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar la sesión correctamente',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isEncargado && socket) {
      setLoading(true);
      socket.emit('init-session', user?.grupoId);
    } else if (isIntegrante) {
      checkSessionStatus();
    }
  };

  if (!user?.grupoId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-600 font-bold text-lg">No tienes un grupo asignado</p>
      </div>
    );
  }

  // Vista para integrantes (solo consulta)
  if (isIntegrante) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-2 mb-4 text-blue-700">
            <AlertCircle size={24} />
            <h3 className="text-lg font-semibold">Información de Sesión</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Como integrante, solo puedes consultar el estado de la sesión de WhatsApp.
            El encargado del grupo es quien debe iniciar y cerrar sesión.
          </p>
          <p className="text-sm text-gray-600 mb-4">Grupo: {user.grupoNombre}</p>
          
          {loading || refreshing ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${
                isAuthenticated 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isAuthenticated ? '✓ Sesión Activa' : '✗ Sin Sesión'}
              </div>
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Consultando...' : 'Consultar Estado'}
          </button>
        </div>
      </div>
    );
  }

  // Vista para encargados (control completo)
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {loading && (
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 mb-2 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-700 font-semibold text-lg">Cargando...</p>
        </div>
      )}
      
      {!loading && !isAuthenticated && qr && (
        <>
          <img src={qr} alt="QR para iniciar sesión" className="w-64 h-64 mb-4 border-4 border-blue-200 rounded-lg shadow-lg" />
          <p className="mb-2 text-lg font-semibold text-blue-700">Escanea el código QR con WhatsApp</p>
          <p className="text-sm text-gray-600 mb-4">Grupo: {user.grupoNombre}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={20} />
            Actualizar
          </button>
        </>
      )}
      
      {!loading && isAuthenticated && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-600 font-bold text-lg text-center mb-2">
              ✓ ¡Sesión iniciada correctamente!
            </p>
            <p className="text-gray-700 text-center">Grupo: {user.grupoNombre}</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors"
            >
              <RefreshCw size={20} />
              Actualizar
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
      
      {!loading && !isAuthenticated && !qr && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">No hay sesión activa</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors mx-auto"
          >
            <RefreshCw size={20} />
            Iniciar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default Qr;
