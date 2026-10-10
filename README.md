# Entrelinhas Chat

Construir um frontend de chat em tempo real com conexão WebSocket integrado ao backend Spring Boot (repositório VitorL02/chatrealtime), com as seguintes especificações e contratos:

1. Contratos da API e WebSocket (Spring Boot STOMP com SockJS):
- Endpoint de conexão WebSocket: '/ws' com fallback SockJS (permitir configurar a URL base do backend, por padrão 'http://localhost:8080/ws').
- Destino de envio da mensagem: '/app/chat.send/{room}'
- Tópico de inscrição para receber mensagens: '/topic/chat/{room}'
- Estrutura da mensagem JSON:
  {
    "from": string,
    "content": string,
    "timeStamp": string
  }
- Incluir seleção e troca de sala/canal ({room}) e identificação do usuário ({from}), com status de conexão visual (conectado, conectando, desconectado) e histórico local de mensagens da sessão.

2. Restrições de código solicitadas:
- Não adicione comentários no código.
- Crie todos os métodos e funções com nomes em português (ex: conectarWebSocket, enviarMensagem, desconectarWebSocket, alternarTema, formatarDataHora, etc.).

3. Especificações visuais e de design:
- Design editorial e autêntico, proibindo totalmente o estilo visual padrão de IA (sem fundos com degradê roxo/azul neon, sem cards flutuantes idênticos com ícones genéricos e sem bordas arredondadas exageradas).
- Diretriz de Design: Estética editorial de revista impressa / minimalismo suíço, com grids assimétricos, linhas divisórias finas sólidas (1px) e blocos de conteúdo com personalidade própria.
- Tipografia: Fonte serifada elegante para cabeçalhos e títulos combinada com fonte sans-serif técnica e limpa para mensagens e controles, com hierarquias bem marcadas.
- Paleta de cores modo claro: Fundo off-white (#FBF9F5), texto em preto carvão (#111111) e detalhes em verde musgo (#3A5A40). Sem gradientes coloridos aleatórios.
- Modo escuro completo e acessível para sensibilidade à luz: paleta escura suave de alto contraste sem ofuscamento (grafite/papel escuro, preservando a elegância editorial).
- Interações: Micro-interações táteis e sutis, scroll suave nas conversas, sem animações infantis ou exageradas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://entrelinhas-chat.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/998be538-49be-4bc4-9cbd-4b47fd992dad).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
