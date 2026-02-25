import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, XCircle, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import API_URL from '../Config';

interface Group {
  id: string;
  name: string;
  participantsCount: number;
}

interface PhoneRow {
  telefono: string;
  [key: string]: string | undefined;
}

interface AddResult {
  telefono: string;
  status: 'agregado' | 'error';
  reason?: string;
}

interface ProcessState {
  running: boolean;
  current: string;
  index: number;
  total: number;
  results: AddResult[];
  finished: boolean;
  cancelled: boolean;
}

const AddToGroup: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvRows, setCsvRows] = useState<PhoneRow[]>([]);
  const [waitTime, setWaitTime] = useState(25);
  const [dragActive, setDragActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [process, setProcess] = useState<ProcessState>({
    running: false,
    current: '',
    index: 0,
    total: 0,
    results: [],
    finished: false,
    cancelled: false,
  });

  const cancelRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Cargar grupos al montar ──────────────────────────────────────────────
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch(`${API_URL}/api/groups`);
      if (!res.ok) throw new Error('Error al obtener grupos');
      const data: Group[] = await res.json();
      setGroups(data);
    } catch (err) {
      toast.error('No se pudieron cargar los grupos. Verifica la sesión de WhatsApp.');
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ── Manejo de CSV ────────────────────────────────────────────────────────
  const parseCSV = (file: File) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      toast.error('Solo se permite un archivo CSV (UTF-8, delimitado por comas)');
      return;
    }
    Papa.parse(file, {
      header: true,
      encoding: 'utf-8',
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields || [];
        const hasPhone = fields.map(f => f.toLowerCase()).includes('telefono');
        if (!hasPhone) {
          toast.error('El CSV debe tener una columna llamada "telefono"');
          clearFile();
          return;
        }
        const rows = (results.data as PhoneRow[]).filter(r => r.telefono?.trim());
        if (rows.length === 0) {
          toast.error('El CSV no contiene números válidos en la columna "telefono"');
          clearFile();
          return;
        }
        setCsvRows(rows);
        setFileName(file.name);
        toast.success(`${rows.length} contacto(s) cargado(s) correctamente`);
      },
      error: () => {
        toast.error('Error al leer el archivo CSV');
        clearFile();
      },
    });
  };

  const clearFile = () => {
    setFileName(null);
    setCsvRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseCSV(file);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseCSV(file);
  };

  // ── Proceso de agregado ──────────────────────────────────────────────────
  const handleAddToGroup = async () => {
    if (!selectedGroup) { toast.error('Selecciona un grupo primero'); return; }
    if (csvRows.length === 0) { toast.error('Carga un CSV válido con teléfonos'); return; }
    if (waitTime < 25) { toast.error('El tiempo mínimo de espera es 25 segundos'); return; }

    cancelRef.current = false;
    setProcess({
      running: true,
      current: '',
      index: 0,
      total: csvRows.length,
      results: [],
      finished: false,
      cancelled: false,
    });

    const collected: AddResult[] = [];

    for (let i = 0; i < csvRows.length; i++) {
      if (cancelRef.current) {
        console.log('✋ Proceso cancelado en', i + 1);
        break;
      }

      const phone = csvRows[i].telefono.trim();
      setProcess(prev => ({ ...prev, current: phone, index: i + 1 }));

      try {
        const res = await fetch(`${API_URL}/api/add-to-group`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: selectedGroup,
            phones: [{ telefono: phone }],
            waitTime: 0, // el delay lo manejamos aquí en el frontend
          }),
        });
        const data = await res.json();
        const result: AddResult = data.results?.[0] ?? { telefono: phone, status: 'error', reason: 'Sin respuesta' };
        collected.push(result);
        setProcess(prev => ({ ...prev, results: [...prev.results, result] }));
      } catch {
        const result: AddResult = { telefono: phone, status: 'error', reason: 'Error de red' };
        collected.push(result);
        setProcess(prev => ({ ...prev, results: [...prev.results, result] }));
      }

      if (cancelRef.current) break;

      // Esperar entre participantes (menos el último)
      if (i < csvRows.length - 1) {
        await new Promise(r => setTimeout(r, waitTime * 1000));
      }
    }

    setProcess(prev => ({
      ...prev,
      running: false,
      finished: true,
      cancelled: cancelRef.current,
    }));
    cancelRef.current = false;
    setShowModal(true);
  };

  const handleCancel = () => {
    if (window.confirm('¿Detener el proceso? Se generará un reporte parcial con los resultados actuales.')) {
      cancelRef.current = true;
      setProcess(prev => ({ ...prev, cancelled: true }));
    }
  };

  const handleReset = () => {
    setProcess({ running: false, current: '', index: 0, total: 0, results: [], finished: false, cancelled: false });
    setShowModal(false);
    clearFile();
    setSelectedGroup('');
  };

  // ── Descarga de Excel ────────────────────────────────────────────────────
  const handleDownloadExcel = () => {
    if (!process.results.length) return;
    const groupName = groups.find(g => g.id === selectedGroup)?.name || selectedGroup;
    const data = process.results.map(r => ({
      Teléfono: r.telefono,
      Estado: r.status === 'agregado' ? 'Agregado' : 'Error',
      Detalle: r.reason || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    // Ajustar anchos de columna
    ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte_grupo_${groupName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  const successCount = process.results.filter(r => r.status === 'agregado').length;
  const errorCount = process.results.filter(r => r.status === 'error').length;
  const selectedGroupName = groups.find(g => g.id === selectedGroup)?.name || '';
  const isBlocked = process.running || process.finished;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md relative">

      {/* Overlay de carga */}
      {process.running && (
        <div className="absolute inset-0 bg-white bg-opacity-60 z-20 flex items-center justify-center cursor-not-allowed select-none rounded-lg">
          <span className="text-blue-700 text-lg font-semibold animate-pulse">Agregando participantes...</span>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
        <Users size={26} /> Agregar a Grupo
      </h2>

      {/* ── Selección de grupo ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="font-medium text-gray-700">Seleccionar grupo</label>
          <button
            onClick={fetchGroups}
            disabled={loadingGroups || isBlocked}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 cursor-pointer"
            title="Recargar grupos"
          >
            <RefreshCw size={15} className={loadingGroups ? 'animate-spin' : ''} />
            {loadingGroups ? 'Cargando...' : 'Recargar'}
          </button>
        </div>

        {loadingGroups ? (
          <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm">
            Cargando grupos...
          </div>
        ) : (
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            disabled={isBlocked}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:opacity-60"
          >
            <option value="">-- Selecciona un grupo --</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.participantsCount} participantes)
              </option>
            ))}
          </select>
        )}

        {groups.length === 0 && !loadingGroups && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ No se encontraron grupos. Asegúrate de tener la sesión activa.
          </p>
        )}
      </div>

      {/* ── Carga de CSV ── */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Archivo CSV con teléfonos
          <span className="text-xs text-gray-500 ml-2">(requiere columna "telefono")</span>
        </label>
        <div
          className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'
          } ${isBlocked ? 'opacity-60 cursor-not-allowed' : ''}`}
          onDragOver={!isBlocked ? handleDragOver : undefined}
          onDragLeave={!isBlocked ? handleDragLeave : undefined}
          onDrop={!isBlocked ? handleDrop : undefined}
          onClick={!isBlocked ? () => fileInputRef.current?.click() : undefined}
        >
          <UploadCloud size={32} className="text-blue-500 shrink-0" />
          <span className="text-gray-700 text-sm">Arrastra un CSV o haz clic para seleccionar</span>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,text/csv"
            onChange={handleInputChange}
            disabled={isBlocked}
          />
        </div>

        {fileName && (
          <div className="flex items-center gap-2 mt-3 bg-blue-50 border border-blue-200 rounded px-3 py-2">
            <span className="text-blue-700 font-medium truncate max-w-xs text-sm">{fileName}</span>
            <span className="text-gray-500 text-xs ml-1">({csvRows.length} contactos)</span>
            <button
              onClick={clearFile}
              disabled={isBlocked}
              className="ml-auto text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ── Tiempo de espera ── */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Tiempo de espera entre cada agregado (segundos)
        </label>
        <input
          type="number"
          min={25}
          value={waitTime}
          onChange={e => setWaitTime(Number(e.target.value))}
          disabled={isBlocked}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
        />
        {waitTime < 25 && (
          <p className="text-xs text-red-500 mt-1">⚠️ El mínimo recomendado es 25 segundos para evitar bloqueos.</p>
        )}
      </div>

      {/* ── Resumen de lo que se hará ── */}
      {selectedGroup && csvRows.length > 0 && !isBlocked && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-1">Resumen de la operación:</p>
          <p>• Grupo: <span className="font-mono">{selectedGroupName}</span></p>
          <p>• Contactos a agregar: <span className="font-bold">{csvRows.length}</span></p>
          <p>• Tiempo estimado: ~{Math.ceil((csvRows.length * waitTime) / 60)} minutos</p>
        </div>
      )}

      {/* ── Botón de acción ── */}
      {!process.finished && (
        <div className="flex justify-center mt-2">
          <button
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleAddToGroup}
            disabled={!selectedGroup || csvRows.length === 0 || process.running || waitTime < 25}
          >
            {process.running ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Agregando...
              </>
            ) : (
              <>
                <Users size={22} />
                Agregar al Grupo
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Banner de finalizado ── */}
      {process.finished && !showModal && (
        <div
          className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => setShowModal(true)}
        >
          <p className="font-semibold text-green-700">
            {process.cancelled ? '⚠️ Proceso detenido' : '✅ ¡Proceso finalizado!'}
          </p>
          <p className="text-sm text-green-600 mt-1">
            Agregados: <strong>{successCount}</strong> &nbsp;|&nbsp; Errores: <strong>{errorCount}</strong>
          </p>
          <p className="text-xs text-green-500 mt-1">Haz clic para ver el reporte completo</p>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          Notificación flotante de progreso
      ──────────────────────────────────────────────────────────────────── */}
      {process.running && (
        <div className="fixed bottom-6 right-6 z-[100] bg-blue-700 text-white px-6 py-4 rounded-xl shadow-lg flex flex-col gap-3 min-w-[300px]">
          <span className="font-semibold text-lg flex items-center gap-2">
            Agregando participantes...
            {!process.cancelled && (
              <span className="w-5 h-5 border-4 border-white border-t-blue-300 rounded-full animate-spin inline-block" />
            )}
          </span>
          {process.cancelled && (
            <span className="text-sm text-yellow-300 font-semibold">⚠️ Deteniendo proceso...</span>
          )}
          <span className="text-sm">
            Número actual: <span className="font-mono">{process.current || '...'}</span>
          </span>
          <span className="text-xs text-blue-100">
            Progreso: {process.index} de {process.total}
          </span>
          {/* Barra de progreso */}
          <div className="w-full bg-blue-500 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${process.total > 0 ? (process.index / process.total) * 100 : 0}%` }}
            />
          </div>
          <div className="pt-2 border-t border-blue-500">
            <button
              onClick={handleCancel}
              disabled={process.cancelled}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              {process.cancelled ? 'Deteniendo...' : '🛑 Detener Proceso'}
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          Modal de reporte final
      ──────────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative mx-4">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold cursor-pointer"
              onClick={() => setShowModal(false)}
            >×</button>

            <h2 className="text-2xl font-bold mb-1 text-blue-700">
              {process.cancelled ? '⚠️ Reporte Parcial' : '✅ Reporte Final'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Grupo: <span className="font-semibold text-gray-700">{selectedGroupName}</span>
            </p>

            {process.cancelled && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
                ⚠️ El proceso fue detenido manualmente. Los resultados son parciales.
              </div>
            )}

            {/* Estadísticas */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs text-green-500">Agregados</p>
              </div>
              <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{errorCount}</p>
                <p className="text-xs text-red-400">Errores</p>
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{process.results.length}</p>
                <p className="text-xs text-blue-400">Total procesados</p>
              </div>
            </div>

            {/* Botón descargar Excel */}
            {process.results.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2 text-sm"
                  onClick={handleDownloadExcel}
                >
                  📥 Descargar Excel {process.cancelled ? '(Parcial)' : ''}
                </button>
              </div>
            )}

            {/* Tabla de resultados */}
            <div className="max-h-72 overflow-y-auto border rounded-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 border-b font-medium text-gray-600">Teléfono</th>
                    <th className="py-2 px-3 border-b font-medium text-gray-600">Estado</th>
                    <th className="py-2 px-3 border-b font-medium text-gray-600">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {process.results.map((r, i) => (
                    <tr key={r.telefono + i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-1.5 px-3 font-mono text-xs">{r.telefono}</td>
                      <td className={`py-1.5 px-3 font-semibold text-xs ${r.status === 'agregado' ? 'text-green-600' : 'text-red-500'}`}>
                        {r.status === 'agregado' ? '✅ Agregado' : '❌ Error'}
                      </td>
                      <td className="py-1.5 px-3 text-xs text-gray-500">{r.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botones inferiores */}
            <div className="mt-4 flex gap-3 justify-end">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                onClick={handleReset}
              >
                Nueva operación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToGroup;
