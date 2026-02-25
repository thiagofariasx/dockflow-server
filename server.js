const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: { origin: "*" } // Permite conexões de qualquer lugar
});

io.on('connection', (socket) => {
  console.log('Uma máquina conectou: ' + socket.id);

  // Quando qualquer Lobby enviar uma chamada
  socket.on('enviar-chamada', (dados) => {
    // O servidor "grita" para todas as outras máquinas conectadas
    io.emit('receber-chamada', dados);
  });

  socket.on('disconnect', () => {
    console.log('Máquina desconectada');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor DOCKFLOW rodando na porta ${PORT}`);
});