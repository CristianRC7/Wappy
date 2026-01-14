import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import API_URL from '../Config';
import { useSession } from '../context/Context';

let socket: Socket | null = null;

function Qr() {
  const { isAuthenticated, setIsAuthenticated } = useSession();
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    return () => {
      socket?.off('qr');
      socket?.off('authenticated');
      socket?.off('logout');
    };
  }, [setIsAuthenticated]);

  const handleLogout = () => {
    setLoading(true);
    socket?.emit('logout');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {loading && (
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 mb-2 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-700 font-semibold text-lg">Cargando...</p>
        </div>
      )}
      {!isAuthenticated && qr && (
        <>
          <img src={qr} alt="QR para iniciar sesión" className="w-64 h-64 mb-4 border-4 border-blue-200 rounded-lg shadow-lg" />
          <p className="mb-2 text-lg font-semibold text-blue-700">Escanea el código QR con WhatsApp</p>
        </>
      )}
      {isAuthenticated && (
        <>
          <p className="mb-4 text-green-600 font-bold text-lg">¡Sesión iniciada correctamente!</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg shadow cursor-pointer hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </>
      )}
    </div>
  );
}

export default Qr;
