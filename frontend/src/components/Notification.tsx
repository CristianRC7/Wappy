import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import type { AddedResult } from '../context/NotificationContext';
import * as XLSX from 'xlsx';
import { ShieldCheck } from 'lucide-react';

const Notification: React.FC = () => {
  const {
    sending,
    current,
    index,
    total,
    finished,
    results,
    clear,
    type,
    createdGroups,
    addedResults,
    cancel,
    cancelled,
  } = useNotification();

  const [showModal, setShowModal] = useState(false);

  const successCount = results.filter(r => r.status === 'enviado').length;
  const errorCount   = results.filter(r => r.status === 'error').length;

  // ── Labels según tipo ──────────────────────────────────────────────────────
  const labelEnCurso =
    type === 'grupo'   ? 'Creando grupos...'         :
    type === 'agregar' ? 'Agregando participantes...' :
                         'Enviando mensajes...';

  const labelFinalizado =
    type === 'grupo'   ? 'Creación de grupos'         :
    type === 'agregar' ? 'Adición de participantes'   :
                         'Envío de mensajes';

  const labelProgreso =
    type === 'grupo'   ? 'Creando grupo:'  :
    type === 'agregar' ? 'Procesando:'     :
                         'Enviando a:';

  // ── Excel: Grupos ──────────────────────────────────────────────────────────
  const handleDownloadExcelGrupos = () => {
    if (!createdGroups.length) return;
    const headers = Object.keys(createdGroups[0]);
    const ws = XLSX.utils.json_to_sheet(createdGroups);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Grupos');
    XLSX.writeFile(wb, 'grupos_creados.xlsx');
  };

  // ── Excel: Agregar participantes ───────────────────────────────────────────
  const handleDownloadExcelAgregar = () => {
    if (!addedResults.length) return;

    const hasAdminCol = addedResults.some((r: AddedResult) => r.makeAdmin);

    const data = addedResults.map((r: AddedResult) => {
      const row: Record<string, string> = {
        'Teléfono': r.telefono,
        'Estado':   r.status === 'agregado' ? 'Agregado' : 'Error',
        'Motivo':   r.reason || '',
      };
      if (hasAdminCol) {
        row['Pedido como Admin'] = r.makeAdmin ? 'Sí' : 'No';
        row['Estado Admin'] =
          r.adminStatus === 'promovido'         ? 'Promovido'         :
          r.adminStatus === 'error_al_promover' ? 'Error al promover' :
          r.adminStatus === 'no_agregado'        ? 'No aplicó'         : '-';
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    // Ajustar anchos de columna
    const cols = Object.keys(data[0] || {}).map(k => ({
      wch: Math.max(k.length, ...data.map(r => String(r[k] || '').length)) + 2,
    }));
    ws['!cols'] = cols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte_agregar_${Date.now()}.xlsx`);
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que deseas detener el proceso? Se generará un reporte parcial con los resultados actuales.')) {
      cancel();
    }
  };

  if (!sending && !finished) return null;

  // ── Contadores para tipo agregar ───────────────────────────────────────────
  const agregadoCount  = addedResults.filter((r: AddedResult) => r.status === 'agregado').length;
  const promoCount     = addedResults.filter((r: AddedResult) => r.adminStatus === 'promovido').length;
  const errorAddCount  = addedResults.filter((r: AddedResult) => r.status === 'error').length;
  const hasAdminCol    = addedResults.some((r: AddedResult) => r.makeAdmin);

  return (
    <>
      {/* ── Toast de progreso ───────────────────────────────────────────────── */}
      {sending && (
        <div className="fixed bottom-6 right-6 z-[100] bg-blue-700 text-white px-6 py-4 rounded-xl shadow-lg flex flex-col gap-3 min-w-[280px] animate-fade-in">
          <span className="font-semibold text-lg flex items-center gap-2">
            <span>{labelEnCurso}</span>
            {!cancelled && (
              <span className="w-5 h-5 border-4 border-white border-t-blue-300 rounded-full animate-spin inline-block" />
            )}
          </span>

          {cancelled && (
            <span className="text-sm text-yellow-300 font-semibold">⚠️ Deteniendo proceso...</span>
          )}

          <span className="text-sm">
            {labelProgreso} <span className="font-mono">{current || '...'}</span>
          </span>

          <span className="text-xs text-blue-100">Progreso: {index} de {total}</span>

          <div className="mt-2 pt-2 border-t border-blue-500">
            <button
              onClick={handleCancel}
              disabled={cancelled}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              {cancelled ? 'Deteniendo...' : '🛑 Detener Proceso'}
            </button>
          </div>
        </div>
      )}

      {/* ── Toast de finalización ───────────────────────────────────────────── */}
      {finished && (
        <div
          className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex flex-col gap-2 min-w-[280px] animate-fade-in cursor-pointer hover:bg-green-700"
          onClick={() => setShowModal(true)}
        >
          {cancelled ? (
            <span className="font-semibold text-lg">⚠️ Proceso detenido</span>
          ) : (
            <span className="font-semibold text-lg">✅ ¡{labelFinalizado} finalizada!</span>
          )}

          {type === 'agregar' ? (
            <>
              <span className="text-sm">Agregados: <span className="font-bold">{agregadoCount}</span> / {total}</span>
              {promoCount > 0 && <span className="text-sm">Admins: <span className="font-bold">{promoCount}</span></span>}
              {errorAddCount > 0 && <span className="text-sm text-red-200">Errores: {errorAddCount}</span>}
            </>
          ) : (
            <>
              <span className="text-sm">Completados: <span className="font-bold">{successCount}</span> / {total}</span>
              {errorCount > 0 && <span className="text-sm text-red-200">Errores: {errorCount}</span>}
            </>
          )}

          <span className="text-xs text-green-100">Haz clic para ver detalles</span>
        </div>
      )}

      {/* ── Modal de detalle ────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/30 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative flex flex-col max-h-[85vh]">

            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold cursor-pointer"
              onClick={() => { setShowModal(false); clear(); }}
            >×</button>

            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              {cancelled ? '⚠️ Resumen Parcial' : 'Resumen Completo'} —{' '}
              {type === 'grupo' ? 'Grupos' : type === 'agregar' ? 'Participantes' : 'Mensajes'}
            </h2>

            {cancelled && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ El proceso fue detenido manualmente. Los resultados mostrados son parciales.
                </p>
              </div>
            )}

            {/* Botón Excel según tipo */}
            {type === 'grupo' && createdGroups.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors cursor-pointer"
                  onClick={handleDownloadExcelGrupos}
                >
                  📥 Descargar Excel {cancelled ? '(Parcial)' : ''}
                </button>
              </div>
            )}

            {type === 'agregar' && addedResults.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors cursor-pointer"
                  onClick={handleDownloadExcelAgregar}
                >
                  📥 Descargar Excel {cancelled ? '(Parcial)' : ''}
                </button>
              </div>
            )}

            {/* Tabla */}
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th className="py-2 px-3 border-b text-sm font-semibold text-gray-600">Teléfono</th>
                    <th className="py-2 px-3 border-b text-sm font-semibold text-gray-600">Estado</th>
                    {type === 'agregar' && hasAdminCol && (
                      <th className="py-2 px-3 border-b text-sm font-semibold text-gray-600">Admin</th>
                    )}
                    {type === 'agregar' && (
                      <th className="py-2 px-3 border-b text-sm font-semibold text-gray-600">Motivo</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Tipo mensaje / grupo */}
                  {type !== 'agregar' && results.map((r, i) => (
                    <tr key={(r.telefono || r.grupo || '') + i} className="border-b last:border-0">
                      <td className="py-1 px-3 font-mono text-sm">
                        {type === 'grupo' ? r.grupo : r.telefono}
                      </td>
                      <td className={`py-1 px-3 text-sm font-semibold ${r.status === 'enviado' ? 'text-green-600' : 'text-red-600'}`}>
                        {r.status === 'enviado' ? (type === 'grupo' ? 'Creado' : 'Enviado') : 'Error'}
                      </td>
                    </tr>
                  ))}

                  {/* Tipo agregar */}
                  {type === 'agregar' && addedResults.map((r: AddedResult, i: number) => (
                    <tr key={r.telefono + i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-1.5 px-3 font-mono text-sm">{r.telefono}</td>
                      <td className={`py-1.5 px-3 text-sm font-semibold ${r.status === 'agregado' ? 'text-green-600' : 'text-red-500'}`}>
                        {r.status === 'agregado' ? 'Agregado' : 'Error'}
                      </td>
                      {hasAdminCol && (
                        <td className="py-1.5 px-3">
                          {!r.makeAdmin ? (
                            <span className="text-gray-400 text-xs">—</span>
                          ) : r.adminStatus === 'promovido' ? (
                            <span className="flex items-center gap-1 text-purple-700 text-xs font-semibold">
                              <ShieldCheck size={13} /> Admin
                            </span>
                          ) : r.adminStatus === 'error_al_promover' ? (
                            <span className="text-orange-500 text-xs">Error al promover</span>
                          ) : (
                            <span className="text-gray-400 text-xs">No aplicó</span>
                          )}
                        </td>
                      )}
                      <td className="py-1.5 px-3 text-gray-500 text-xs">{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end border-t pt-4">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors cursor-pointer"
                onClick={() => { setShowModal(false); clear(); }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;