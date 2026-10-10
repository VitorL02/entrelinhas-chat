# Chat em tempo real
- [x] Criar experiência editorial com salas, identidade e temas.
- [x] Integrar STOMP/SockJS ao backend configurável com histórico da sessão.
- [x] Verificar interface, contratos e testes; envio e recebimento validados com servidor STOMP/SockJS simulado.
- [x] Conectar por padrão ao deploy https://chatrealtime-entrelinhas.vercel.app/ws.
- [x] Diagnosticar a conexão com o deploy: o servidor não devolve Access-Control-Allow-Origin e não mantém sessão SockJS (serverless).
- [x] Exibir avisos de erro de conexão claros e diferenciados (nome ausente, servidor lento, rede/CORS, encerramento intencional) com botão de dispensar.
- [ ] Liberar a origem do chat no backend implantado (bloqueio de CORS) — depende do repositório do Spring Boot.