/**
 * session.js
 *
 * Usa @rerez/baileys (CJS nativo).
 * Fix principal: versión de WA hardcodeada en [2, 3000, 1029030078]
 * — la versión por defecto del fork es 2.2413.1, que WhatsApp ya no acepta.
 *
 * IMPORTANTE: Si obtienes 405 al arrancar, detén el servidor y espera
 * 30-60 minutos antes de volver a intentar. WhatsApp bloquea IPs
 * que realizan demasiados intentos de handshake fallidos seguidos.
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@rerez/baileys');
const qrcode = require('qrcode');
const path   = require('path');
const fs     = require('fs');

const AUTH_DIR = path.join(__dirname, '../auth_info');

// Versión de WA Web confirmada como funcional (Feb 2026)
// Si vuelve a dar 405 en el futuro, actualiza solo este array
const WA_VERSION = [2, 3000, 1029030078];

let sock          = null;
let sessionActive = false;
let retryCount    = 0;
const MAX_405_RETRIES = 2; // Tras 2 intentos con 405 → dejar de intentar

// ─── Utilidades ──────────────────────────────────────────────────────────────
function clearAuthInfo() {
  if (fs.existsSync(AUTH_DIR)) {
    fs.readdirSync(AUTH_DIR).forEach(file => {
      try { fs.unlinkSync(path.join(AUTH_DIR, file)); } catch (_) {}
    });
  }
}

// ─── Iniciar conexión WhatsApp ────────────────────────────────────────────────
async function startSock(socket) {
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      version: WA_VERSION,          // ← FIX CRÍTICO
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: false,
      generateHighQualityLinkPreview: false,
      linkPreviewImageThumbnailWidth: 0,
      markOnlineOnConnect: false,
    });

    // ── Eventos de conexión ──────────────────────────────────────────────────
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        retryCount = 0; // Conexión exitosa con WA → resetear contador
        try {
          const qrImage = await qrcode.toDataURL(qr);
          socket.emit('qr', qrImage);
          sessionActive = false;
          console.log('📲 QR generado — escanea con WhatsApp');
        } catch (err) {
          console.error('Error generando imagen QR:', err);
        }
      }

      if (connection === 'open') {
        retryCount = 0;
        sessionActive = true;
        socket.emit('authenticated');
        console.log('✅ WhatsApp conectado correctamente');
      }

      if (connection === 'close') {
        sessionActive = false;
        sock = null;

        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason     = lastDisconnect?.error?.message || 'Desconocido';

        console.log(`🔌 Conexión cerrada — Código: ${statusCode} | Razón: ${reason}`);

        // Logout intencional o sesión revocada desde el celular
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;

        // 405 = WhatsApp rechazó el handshake (IP bloqueada o versión incorrecta)
        const isBadHandshake = statusCode === 405;

        if (isLoggedOut) {
          console.log('🗑️  Sesión expirada. Limpiando credenciales...');
          clearAuthInfo();
          socket.emit('logout');
          setTimeout(() => { retryCount = 0; startSock(socket); }, 2000);

        } else if (isBadHandshake) {
          retryCount++;
          console.log(`⚠️  Error 405 (intento ${retryCount}/${MAX_405_RETRIES})`);

          if (retryCount >= MAX_405_RETRIES) {
            // Parar completamente — la IP probablemente está bloqueada
            console.log('');
            console.log('🚫 ======================================================');
            console.log('   WhatsApp está rechazando la conexión (código 405).');
            console.log('   Esto ocurre cuando la IP ha sido bloqueada temporalmente');
            console.log('   por demasiados intentos fallidos seguidos.');
            console.log('');
            console.log('   ✅ SOLUCIÓN:');
            console.log('   1. Detén el servidor (Ctrl+C)');
            console.log('   2. Espera 30-60 minutos SIN intentar conectar');
            console.log('   3. Vuelve a ejecutar: node index.js');
            console.log('🚫 ======================================================');
            console.log('');
            socket.emit('error-405'); // El frontend puede mostrar un aviso
            // No reconectar — esperar acción manual
          } else {
            socket.emit('logout');
            console.log('♻️  Reintentando en 15 segundos...');
            setTimeout(() => startSock(socket), 15000);
          }

        } else {
          // Error de red genérico → reconectar con backoff
          const delay = Math.min(5000 * (retryCount + 1), 30000);
          console.log(`♻️  Reconectando en ${delay / 1000}s...`);
          socket.emit('logout');
          setTimeout(() => startSock(socket), delay);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (err) {
    console.error('❌ Error crítico iniciando WhatsApp:', err.message);
    setTimeout(() => startSock(socket), 10000);
  }
}

// ─── Logout manual ───────────────────────────────────────────────────────────
async function logout(socket) {
  if (sock) {
    try { await sock.logout(); } catch (_) {}
    sessionActive = false;
    clearAuthInfo();
    sock = null;
    socket.emit('logout');
    retryCount = 0;
    setTimeout(() => startSock(socket), 1000);
  }
}

// ─── Punto de entrada desde index.js ─────────────────────────────────────────
function handleSocketConnection(socket) {
  if (sessionActive && sock) {
    socket.emit('authenticated');
  } else {
    startSock(socket);
  }

  socket.on('logout', async () => {
    await logout(socket);
  });

  // Permite reintentar manualmente desde el frontend
  socket.on('retry-connect', () => {
    console.log('🔄 Reintento manual solicitado');
    retryCount = 0;
    if (!sessionActive) startSock(socket);
  });
}

module.exports = {
  handleSocketConnection,
  getSock: () => sock,
};