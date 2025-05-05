// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

function Message() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [waitTime, setWaitTime] = useState(25);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [caretPos, setCaretPos] = useState(0);
  const [preview, setPreview] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      toast.error('Solo se permite un archivo CSV (UTF-8, delimitado por comas)');
      return false;
    }
    return true;
  };

  const checkTelefonoColumn = (file: File) => {
    Papa.parse(file, {
      header: true,
      encoding: 'utf-8',
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.map(f => f.toLowerCase()).includes('telefono')) {
          setFileName(file.name);
          setCsvFields(results.meta.fields);
          setCsvRows(results.data);
        } else {
          toast.error('El archivo CSV debe contener una columna llamada "telefono"');
          setFileName(null);
          setCsvFields([]);
          setCsvRows([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
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
  };

  const handleFile = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (validateFile(file)) {
      checkTelefonoColumn(file);
    } else {
      setFileName(null);
      setCsvFields([]);
      setCsvRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    const pos = e.target.selectionStart;
    setCaretPos(pos);
    const lastAt = value.lastIndexOf('@', pos - 1);
    if (lastAt !== -1) {
      const afterAt = value.slice(lastAt + 1, pos);
      if (/^[\w]*$/.test(afterAt)) {
        setSuggestions(csvFields.filter(f => f.toLowerCase().startsWith(afterAt.toLowerCase())));
        setShowSuggestions(true);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (field: string) => {
    if (!textareaRef.current) return;
    const value = message;
    const pos = caretPos;
    const lastAt = value.lastIndexOf('@', pos - 1);
    if (lastAt !== -1) {
      const before = value.slice(0, lastAt + 1);
      const after = value.slice(pos);
      const newValue = before + field + ' ' + after;
      setMessage(newValue);
      setShowSuggestions(false);
      setTimeout(() => {
        textareaRef.current!.focus();
        textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd = (before + field + ' ').length;
      }, 0);
    }
  };

  useEffect(() => {
    if (csvRows.length > 0 && csvFields.length > 0 && message) {
      const randomRow = csvRows[Math.floor(Math.random() * csvRows.length)];
      let previewMsg = message;
      csvFields.forEach(f => {
        const regex = new RegExp(`@${f}`, 'g');
        previewMsg = previewMsg.replace(regex, randomRow[f] || '');
      });
      setPreview(previewMsg);
    } else {
      setPreview('');
    }
  }, [message, csvRows, csvFields]);

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

  const handleRemoveFile = () => {
    setFileName(null);
    setCsvFields([]);
    setCsvRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Enviar mensaje</h2>
      <label className="block mb-2 font-medium text-gray-700">Mensaje</label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          placeholder="Escribe tu mensaje aquí..."
          value={message}
          onChange={handleTextareaChange}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onClick={handleTextareaChange}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 left-0 bg-white border border-blue-200 rounded shadow w-60 max-h-40 overflow-auto mt-1">
            {suggestions.map((s) => (
              <div
                key={s}
                className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-700"
                onMouseDown={() => handleSuggestionClick(s)}
              >
                @{s}
              </div>
            ))}
          </div>
        )}
      </div>
      {preview && (
        <div className="mb-4 mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
          <span className="block text-gray-500 text-xs mb-1">Vista previa con datos aleatorios:</span>
          <span className="text-gray-800 whitespace-pre-line">{preview}</span>
        </div>
      )}
      <label className="block mb-2 font-medium text-gray-700">Tiempo de espera entre mensajes (ms)</label>
      <input
        type="number"
        min={25}
        value={waitTime}
        onChange={e => setWaitTime(Number(e.target.value))}
        className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
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
    </div>
  );
}

export default Message;
