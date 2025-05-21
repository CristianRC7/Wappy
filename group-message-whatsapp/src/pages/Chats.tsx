import React, { useEffect, useState, useRef } from 'react';
import API_URL from '../Config';
import { io, Socket } from 'socket.io-client';

interface Message {
  fromMe: boolean;
  text: string;
  timestamp: number;
}

interface Chat {
  number: string;
  messages: Message[];
}

const Chats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [loading, setLoading] = useState(false);

  // Conexión socket.io solo una vez
  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;
    socket.on('new-message', (data: { number: string; text: string; timestamp: number; fromMe?: boolean }) => {
      if (data.number === selected) {
        setMessages(prev => [...prev, { fromMe: !!data.fromMe, text: data.text, timestamp: data.timestamp }]);
      }
      setChats(prev => {
        if (prev.some(c => c.number === data.number)) return prev;
        return [...prev, { number: data.number, messages: [] }];
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [selected]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/chats`)
      .then(res => res.json())
      .then(data => setChats(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) {
      setLoading(true);
      fetch(`${API_URL}/api/chats/${selected}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .finally(() => setLoading(false));
    }
  }, [selected]);

  const handleSend = async () => {
    if (!selected || !newMessage.trim()) return;
    setSending(true);
    try {
      await fetch(`${API_URL}/api/chats/${selected}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '80vh', border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ width: 250, borderRight: '1px solid #eee', overflowY: 'auto' }}>
        <h3 style={{ padding: 16, borderBottom: '1px solid #eee' }}>Chats</h3>
        {loading && <div style={{ padding: 16, color: '#888' }}>Cargando...</div>}
        {!loading && chats.length === 0 && <div style={{ padding: 16 }}>No hay chats</div>}
        {chats.map(chat => (
          <div
            key={chat.number}
            style={{
              padding: 16,
              cursor: 'pointer',
              background: selected === chat.number ? '#e0e7ff' : undefined
            }}
            onClick={() => setSelected(chat.number)}
          >
            {chat.number}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <>
            <h4>Chat con {selected}</h4>
            <div style={{ marginTop: 16, flex: 1, overflowY: 'auto' }}>
              {loading && <div style={{ color: '#888' }}>Cargando mensajes...</div>}
              {!loading && messages.length === 0 && <div>No hay mensajes</div>}
              {messages.map((msg, idx) => (
                <div key={idx} style={{ textAlign: msg.fromMe ? 'right' : 'left', margin: '8px 0' }}>
                  <span style={{
                    display: 'inline-block',
                    background: msg.fromMe ? '#dbeafe' : '#f3f4f6',
                    padding: '8px 12px',
                    borderRadius: 16,
                    maxWidth: 300
                  }}>{msg.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Escribe un mensaje..."
                style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                style={{ padding: '8px 16px', borderRadius: 8, background: sending ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', minWidth: 80 }}
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ color: '#888' }}>Selecciona un chat</div>
        )}
      </div>
    </div>
  );
};

export default Chats; 