import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, XCircle, Send, Image as ImageIcon } from 'lucide-react';
import { alert } from '../components/Alert';
import Papa from 'papaparse';
import { useNotification } from '../context/NotificationContext';
import API_URL from '../Config';

function Message() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string | undefined>[]>([]);
  const [message, setMessage] = useState('');
  const [waitTime, setWaitTime] = useState(25);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [caretPos, setCaretPos] = useState(0);
  const [preview, setPreview] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const notification = useNotification();
  const bloqueado = notification.sending || notification.finished;

  const validateFile = (file: File) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      alert.error('Solo se permite un archivo CSV (UTF-8, delimitado por comas)');
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
          setCsvRows(results.data as Record<string, string | undefined>[]);
        } else {
          alert.error('El archivo CSV debe contener una columna llamada "telefono"');
          setFileName(null);
          setCsvFields([]);
          setCsvRows([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: () => {
        alert.error('Error al leer el archivo CSV');
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

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const validTypes = ['image/', 'video/', 'audio/'];
    const isValid = validTypes.some(type => file.type.startsWith(type));
    if (!isValid) {
      alert.error('Solo se permiten archivos de imagen, video o audio');
      if (mediaInputRef.current) mediaInputRef.current.value = '';
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert.error('El archivo no debe superar los 50MB');
      if (mediaInputRef.current) mediaInputRef.current.value = '';
      return;
    }
    setMediaFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => { setMediaPreview(e.target?.result as string); };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setMediaPreview('video');
    } else if (file.type.startsWith('audio/')) {
      setMediaPreview('audio');
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
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

  const handleDragOver  = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(false); };
  const handleDrop      = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files); };
  const handleFileClick = () => { fileInputRef.current?.click(); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { handleFile(e.target.files); };
  const handleRemoveFile  = () => {
    setFileName(null); setCsvFields([]); setCsvRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessages = async () => {
    if (!message || csvRows.length === 0) {
      alert.error('Debes cargar un archivo CSV válido y escribir un mensaje.');
      return;
    }
    if (waitTime < 25) {
      alert.error('El tiempo de espera entre mensajes debe ser al menos 25 segundos.');
      return;
    }

    setSending(true);
    notification.start(csvRows.length, 'mensaje');
    const cancelRef = notification.getCancelRef();

    try {
      if (mediaFile) {
        for (let i = 0; i < csvRows.length; i++) {
          if (cancelRef.current) break;
          const row = csvRows[i];
          notification.update(row['telefono'] || '', i + 1);
          const singleFormData = new FormData();
          singleFormData.append('media', mediaFile);
          let personalized = message;
          csvFields.forEach(f => {
            const regex = new RegExp(`@${f}`, 'g');
            personalized = personalized.replace(regex, row[f] || '');
          });
          singleFormData.append('data', JSON.stringify({
            messages: [{ telefono: row['telefono'], mensaje: personalized }],
            waitTime: waitTime * 1000
          }));
          try {
            const res  = await fetch(`${API_URL}/api/send-messages-media`, { method: 'POST', body: singleFormData });
            const data = await res.json();
            notification.addResult({ telefono: row['telefono'] || '', status: data.success ? 'enviado' : 'error' });
          } catch {
            notification.addResult({ telefono: row['telefono'] || '', status: 'error' });
          }
          if (cancelRef.current) break;
          if (i < csvRows.length - 1) await new Promise(res => setTimeout(res, waitTime * 1000));
        }
      } else {
        for (let i = 0; i < csvRows.length; i++) {
          if (cancelRef.current) break;
          const row = csvRows[i];
          let personalized = message;
          csvFields.forEach(f => {
            const regex = new RegExp(`@${f}`, 'g');
            personalized = personalized.replace(regex, row[f] || '');
          });
          notification.update(row['telefono'] || '', i + 1);
          try {
            const res  = await fetch(`${API_URL}/api/send-messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [{ telefono: row['telefono'], mensaje: personalized }],
                waitTime: waitTime * 1000
              })
            });
            const data = await res.json();
            notification.addResult({ telefono: row['telefono'] || '', status: data.success ? 'enviado' : 'error' });
          } catch {
            notification.addResult({ telefono: row['telefono'] || '', status: 'error' });
          }
          if (cancelRef.current) break;
          if (i < csvRows.length - 1) await new Promise(res => setTimeout(res, waitTime * 1000));
        }
      }
    } catch (error) {
      console.error('Error durante el envío:', error);
      alert.error('Error de red al enviar mensajes');
    } finally {
      setSending(false);
      notification.finish();
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md relative">
      {bloqueado && (
        <div className="absolute inset-0 bg-white bg-opacity-60 z-20 flex items-center justify-center cursor-not-allowed select-none">
          <span className="text-blue-700 text-lg font-semibold animate-pulse">Enviando mensajes...</span>
        </div>
      )}

      <h2 id="msg-title" className="text-2xl font-bold mb-4 text-blue-700">Enviar mensaje</h2>

      {/* ── Archivo multimedia ─────────────────────────────────────────── */}
      <div id="msg-media-section" className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">Archivo multimedia (opcional)</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mediaInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            disabled={bloqueado}
          >
            <ImageIcon size={20} />
            Seleccionar archivo
          </button>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleMediaChange}
            className="hidden"
            disabled={bloqueado}
          />
          {mediaFile && (
            <span className="text-sm text-gray-600 truncate max-w-xs">{mediaFile.name}</span>
          )}
        </div>

        {mediaPreview && (
          <div className="mt-3 relative inline-block">
            {mediaPreview !== 'video' && mediaPreview !== 'audio' ? (
              <img src={mediaPreview} alt="Preview" className="max-w-xs max-h-48 rounded-lg border-2 border-blue-200" />
            ) : (
              <div className="px-4 py-8 bg-gray-100 rounded-lg border-2 border-gray-300 text-center">
                <span className="text-gray-600 font-medium">
                  {mediaPreview === 'video' ? '🎥 Video seleccionado' : '🎵 Audio seleccionado'}
                </span>
              </div>
            )}
            <button
              onClick={handleRemoveMedia}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              disabled={bloqueado}
            >
              <XCircle size={20} />
            </button>
          </div>
        )}
        <span className="text-xs text-gray-500 block mt-2">
          {mediaFile
            ? (mediaFile.type.startsWith('audio/')
                ? 'Nota: Para audios, el mensaje no se enviará como caption.'
                : 'El mensaje se enviará como descripción del archivo.')
            : 'Soporta imágenes, videos y audios (máx. 50MB)'}
        </span>
      </div>

      {/* ── Textarea del mensaje ───────────────────────────────────────── */}
      <label className="block mb-2 font-medium text-gray-700">
        Mensaje {mediaFile && mediaFile.type.startsWith('audio/') ? '' : '(descripción)'}
      </label>
      <div id="msg-textarea" className="relative">
        <textarea
          ref={textareaRef}
          className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          placeholder="Escribe tu mensaje aquí... Usa @campo para personalizar"
          value={message}
          onChange={handleTextareaChange}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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

      {/* ── Tiempo de espera ──────────────────────────────────────────── */}
      <label className="block mb-2 font-medium text-gray-700">
        Tiempo de espera entre mensajes (segundos)
      </label>
      <input
        id="msg-wait-time"
        type="number"
        min={25}
        value={waitTime}
        onChange={e => setWaitTime(Number(e.target.value))}
        className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* ── Zona CSV ──────────────────────────────────────────────────── */}
      <div
        id="msg-csv-upload"
        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileClick}
      >
        <UploadCloud size={32} className="text-blue-500" />
        <span className="text-gray-700">
          Arrastra y suelta un archivo CSV aquí o haz clic para seleccionar
        </span>
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

      {/* ── Etiquetas disponibles ─────────────────────────────────────── */}
      {csvFields.length > 0 && (
        <div id="msg-tags" className="mt-4">
          <span className="font-semibold text-gray-700">Etiquetas disponibles: </span>
          {csvFields.map((field) => (
            <span
              key={field}
              className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-sm font-mono mr-2 mt-2"
            >
              @{field}
            </span>
          ))}
        </div>
      )}

      {/* ── Botón enviar ──────────────────────────────────────────────── */}
      {csvRows.length > 0 && message && (
        <div className="flex justify-center mt-8">
          <button
            id="msg-send-btn"
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleSendMessages}
            disabled={sending || bloqueado}
            style={{ minWidth: 220 }}
          >
            {sending ? (
              <span className="w-6 h-6 border-4 border-white border-t-blue-300 rounded-full animate-spin inline-block" />
            ) : (
              <Send size={24} />
            )}
            {sending ? 'Enviando...' : 'Enviar mensajes'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Message;