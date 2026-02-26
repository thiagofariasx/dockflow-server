const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbz148AMTmbbCdznoTIw8XNjA7TlpYA7JCiFn-8fTlu9eYE1dY5Kf5G0p3fO41-GiQYT3A/exec";

io.on('connection', (socket) => {
  console.log('Máquina conectada:', socket.id);

  socket.on('enviar-chamada', async (dados) => {
    // 1. Grita para as TVs (Sincronização imediata)
    io.emit('receber-chamada', dados);
    console.log('Sinal enviado para as TVs:', dados.fornecedor || dados.unidade);

    // 2. Tenta gravar na planilha DOCKFLOW_DADOS
    try {
      let projetoFormatado = "OUTROS";
      const mod = dados.modulo ? dados.modulo.toLowerCase() : "";
      
      // Lógica para Fornecedor: Se não tiver fornecedor, usa Unidade (CEAF/PPI/MANUAL)
      let nomeExibicao = dados.fornecedor || dados.unidade || dados.projeto || "---";

      if (mod === 'recebimento') {
          projetoFormatado = "RECEBIMENTO";
      } else if (mod === 'ceaf') {
          projetoFormatado = "CEAF CESAF";
      } else if (mod === 'ppi') {
          projetoFormatado = "PPI";
      } else if (mod === 'manual' || (dados.projeto && dados.projeto.includes("MANUAL"))) {
          projetoFormatado = "MANUAL";
          // No manual, se a unidade estiver vazia, tenta pegar o responsável
          nomeExibicao = dados.unidade || dados.motorista || "CHAMADA MANUAL";
      }

      await fetch(URL_PLANILHA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: new Date().toLocaleDateString('pt-BR'),
          hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          fornecedor: nomeExibicao,
          transportadora: dados.transportadora || "---",
          motorista: dados.motorista || "---",
          doca: dados.doca || "---",
          projeto: projetoFormatado,
          maquina: "Terminal RV"
        })
      });
      console.log(`✅ Gravado no Google Sheets: ${projetoFormatado} - ${nomeExibicao}`);
    } catch (err) {
      console.error("⚠️ Erro ao enviar para Planilha:", err.message);
    }
  }); // Chave de fechamento do enviar-chamada

  socket.on('disconnect', () => {
    console.log('Máquina desconectada');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Servidor DOCKFLOW operacional na porta ${PORT}`);
});
