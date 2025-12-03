const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sessionRoutes = require('./routes/session');
const messageRoutes = require('./routes/message');
const groupRoutes = require('./routes/group');
const authRoutes = require('./routes/auth');
const whatsappSessionRoutes = require('./routes/whatsapp-session');
const alertsRoutes = require('./routes/alerts');
const { router: chatsRoutes, registerIncomingMessage } = require('./routes/chats');

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
app.set('io', io);
app.use('/api', authRoutes);
app.use('/api', messageRoutes);
app.use('/api', groupRoutes);
app.use('/api', chatsRoutes);
app.use('/api', whatsappSessionRoutes);
app.use('/api', alertsRoutes);

const PORT = 3005;

io.on('connection', (socket) => {
  sessionRoutes.handleSocketConnection(socket);
});

// Integrar el registro de mensajes recibidos desde Baileys
const { getSock } = require('./routes/session');

// Nota: Este intervalo verifica las sesiones activas, pero ahora getSock requiere grupoId
// Podrías necesitar ajustar esto según tus necesidades
setInterval(() => {
  // Aquí podrías iterar sobre todos los grupos activos si es necesario
  // Por ahora, comentamos esta funcionalidad para evitar errores
  // const sock = getSock();
  // if (sock && sock.ev && !sock._messagesListenerAdded) {
  //   sock.ev.on('messages.upsert', async ({ messages }) => {
  //     for (const msg of messages) {
  //       if (msg.key.fromMe) continue;
  //       const number = msg.key.remoteJid.split('@')[0];
  //       const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  //       if (text) {
  //         registerIncomingMessage(number, text);
  //         io.emit('new-message', { number, text, timestamp: Date.now() });
  //       }
  //     }
  //   });
  //   sock._messagesListenerAdded = true;
  // }
}, 2000);

app.get('/', (req, res) => {
  res.send('Servidor WhatsApp activo');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});