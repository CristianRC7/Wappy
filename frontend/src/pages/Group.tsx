import React, { useRef, useState } from 'react';
import { UploadCloud, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import API_URL from '../Config';
import { useNotification } from '../context/NotificationContext';

function Group() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string | undefined>[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [descEnabled, setDescEnabled] = useState(false);
  const [groupDesc, setGroupDesc] = useState('');
  const [descPreview, setDescPreview] = useState('');
  const [focus, setFocus] = useState<'title' | 'desc' | null>(null);
  const [addAdmin, setAddAdmin] = useState(false);
  const [adminNumber, setAdminNumber] = useState('');
  const [waitTime, setWaitTime] = useState(25);
  const [columnTemplate, setColumnTemplate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();

  const validateFile = (file: File) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      toast.error('Solo se permite un archivo CSV (UTF-8, delimitado por comas)');
      return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files);
  };

  const handleFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (validateFile(file)) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        encoding: 'utf-8',
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setCsvFields(results.meta.fields);
            setCsvRows(results.data as Record<string, string | undefined>[]);
          } else {
            setCsvFields([]);
            setCsvRows([]);
          }
        },
        error: () => {
          toast.error('Error al leer el archivo CSV');
          setFileName(null);
          setCsvFields([]);
          setCsvRows([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      });
    } else {
      setFileName(null);
      setCsvFields([]);
      setCsvRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    setCsvFields([]);
    setCsvRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGroupTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupTitle(e.target.value);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGroupDesc(e.target.value);
  };

  const handleDescCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescEnabled(e.target.checked);
    if (!e.target.checked) setGroupDesc('');
  };

const handleCreateGroups = async () => {
  if (!groupTitle || csvFields.length === 0 || csvRows.length === 0) {
    toast.error('Debes subir un CSV válido y definir el nombre del grupo.');
    return;
  }
  
  notification.start(csvRows.length, 'grupo');
  const createdGroups: Array<Record<string, string>> = [];
  
  // Obtener la referencia de cancelación
  const cancelRef = notification.getCancelRef();
  
  // Procesar columnas de la plantilla
  const columns = columnTemplate
    .split(',')
    .map(c => c.trim())
    .filter(c => c.startsWith('@'));
  
  try {
    for (let i = 0; i < csvRows.length; i++) {
      // Verificar cancelación ANTES de cada iteración
      if (cancelRef.current) {
        console.log('✋ Proceso cancelado por el usuario en grupo', i + 1);
        break;
      }

      const row = csvRows[i];
      
      // Reemplazar etiquetas en el nombre y descripción
      let title = groupTitle;
      let desc = groupDesc;
      csvFields.forEach(f => {
        const regex = new RegExp(`@${f}`, 'g');
        title = title.replace(regex, row[f] || '');
        if (descEnabled && desc) desc = desc.replace(regex, row[f] || '');
      });
      
      // Obtener los números de teléfono de la fila
      const participants: string[] = [];
      csvFields.forEach(f => {
        if (/tel|num|fono|cel/i.test(f)) {
          if (row[f]) participants.push(`${row[f]}@s.whatsapp.net`);
        }
      });
      
      if (addAdmin && adminNumber) {
        participants.push(`${adminNumber}@s.whatsapp.net`);
      }
      
      notification.update(title, i + 1);
      
      try {
        const res = await fetch(`${API_URL}/api/create-groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupTitle: title,
            groupDesc: desc,
            descEnabled,
            addAdmin,
            adminNumber,
            waitTime,
            csvFields,
            csvRows: [row],
          }),
        });
        
        const data = await res.json();
        
        if (data.success && Array.isArray(data.groups) && data.groups.length > 0) {
          const inviteCode = data.groups[0].inviteCode;
          const link = inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : '';
          
          // Construir objeto para el Excel según columnas elegidas
          const excelRow: Record<string, string> = {};
          columns.forEach(col => {
            const key = col.replace('@', '');
            excelRow[key] = row[key] || '';
          });
          excelRow['enlace'] = link;
          createdGroups.push(excelRow);
          
          notification.addResult({ grupo: title, status: 'enviado' });
        } else {
          notification.addResult({ grupo: title, status: 'error' });
        }
      } catch (error) {
        console.error(`Error creando grupo ${title}:`, error);
        notification.addResult({ grupo: title, status: 'error' });
      }
      
      // Verificar cancelación ANTES de esperar
      if (cancelRef.current) {
        console.log('✋ Proceso cancelado, deteniendo espera');
        break;
      }
      
      // Esperar el delay indicado solo si no es el último
      if (i < csvRows.length - 1) {
        await new Promise(res => setTimeout(res, Math.max(Number(waitTime) || 25, 25) * 1000));
      }
    }
    
    // Guardar los grupos creados (aunque sea parcial)
    if (createdGroups.length > 0) {
      console.log('💾 Guardando', createdGroups.length, 'grupos creados');
      notification.setCreatedGroups(createdGroups);
    }
    
    console.log('🏁 Finalizando proceso de grupos');
    notification.finish();
  } catch (error) {
    console.error('Error general en creación de grupos:', error);
    notification.finish();
    toast.error('Error de red o del servidor al crear los grupos.');
  }
};
  React.useEffect(() => {
    if (csvRows.length > 0 && csvFields.length > 0 && groupTitle) {
      const randomRow = csvRows[Math.floor(Math.random() * csvRows.length)];
      let previewTitle = groupTitle;
      csvFields.forEach(f => {
        const regex = new RegExp(`@${f}`, 'g');
        previewTitle = previewTitle.replace(regex, randomRow[f] || '');
      });
      setPreview(previewTitle);
    } else {
      setPreview('');
    }
  }, [groupTitle, csvRows, csvFields]);

  React.useEffect(() => {
    if (descEnabled && csvRows.length > 0 && csvFields.length > 0 && groupDesc) {
      const randomRow = csvRows[Math.floor(Math.random() * csvRows.length)];
      let previewDesc = groupDesc;
      csvFields.forEach(f => {
        const regex = new RegExp(`@${f}`, 'g');
        previewDesc = previewDesc.replace(regex, randomRow[f] || '');
      });
      setDescPreview(previewDesc);
    } else {
      setDescPreview('');
    }
  }, [groupDesc, descEnabled, csvRows, csvFields]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md relative">
      {notification.loading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 z-20 flex items-center justify-center cursor-not-allowed select-none">
          <span className="text-blue-700 text-lg font-semibold animate-pulse">Creando grupos...</span>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Subir archivo CSV</h2>
      <div
        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileClick}
      >
        <UploadCloud size={32} className="text-blue-500" />
        <span className="text-gray-700">Arrastra y suelta un archivo CSV aquí o haz clic para seleccionar</span>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,text/csv"
          onChange={handleInputChange}
          disabled={notification.loading}
        />
      </div>
      {fileName && (
        <div className="flex items-center gap-2 mt-3 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          <span className="text-blue-700 font-medium truncate max-w-xs">{fileName}</span>
          <button onClick={handleRemoveFile} className="ml-2 text-red-500 hover:text-red-700 cursor-pointer" disabled={notification.loading}>
            <XCircle size={20} />
          </button>
        </div>
      )}
      {csvFields.length > 0 && (
        <div className="mt-4">
          <span className="font-semibold text-gray-700">Etiquetas disponibles: </span>
          {csvFields.map((field) => (
            <span key={field} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-sm font-mono mr-2 mt-2">@{field}</span>
          ))}
        </div>
      )}
      {csvFields.length > 0 && (
        <div className="mt-6">
          <label className="block mb-2 font-medium text-gray-700">Título del grupo:</label>
          <input
            type="text"
            value={groupTitle}
            onChange={handleGroupTitleChange}
            onFocus={() => setFocus('title')}
            onBlur={() => setFocus(null)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ejemplo: Grupo de @nombre - @ciudad"
            disabled={notification.loading}
          />
        </div>
      )}
      {preview && focus === 'title' && (
        <div className="mb-4 mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
          <span className="block text-gray-500 text-xs mb-1">Ejemplo de nombre de grupo:</span>
          <span className="text-gray-800 whitespace-pre-line">{preview}</span>
        </div>
      )}
      {csvFields.length > 0 && (
        <div className="mt-6">
          <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
            <input
              type="checkbox"
              checked={descEnabled}
              onChange={handleDescCheck}
              className="accent-blue-600 cursor-pointer"
              disabled={notification.loading}
            />
            Descripción:
          </label>
          {descEnabled && (
            <>
              <textarea
                value={groupDesc}
                onChange={handleDescChange}
                onFocus={() => setFocus('desc')}
                onBlur={() => setFocus(null)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="Ejemplo: Bienvenidos a @nombre, grupo de @ciudad"
                rows={3}
                disabled={notification.loading}
              />
              {descPreview && focus === 'desc' && (
                <div className="mb-4 mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
                  <span className="block text-gray-500 text-xs mb-1">Ejemplo de descripción:</span>
                  <span className="text-gray-800 whitespace-pre-line">{descPreview}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {csvFields.length > 0 && (
        <div className="mt-6">
          <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
            <input
              type="checkbox"
              checked={addAdmin}
              onChange={e => setAddAdmin(e.target.checked)}
              className="accent-blue-600 cursor-pointer"
              disabled={notification.loading}
            />
            Agregar número como administrador de todos los grupos
          </label>
          {addAdmin && (
            <input
              type="text"
              value={adminNumber}
              onChange={e => {
                // Solo permitir números
                const val = e.target.value.replace(/\D/g, '');
                setAdminNumber(val);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ejemplo: 59175057788"
              maxLength={15}
              disabled={notification.loading}
            />
          )}
        </div>
      )}
      {csvFields.length > 0 && (
        <div className="mt-8 mb-4">
          <label className="block mb-2 font-medium text-gray-700">Columnas del Excel (usa etiquetas, separadas por coma):</label>
          <input
            type="text"
            value={columnTemplate}
            onChange={e => setColumnTemplate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ejemplo: @nombre, @ciudad, @telefono"
            disabled={notification.loading}
          />
          <span className="text-xs text-gray-500">Solo se incluirán las columnas aquí indicadas y el enlace de invitación.</span>
        </div>
      )}
      {csvFields.length > 0 && (
        <>
          <div className="mt-8">
            <label className="block mb-2 font-medium text-gray-700">Tiempo de espera entre mensajes (segundos)</label>
            <input
              type="number"
              min={25}
              value={waitTime}
              onChange={e => setWaitTime(Number(e.target.value))}
              className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={notification.loading}
            />
          </div>
          <div className="flex justify-center mt-4">
            <button
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              type="button"
              onClick={handleCreateGroups}
              disabled={notification.loading}
            >
              {notification.loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Creando Grupos...
                </>
              ) : (
                <>
                  <Users size={24} />
                  Crear Grupos
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Group;
