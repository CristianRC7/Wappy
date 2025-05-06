import React, { useRef, useState } from 'react';
import { UploadCloud, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
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
        />
      </div>
      {fileName && (
        <div className="flex items-center gap-2 mt-3 bg-blue-50 border border-blue-200 rounded px-3 py-2">
          <span className="text-blue-700 font-medium truncate max-w-xs">{fileName}</span>
          <button onClick={handleRemoveFile} className="ml-2 text-red-500 hover:text-red-700 cursor-pointer">
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
              className="accent-blue-600"
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
              className="accent-blue-600"
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
            />
          )}
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
            />
          </div>
          <div className="flex justify-center mt-4">
            <button
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              type="button"
            >
              <Users size={24} />
              Crear Grupos
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Group;
