const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: { origin: "*" } 
});
const axios = require('axios'); // Biblioteca para enviar os dados para a planilha

io.on('connection', (socket) => {
  console.log('Uma máquina conectou: ' + socket.id);

  socket.on('enviar-chamada', (dados) => {
    // 1. O servidor continua "gritando" para todas as TVs (Sincronização em tempo real)
    io.emit('receber-chamada', dados);

    // 2. NOVO: Enviar para o Histórico no Google Sheets
    const urlPlanilha = "https://script.google.com/macros/s/AKfycbz148AMTmbbCdznoTIw8XNjA7TlpYA7JCiFn-8fTlu9eYE1dY5Kf5G0p3fO41-GiQYT3A/exec";

    axios.post(urlPlanilha, {
      hora: dados.hora,
      fornecedor: dados.fornecedor,
      doca: dados.doca,
      projeto: dados.projeto,
      maquina: dados.maquina || "Terminal RV"
    })
    .then(() => console.log("✅ Histórico salvo com sucesso!"))
    .catch(err => console.error("❌ Erro ao salvar na planilha:", err.message));
  });

  socket.on('disconnect', () => {
    console.log('Máquina desconectada');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor DOCKFLOW rodando na porta ${PORT}`);
});
