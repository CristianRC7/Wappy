import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const Notification: React.FC = () => {
  const { sending, current, index, total, finished, results, clear, type } = useNotification();
  const [showModal, setShowModal] = useState(false);

  const successCount = results.filter(r => r.status === 'enviado').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  if (!sending && !finished) return null;

  return (
    <>
      {/* Notificación de envío en curso */}
      {sending && (
        <div className="fixed bottom-6 right-6 z-[100] bg-blue-700 text-white px-6 py-4 rounded-xl shadow-lg flex flex-col gap-1 min-w-[260px] animate-fade-in">
          <span className="font-semibold text-lg flex items-center gap-2">
            <span>{type === 'grupo' ? 'Creando grupos...' : 'Enviando mensajes...'}</span>
            <span className="w-5 h-5 border-4 border-white border-t-blue-300 rounded-full animate-spin inline-block"></span>
          </span>
          <span className="text-sm">
            {type === 'grupo' ? (
              <>Creando grupo: <span className="font-mono">{current || '...'}</span></>
            ) : (
              <>Enviando a: <span className="font-mono">{current || '...'}</span></>
            )}
          </span>
          <span className="text-xs text-blue-100">{`Progreso: ${index} de ${total}`}</span>
        </div>
      )}
      {/* Notificación de resumen al finalizar */}
      {finished && (
        <div
          className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex flex-col gap-2 min-w-[260px] animate-fade-in cursor-pointer hover:bg-green-700"
          onClick={() => setShowModal(true)}
        >
          <span className="font-semibold text-lg">¡{type === 'grupo' ? 'Creación de grupos' : 'Envío de mensajes'} finalizada!</span>
          <span className="text-sm">Correctos: <span className="font-bold">{successCount}</span> / {total}</span>
          {errorCount > 0 && <span className="text-sm text-red-200">Errores: {errorCount}</span>}
          <span className="text-xs text-green-100">Haz clic para ver detalles</span>
        </div>
      )}
      {/* Modal de detalle */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold cursor-pointer"
              onClick={() => { setShowModal(false); clear(); }}
              title="Cerrar"
            >×</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Resumen de {type === 'grupo' ? 'creación de grupos' : 'envío de mensajes'}</h2>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    {type === 'grupo' ? (
                      <>
                        <th className="py-2 px-3 border-b">Grupo</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2 px-3 border-b">Teléfono</th>
                      </>
                    )}
                    <th className="py-2 px-3 border-b">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={(r.telefono || r.grupo || '') + i}>
                      {type === 'grupo' ? (
                        <td className="py-1 px-3 font-mono text-sm">{r.grupo}</td>
                      ) : (
                        <td className="py-1 px-3 font-mono text-sm">{r.telefono}</td>
                      )}
                      <td className={`py-1 px-3 text-sm font-semibold ${r.status === 'enviado' ? 'text-green-600' : 'text-red-600'}`}>{r.status === 'enviado' ? (type === 'grupo' ? 'Creado' : 'Enviado') : 'Error'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors cursor-pointer"
                onClick={() => { setShowModal(false); clear(); }}
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification; 