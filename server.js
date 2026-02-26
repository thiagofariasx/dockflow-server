const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbz148AMTmbbCdznoTIw8XNjA7TlpYA7JCiFn-8fTlu9eYE1dY5Kf5G0p3fO41-GiQYT3A/exec";

io.on('connection', (socket) => {
  console.log('Máquina conectada:', socket.id);

  socket.on('enviar-chamada', async (dados) => {
    io.emit('receber-chamada', dados);
    console.log('Sinal enviado para as TVs:', dados.fornecedor);

    try {
      // Usando FETCH nativo (não precisa de axios/instalação)
      await fetch(URL_PLANILHA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hora: dados.hora || new Date().toLocaleTimeString(),
          fornecedor: dados.fornecedor,
          doca: dados.doca,
          projeto: dados.projeto,
          maquina: dados.maquina || "Terminal RV"
        })
      });
      console.log("✅ Histórico gravado com sucesso!");
    } catch (err) {
      console.error("⚠️ Erro ao gravar histórico:", err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Máquina desconectada');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor DOCKFLOW operacional na porta ${PORT}`);
});
