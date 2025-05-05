const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = 3005;

let sock = null;
let sessionActive = false;

async function startSock(socket) {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info'));
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;
    if (qr) {
      // Generar QR como imagen base64
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
      setTimeout(() => startSock(socket), 1000); // Reiniciar conexión
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

io.on('connection', (socket) => {
  if (!sessionActive) {
    startSock(socket);
  } else {
    socket.emit('authenticated');
  }

  socket.on('logout', async () => {
    if (sock) {
      await sock.logout();
      sessionActive = false;
      socket.emit('logout');
    }
  });
});

app.get('/', (req, res) => {
  res.send('Servidor WhatsApp activo');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
