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
      await fetch(URL_PLANILHA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // ESTA ORDEM PRECISA BATER COM O SCRIPT DO GOOGLE
          data: new Date().toLocaleDateString('pt-BR'),
          hora: dados.hora || new Date().toLocaleTimeString(),
          fornecedor: dados.fornecedor || "---",
          transportadora: dados.transportadora || "---",
          motorista: dados.motorista || "---",
          doca: dados.doca || "---",
          projeto: dados.projeto || dados.unidade || "---", // Se for PPI/CEAF usa 'unidade'
          maquina: dados.maquina || "Terminal RV"
        })
      });
      console.log("✅ Histórico gravado na ordem correta!");
    } catch (err) {
      console.error("⚠️ Erro:", err.message);
    }

  socket.on('disconnect', () => {
    console.log('Máquina desconectada');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor DOCKFLOW operacional na porta ${PORT}`);
});

