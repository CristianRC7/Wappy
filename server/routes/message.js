const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getSock } = require('./session');
const fs = require('fs');
const path = require('path');

// Función para limpiar y validar números de teléfono
function cleanPhoneNumber(phone) {
  // Remover espacios, guiones, paréntesis y símbolos de más
  let cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');
  // Si comienza con 00, quitarlo (formato internacional)
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

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
  console.log('📨 Recibida petición de envío de mensajes:', { totalMensajes: messages?.length, waitTime });
  
  const sock = getSock();
  if (!sock) {
    console.error('❌ No hay sesión activa de WhatsApp');
    return res.status(500).json({ error: 'No hay sesión activa de WhatsApp' });
  }
  
  console.log('✅ Socket de WhatsApp disponible');
  const delay = Math.max(Number(waitTime) || 25, 25);
  const results = [];
  
  try {
    for (let i = 0; i < messages.length; i++) {
      const { telefono, mensaje } = messages[i];
      const cleanedPhone = cleanPhoneNumber(telefono);
      const jid = `${cleanedPhone}@s.whatsapp.net`;
      
      console.log(`📤 Enviando mensaje ${i + 1}/${messages.length} a ${telefono} (limpio: ${cleanedPhone})...`);
      
      try {
        const result = await sock.sendMessage(jid, { text: mensaje });
        console.log(`✅ Mensaje ${i + 1} enviado exitosamente a ${telefono}`, result.key);
        results.push({ telefono, success: true, messageId: result.key.id });
      } catch (msgErr) {
        console.error(`❌ Error enviando mensaje ${i + 1} a ${telefono}:`, msgErr.message);
        results.push({ telefono, success: false, error: msgErr.message });
      }
      
      if (i < messages.length - 1) {
        console.log(`⏳ Esperando ${delay}ms antes del siguiente mensaje...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Proceso completado: ${successCount}/${messages.length} mensajes enviados`);
    res.json({ success: true, results, totalSent: successCount, totalFailed: messages.length - successCount });
  } catch (err) {
    console.error('❌ Error general en el proceso de envío:', err);
    res.status(500).json({ error: 'Error enviando mensajes', details: err.message, results });
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
        const cleanedPhone = cleanPhoneNumber(telefono);
        const jid = `${cleanedPhone}@s.whatsapp.net`;
        
        console.log(`📤 Enviando mensaje multimedia a ${telefono} (limpio: ${cleanedPhone})...`);
        
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

        const result = await sock.sendMessage(jid, messageContent);
        console.log(`✅ Mensaje multimedia enviado a ${telefono}`, result.key);
        results.push({ telefono, success: true, messageId: result.key.id });
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (err) {
        console.error(`❌ Error enviando a ${telefono}:`, err.message);
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