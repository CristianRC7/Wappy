const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

const AUTH_DIR = path.join(__dirname, '../auth_info');

let sock = null;
let sessionActive = false;

function clearAuthInfo() {
  if (fs.existsSync(AUTH_DIR)) {
    fs.readdirSync(AUTH_DIR).forEach(file => {
      fs.unlinkSync(path.join(AUTH_DIR, file));
    });
  }
}

async function startSock(socket) {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;
    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      socket.emit('qr', qrImage);
      sessionActive = false;
    }
    if (connection === 'open') {
      sessionActive = true;
      socket.emit('authenticated');
    }
    if (connection === 'close') {
      sessionActive = false;
      socket.emit('logout');
      setTimeout(() => startSock(socket), 1000);
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

async function logout(socket) {
  if (sock) {
    await sock.logout();
    sessionActive = false;
    clearAuthInfo();
    sock = null;
    setTimeout(() => {
      startSock(socket);
    }, 500);
    socket.emit('logout');
  }
}

function handleSocketConnection(socket) {
  if (!sessionActive) {
    startSock(socket);
  } else {
    socket.emit('authenticated');
  }

  socket.on('logout', async () => {
    await logout(socket);
  });
}

module.exports = {
  handleSocketConnection,
}; 