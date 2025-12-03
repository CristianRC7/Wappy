const { default: makeWASocket, useMultiFileAuthState } = require('baileys');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

const AUTH_BASE_DIR = path.join(__dirname, '../auth_info');

// Objeto para almacenar las sesiones de cada grupo
const sessions = {};

function getAuthDir(grupoId) {
  return path.join(AUTH_BASE_DIR, grupoId.toString());
}

function clearAuthInfo(grupoId) {
  const authDir = getAuthDir(grupoId);
  if (fs.existsSync(authDir)) {
    fs.readdirSync(authDir).forEach(file => {
      fs.unlinkSync(path.join(authDir, file));
    });
  }
}

function sessionExists(grupoId) {
  const authDir = getAuthDir(grupoId);
  if (!fs.existsSync(authDir)) {
    return false;
  }
  // Verificar si la carpeta contiene archivos de sesión
  const files = fs.readdirSync(authDir);
  return files.length > 0;
}

async function startSock(socket, grupoId) {
  // Si ya existe una sesión para este grupo, verificar su estado
  if (sessions[grupoId] && sessions[grupoId].sock) {
    console.log(`Sesión ya existe para grupo ${grupoId}, verificando estado...`);
    if (sessions[grupoId].active) {
      socket.emit('authenticated');
    }
    // Si no está activa, los eventos 'qr' o 'authenticated' se emitirán cuando cambien
    return;
  }

  const authDir = getAuthDir(grupoId);
  
  // Crear directorio si no existe
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sessions[grupoId] = {
    sock,
    active: false,
    reconnecting: false,
    sockets: [socket] // Mantener lista de sockets conectados
  };

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;
    
    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      // Emitir QR a todos los sockets conectados para este grupo
      if (sessions[grupoId] && sessions[grupoId].sockets) {
        sessions[grupoId].sockets.forEach(s => s.emit('qr', qrImage));
      } else {
        socket.emit('qr', qrImage);
      }
      sessions[grupoId].active = false;
    }
    
    if (connection === 'open') {
      sessions[grupoId].active = true;
      sessions[grupoId].reconnecting = false;
      
      // Guardar en la base de datos
      const authPath = `auth_info/${grupoId}`;
      try {
        // Verificar si ya existe
        const checkQuery = 'SELECT id FROM whatsapp_sesion WHERE grupo_id = $1';
        const checkResult = await pool.query(checkQuery, [grupoId]);
        
        if (checkResult.rows.length === 0) {
          // Insertar nueva sesión
          const insertQuery = 'INSERT INTO whatsapp_sesion (grupo_id, ruta_auth) VALUES ($1, $2)';
          await pool.query(insertQuery, [grupoId, authPath]);
          console.log(`Sesión registrada en BD para grupo ${grupoId}`);
        } else {
          // Actualizar ruta si cambió
          const updateQuery = 'UPDATE whatsapp_sesion SET ruta_auth = $1 WHERE grupo_id = $2';
          await pool.query(updateQuery, [authPath, grupoId]);
          console.log(`Sesión actualizada en BD para grupo ${grupoId}`);
        }
      } catch (dbError) {
        console.error(`Error al guardar sesión en BD para grupo ${grupoId}:`, dbError);
      }
      
      // Emitir autenticación a todos los sockets conectados
      if (sessions[grupoId] && sessions[grupoId].sockets) {
        sessions[grupoId].sockets.forEach(s => s.emit('authenticated'));
      } else {
        socket.emit('authenticated');
      }
      console.log(`Sesión WhatsApp abierta para grupo ${grupoId}`);
    }
    
    if (connection === 'close') {
      sessions[grupoId].active = false;
      // Emitir logout a todos los sockets conectados
      if (sessions[grupoId] && sessions[grupoId].sockets) {
        sessions[grupoId].sockets.forEach(s => s.emit('logout'));
      } else {
        socket.emit('logout');
      }
      
      // Solo reconectar si no fue un logout manual y no está ya reconectando
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      
      if (shouldReconnect && !sessions[grupoId].reconnecting) {
        console.log(`Conexión cerrada para grupo ${grupoId}, intentando reconectar...`);
        sessions[grupoId].reconnecting = true;
        sessions[grupoId].sock = null;
        
        setTimeout(() => {
          if (sessions[grupoId]) {
            sessions[grupoId].reconnecting = false;
          }
          startSock(socket, grupoId);
        }, 3000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

async function logout(socket, grupoId) {
  if (sessions[grupoId] && sessions[grupoId].sock) {
    try {
      await sessions[grupoId].sock.logout();
      clearAuthInfo(grupoId);
      
      // Eliminar de la base de datos
      try {
        const deleteQuery = 'DELETE FROM whatsapp_sesion WHERE grupo_id = $1';
        await pool.query(deleteQuery, [grupoId]);
        console.log(`Sesión eliminada de BD para grupo ${grupoId}`);
      } catch (dbError) {
        console.error(`Error al eliminar sesión de BD para grupo ${grupoId}:`, dbError);
      }
      
    } catch (error) {
      console.error(`Error al cerrar sesión para grupo ${grupoId}:`, error.message);
    }
    
    sessions[grupoId].active = false;
    sessions[grupoId].sock = null;
    
    // Emitir logout a todos los sockets conectados
    if (sessions[grupoId] && sessions[grupoId].sockets) {
      sessions[grupoId].sockets.forEach(s => s.emit('logout'));
    } else {
      socket.emit('logout');
    }
    
    console.log(`Sesión cerrada manualmente para grupo ${grupoId}`);
    
    // Reiniciar para mostrar QR
    setTimeout(() => {
      startSock(socket, grupoId);
    }, 1000);
  }
}

function handleSocketConnection(socket) {
  socket.on('init-session', async (grupoId) => {
    if (!grupoId) {
      socket.emit('error', 'Grupo ID no proporcionado');
      return;
    }

    console.log(`Cliente solicitando sesión para grupo ${grupoId}`);

    // Verificar si ya existe una sesión activa para este grupo
    if (sessions[grupoId] && sessions[grupoId].sock) {
      console.log(`Sesión existente encontrada para grupo ${grupoId}`);
      
      // Agregar este socket a la lista de sockets conectados
      if (!sessions[grupoId].sockets) {
        sessions[grupoId].sockets = [];
      }
      if (!sessions[grupoId].sockets.includes(socket)) {
        sessions[grupoId].sockets.push(socket);
      }
      
      if (sessions[grupoId].active) {
        console.log(`Sesión activa para grupo ${grupoId}`);
        socket.emit('authenticated');
      } else {
        console.log(`Sesión existe pero no está activa para grupo ${grupoId}, esperando QR o autenticación...`);
      }
      return;
    }

    // No existe sesión, iniciar nueva
    console.log(`Iniciando nueva sesión para grupo ${grupoId}`);
    await startSock(socket, grupoId);
  });

  socket.on('logout', async (grupoId) => {
    console.log(`Cliente solicitando logout para grupo ${grupoId}`);
    await logout(socket, grupoId);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado del socket');
    // Remover socket de todas las sesiones
    Object.keys(sessions).forEach(grupoId => {
      if (sessions[grupoId].sockets) {
        sessions[grupoId].sockets = sessions[grupoId].sockets.filter(s => s !== socket);
      }
    });
  });
}

function getSock(grupoId) {
  return sessions[grupoId]?.sock || null;
}

function isSessionActive(grupoId) {
  return sessions[grupoId]?.active || false;
}

function sessionExistsInMemory(grupoId) {
  return !!(sessions[grupoId] && sessions[grupoId].sock);
}

module.exports = {
  handleSocketConnection,
  getSock,
  isSessionActive,
  sessionExistsInMemory,
}; 