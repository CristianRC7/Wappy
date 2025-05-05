const express = require('express');
const router = express.Router();
const { getSock } = require('./session');

// POST /send-messages
router.post('/send-messages', async (req, res) => {
  const { messages, waitTime } = req.body; // [{ telefono, mensaje }], waitTime en ms
  const sock = getSock();
  if (!sock) {
    return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });
  }
  const delay = Math.max(Number(waitTime) || 25, 25);
  try {
    for (const { telefono, mensaje } of messages) {
      await sock.sendMessage(`${telefono}@s.whatsapp.net`, { text: mensaje });
      await new Promise(res => setTimeout(res, delay));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error enviando mensajes', details: err.message });
  }
});

module.exports = router; 