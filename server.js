const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbz148AMTmbbCdznoTIw8XNjA7TlpYA7JCiFn-8fTlu9eYE1dY5Kf5G0p3fO41-GiQYT3A/exec";

io.on('connection', (socket) => {
  console.log('Máquina conectada:', socket.id);

  socket.on('enviar-chamada', async (dados) => {
    // 1. Grita para as TVs
    io.emit('receber-chamada', dados);
    console.log('Sinal enviado para as TVs:', dados.fornecedor);

    // 2. Tenta gravar na planilha
    try {
      await fetch(URL_PLANILHA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: new Date().toLocaleDateString('pt-BR'),
          hora: dados.hora || new Date().toLocaleTimeString(),
          fornecedor: dados.fornecedor || "---",
          transportadora: dados.transportadora || "---",
          motorista: dados.motorista || "---",
          doca: dados.doca || "---",
          projeto: dados.projeto || dados.unidade || "---",
          maquina: dados.maquina || "Terminal RV"
        })
      });
      console.log("✅ Histórico gravado na ordem correta!");
    } catch (err) {
      console.error("⚠️ Erro ao gravar histórico:", err.message);
    }
  }); // <-- A CHAVE QUE FALTAVA ESTÁ AQUI

  socket.on('disconnect', () => {
    console.log('Máquina desconectada');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor DOCKFLOW operacional na porta ${PORT}`);
});
