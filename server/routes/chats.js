const express = require('express');
const router = express.Router();
const { getSock } = require('./session');

// Almacenamiento temporal en memoria para los chats
const chats = {};

// Endpoint para obtener todos los chats (números únicos)
router.get('/chats', (req, res) => {
  const chatList = Object.keys(chats).map(number => ({
    number,
    messages: chats[number],
  }));
  res.json(chatList);
});

// Endpoint para obtener los mensajes de un número específico
router.get('/chats/:number', (req, res) => {
  const { number } = req.params;
  res.json(chats[number] || []);
});

// Endpoint para enviar un mensaje a un número
router.post('/chats/:number', async (req, res) => {
  const { number } = req.params;
  const { message, grupoId } = req.body;
  
  if (!grupoId) {
    return res.status(400).json({ error: 'grupoId es requerido' });
  }
  
  const sock = getSock(grupoId);
  if (!sock) {
    return res.status(500).json({ error: 'No hay sesión activa de WhatsApp para este grupo' });
  }
  try {
    await sock.sendMessage(`${number}@s.whatsapp.net`, { text: message });
    // Guardar el mensaje enviado en el historial
    if (!chats[number]) chats[number] = [];
    const msgObj = { fromMe: true, text: message, timestamp: Date.now() };
    chats[number].push(msgObj);
    // Emitir el mensaje enviado a todos los clientes conectados
    if (req.app.get('io')) {
      req.app.get('io').emit('new-message', { number, text: message, timestamp: msgObj.timestamp, fromMe: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error enviando mensaje', details: err.message });
  }
});

// Función para registrar mensajes recibidos (esto debe llamarse desde el evento de Baileys)
function registerIncomingMessage(number, text) {
  if (!chats[number]) chats[number] = [];
  chats[number].push({ fromMe: false, text, timestamp: Date.now() });
}

module.exports = { router, registerIncomingMessage };
