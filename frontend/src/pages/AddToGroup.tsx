import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, XCircle, Users, RefreshCw, ShieldCheck } from 'lucide-react';
import { alert } from '../components/Alert';
import Papa from 'papaparse';
import { useNotification } from '../context/NotificationContext';
import type { AddedResult } from '../context/NotificationContext';
import API_URL from '../Config';

interface Group {
  id: string;
  name: string;
  participantsCount: number;
}

interface CsvRow {
  telefono: string;
  makeAdmin: boolean;
}

function AddToGroup() {
  const [groups, setGroups]               = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [dragActive, setDragActive]       = useState(false);
  const [fileName, setFileName]           = useState<string | null>(null);
  const [csvRows, setCsvRows]             = useState<CsvRow[]>([]);
  const [hasAdminColumn, setHasAdminColumn] = useState(false);
  const [waitTime, setWaitTime]           = useState(25);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();
  const bloqueado    = notification.sending || notification.finished;

  // ── Cargar grupos ──────────────────────────────────────────────────────────
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch(`${API_URL}/api/groups`);
      if (!res.ok) throw new Error();
      setGroups(await res.json());
    } catch {
      alert.error('No se pudieron cargar los grupos. ¿Hay sesión activa?');
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function parseAdminFlag(value: string | undefined | null): boolean {
    if (!value) return false;
    const v = String(value).trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'si' || v === 'sí';
  }

  const clearFile = () => {
    setFileName(null);
    setCsvRows([]);
    setHasAdminColumn(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Manejo de CSV ──────────────────────────────────────────────────────────
  const handleFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      alert.error('Solo se permite archivo CSV (UTF-8, delimitado por comas)');
      return;
    }

    Papa.parse(file, {
      header: true,
      encoding: 'utf-8',
      skipEmptyLines: true,
      complete: (parsed) => {
        const fields      = parsed.meta.fields || [];
        const lowerFields = fields.map((f: string) => f.toLowerCase().trim());

        if (!lowerFields.includes('telefono')) {
          alert.error('El CSV debe tener una columna llamada "telefono"');
          clearFile();
          return;
        }

        const adminColName = fields.find((f: string) => f.toLowerCase().trim() === 'admin') ?? null;
        setHasAdminColumn(!!adminColName);

        const rows: CsvRow[] = (parsed.data as Record<string, string>[])
          .map(row => {
            const telKey   = Object.keys(row).find(k => k.toLowerCase().trim() === 'telefono') ?? 'telefono';
            const adminKey = adminColName
              ? Object.keys(row).find(k => k.toLowerCase().trim() === 'admin')
              : null;
            return {
              telefono:  (row[telKey] ?? '').trim(),
              makeAdmin: adminKey ? parseAdminFlag(row[adminKey]) : false,
            };
          })
          .filter(r => r.telefono !== '');

        if (rows.length === 0) {
          alert.error('El CSV no tiene filas válidas con número de teléfono');
          clearFile();
          return;
        }

        setCsvRows(rows);
        setFileName(file.name);
      },
      error: () => { alert.error('Error al leer el archivo CSV'); clearFile(); },
    });
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(false); };
  const handleDrop      = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files); };

  // ── Proceso principal ──────────────────────────────────────────────────────
  const handleAddToGroup = async () => {
    if (!selectedGroup) {
      alert.error('Selecciona un grupo');
      return;
    }
    if (csvRows.length === 0) {
      alert.error('Debes cargar un archivo CSV válido');
      return;
    }
    if (waitTime < 25) {
      alert.error('El tiempo de espera entre adiciones debe ser al menos 25 segundos');
      return;
    }

    notification.start(csvRows.length, 'agregar');
    const cancelRef    = notification.getCancelRef();
    const localResults: AddedResult[] = [];

    try {
      for (let i = 0; i < csvRows.length; i++) {
        if (cancelRef.current) {
          console.log('✋ Proceso cancelado en participante', i + 1);
          break;
        }

        const row = csvRows[i];
        notification.update(row.telefono, i + 1);

        try {
          const res  = await fetch(`${API_URL}/api/add-to-group`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              groupId:  selectedGroup,
              phones:   [{ telefono: row.telefono, makeAdmin: row.makeAdmin }],
              waitTime,
            }),
          });
          const data = await res.json();
          const r    = data.results?.[0];

          const result: AddedResult = {
            telefono:    row.telefono,
            status:      r?.status      ?? 'error',
            reason:      r?.reason      ?? '',
            makeAdmin:   row.makeAdmin,
            adminStatus: r?.adminStatus ?? null,
          };
          localResults.push(result);
          notification.addResult({
            telefono: row.telefono,
            status:   result.status === 'agregado' ? 'enviado' : 'error',
          });
        } catch {
          const result: AddedResult = {
            telefono:    row.telefono,
            status:      'error',
            reason:      'Error de red',
            makeAdmin:   row.makeAdmin,
            adminStatus: null,
          };
          localResults.push(result);
          notification.addResult({ telefono: row.telefono, status: 'error' });
        }

        if (cancelRef.current) {
          console.log('✋ Proceso cancelado, deteniendo espera');
          break;
        }

        if (i < csvRows.length - 1) {
          await new Promise(res => setTimeout(res, waitTime * 1000));
        }
      }

      // Guardar resultados detallados para el Excel en el modal
      notification.setAddedResults(localResults);
      console.log('🏁 Finalizando proceso de adición al grupo');
      notification.finish();
    } catch (error) {
      console.error('Error durante la adición:', error);
      alert.error('Error de red al agregar participantes');
      notification.setAddedResults(localResults);
      notification.finish();
    }
  };

  const selectedGroupName = groups.find(g => g.id === selectedGroup)?.name ?? '';
  const adminCount        = csvRows.filter(r => r.makeAdmin).length;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md relative">

      {/* Overlay de bloqueo igual que Message.tsx */}
      {bloqueado && (
        <div className="absolute inset-0 bg-white bg-opacity-60 z-20 flex items-center justify-center cursor-not-allowed select-none">
          <span className="text-blue-700 text-lg font-semibold animate-pulse">
            {notification.sending ? 'Agregando participantes...' : 'Proceso finalizado...'}
          </span>
        </div>
      )}

      <h2 id="atg-title" className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <Users size={26} /> Agregar a Grupo
      </h2>

      {/* ── Selector de grupo ────────────────────────────────────────────── */}
      <div id="atg-group-selector" className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="font-medium text-gray-700">Seleccionar grupo</label>
          <button
            onClick={fetchGroups}
            disabled={loadingGroups || bloqueado}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingGroups ? 'animate-spin' : ''} />
            {loadingGroups ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {groups.length === 0 && !loadingGroups ? (
          <p className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
            No se encontraron grupos. Asegúrate de tener sesión activa.
          </p>
        ) : (
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            disabled={loadingGroups || bloqueado}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">— Elige un grupo —</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.participantsCount} miembros)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Subir CSV ────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">Archivo CSV</label>

        <div id="atg-csv-info" className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-1">Columnas del CSV:</p>
          <p>
            <span className="font-mono bg-blue-100 px-1 rounded">telefono</span>
            {' '}— <span className="text-red-600 font-medium">obligatoria</span>
          </p>
          <p className="mt-1">
            <span className="font-mono bg-blue-100 px-1 rounded">admin</span>
            {' '}— opcional. Usa <span className="font-mono">true</span> para promover como admin, deja vacío o pon <span className="font-mono">false</span> para no hacerlo.
          </p>
        </div>

        <div
          id="atg-csv-upload"
          className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={32} className="text-blue-500 shrink-0" />
          <span className="text-gray-700">Arrastra y suelta un archivo CSV aquí o haz clic para seleccionar</span>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,text/csv"
            onChange={e => handleFile(e.target.files)}
            disabled={bloqueado}
          />
        </div>

        {fileName && (
          <div className="flex items-center gap-2 mt-3 bg-blue-50 border border-blue-200 rounded px-3 py-2">
            <span className="text-blue-700 font-medium truncate flex-1">{fileName}</span>
            <span className="text-gray-500 text-sm">{csvRows.length} contactos</span>
            {hasAdminColumn && adminCount > 0 && (
              <span className="flex items-center gap-1 text-purple-700 text-sm font-medium">
                <ShieldCheck size={14} />
                {adminCount} admin{adminCount > 1 ? 's' : ''}
              </span>
            )}
            <button onClick={clearFile} disabled={bloqueado} className="text-red-500 hover:text-red-700 cursor-pointer">
              <XCircle size={20} />
            </button>
          </div>
        )}

        {hasAdminColumn && adminCount === 0 && fileName && (
          <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
            Columna <span className="font-mono">admin</span> detectada pero ningún contacto tiene <span className="font-mono">true</span>. Nadie será promovido.
          </p>
        )}
        {!hasAdminColumn && fileName && (
          <p className="mt-2 text-sm text-gray-500">
            Sin columna <span className="font-mono">admin</span>: ningún contacto será promovido.
          </p>
        )}
      </div>

      {/* ── Tiempo de espera ─────────────────────────────────────────────── */}
      <div id="atg-wait-time" className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Tiempo de espera entre adiciones (segundos)
        </label>
        <input
          type="number"
          min={25}
          value={waitTime}
          onChange={e => setWaitTime(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={bloqueado}
        />
        <p className="text-xs text-gray-500 mt-1">Mínimo recomendado: 25 segundos para evitar bloqueos.</p>
      </div>

      {/* ── Botón principal ───────────────────────────────────────────────── */}
      {csvRows.length > 0 && selectedGroup && (
        <div id="atg-add-btn" className="flex justify-center mt-4">
          <button
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleAddToGroup}
            disabled={bloqueado}
          >
            {notification.sending ? (
              <span className="w-6 h-6 border-4 border-white border-t-blue-300 rounded-full animate-spin inline-block" />
            ) : (
              <Users size={24} />
            )}
            {notification.sending ? 'Agregando...' : `Agregar a "${selectedGroupName}"`}
          </button>
        </div>
      )}
    </div>
  );
}

export default AddToGroup;