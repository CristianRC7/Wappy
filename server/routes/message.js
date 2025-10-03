const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getSock } = require('./session');
const fs = require('fs');
const path = require('path');

// Configurar multer para almacenar archivos temporalmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB máximo
});

// POST /send-messages (texto simple)
router.post('/send-messages', async (req, res) => {
  const { messages, waitTime } = req.body;
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

// POST /send-messages-media (con imagen/video/audio)
router.post('/send-messages-media', upload.single('media'), async (req, res) => {
  const sock = getSock();
  if (!sock) {
    return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });
  }
  
  try {
    const { messages, waitTime } = JSON.parse(req.body.data);
    const mediaFile = req.file;
    
    if (!mediaFile) {
      return res.status(400).json({ error: 'No se proporcionó archivo multimedia' });
    }

    const delay = Math.max(Number(waitTime) || 25, 25);
    const mediaBuffer = fs.readFileSync(mediaFile.path);
    const mimetype = mediaFile.mimetype;
    
    // Determinar tipo de medio
    let mediaType = 'document';
    if (mimetype.startsWith('image/')) {
      mediaType = 'image';
    } else if (mimetype.startsWith('video/')) {
      mediaType = 'video';
    } else if (mimetype.startsWith('audio/')) {
      mediaType = 'audio';
    }

    const results = [];
    
    for (const { telefono, mensaje } of messages) {
      try {
        const messageContent = {
          [mediaType]: mediaBuffer,
        };
        
        // Agregar caption solo para imagen y video
        if (mediaType === 'image' || mediaType === 'video') {
          messageContent.caption = mensaje;
        }
        
        // Para audio, el mensaje se pierde, pero enviamos el audio
        if (mediaType === 'audio') {
          messageContent.mimetype = mimetype;
        }

        await sock.sendMessage(`${telefono}@s.whatsapp.net`, messageContent);
        results.push({ telefono, success: true });
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (err) {
        results.push({ telefono, success: false, error: err.message });
      }
    }
    
    // Eliminar archivo temporal
    fs.unlinkSync(mediaFile.path);
    
    res.json({ success: true, results });
  } catch (err) {
    // Limpiar archivo si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error enviando mensajes multimedia', details: err.message });
  }
});

module.exports = router;