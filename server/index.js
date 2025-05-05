const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const sessionRoutes = require('./routes/session');
const messageRoutes = require('./routes/message');

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
app.use('/api', messageRoutes);

const PORT = 3005;

io.on('connection', (socket) => {
  sessionRoutes.handleSocketConnection(socket);
});

app.get('/', (req, res) => {
  res.send('Servidor WhatsApp activo');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});