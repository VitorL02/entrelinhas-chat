import { useEffect, useRef, useState } from 'react';
import { Client, type StompSubscription } from '@stomp/stompjs';
import { normalizarEndpoint, validarMensagem, type MensagemChat } from '@/lib/contratos-chat';

export function usarConversa() {
  const [estado, definirEstado] = useState<'conectado' | 'conectando' | 'desconectado'>('desconectado');
  const [erro, definirErro] = useState('');
  const [sala, definirSala] = useState('geral');
  const [historico, definirHistorico] = useState<Record<string, MensagemChat[]>>({});
  const cliente = useRef<Client | null>(null);
  const inscricao = useRef<StompSubscription | null>(null);
  const salaAtual = useRef(sala);
  const geracao = useRef(0);

  function inscreverSala(nome: string) {
    inscricao.current?.unsubscribe();
    inscricao.current = null;
    if (!cliente.current?.connected) return;
    inscricao.current = cliente.current.subscribe(`/topic/chat/${nome}`, function receberMensagem(quadro) {
      try {
        const mensagem: unknown = JSON.parse(quadro.body);
        if (!validarMensagem(mensagem)) throw new Error('Mensagem recebida em formato inválido.');
        definirHistorico(function guardarMensagem(anterior) {
          return { ...anterior, [nome]: [...(anterior[nome] || []), mensagem] };
        });
      } catch {
        definirErro('Não foi possível ler uma mensagem recebida.');
      }
    });
  }

  async function conectarWebSocket(endereco: string, usuario: string) {
    if (!usuario.trim()) { definirErro('Informe seu nome antes de conectar.'); return; }
    if (estado !== 'desconectado') return;
    const tentativa = ++geracao.current;
    definirErro('');
    definirEstado('conectando');
    try {
      const endpoint = normalizarEndpoint(endereco);
      const { default: SockJS } = await import('sockjs-client');
      if (tentativa !== geracao.current) return;
      const conexao = new Client({
        webSocketFactory: function criarTransporte() { return new SockJS(endpoint); },
        reconnectDelay: 0,
        connectionTimeout: 12000,
        onConnect: function aoConectar() { definirEstado('conectado'); definirErro(''); inscreverSala(salaAtual.current); },
        onStompError: function aoReceberErro(quadro) { definirErro(quadro.headers.message || 'O servidor recusou a conexão.'); void desconectarWebSocket(); },
        onWebSocketClose: function aoFechar() {
          if (tentativa !== geracao.current) return;
          definirEstado('desconectado');
          inscricao.current = null;
          definirErro('Conexão encerrada. Verifique o endereço, o servidor e a permissão de origem (CORS).');
        },
      });
      cliente.current = conexao;
      conexao.activate();
    } catch (falha) {
      definirEstado('desconectado');
      definirErro(falha instanceof Error ? falha.message : 'Não foi possível conectar ao servidor.');
    }
  }

  async function desconectarWebSocket() {
    geracao.current += 1;
    const conexao = cliente.current;
    cliente.current = null;
    inscricao.current = null;
    definirEstado('desconectado');
    await conexao?.deactivate();
  }

  function trocarSala(nome: string) {
    salaAtual.current = nome;
    definirSala(nome);
    inscreverSala(nome);
    definirErro('');
  }

  function enviarMensagem(conteudo: string, usuario: string) {
    if (!cliente.current?.connected || !conteudo.trim() || !usuario.trim()) return false;
    const mensagem: MensagemChat = { from: usuario.trim(), content: conteudo.trim(), timeStamp: new Date().toISOString() };
    try {
      cliente.current.publish({ destination: `/app/chat.send/${salaAtual.current}`, body: JSON.stringify(mensagem) });
      return true;
    } catch {
      definirErro('A mensagem não foi enviada. Tente conectar novamente.');
      return false;
    }
  }

  useEffect(function encerrarAoSair() {
    return function limparConexao() { geracao.current += 1; void cliente.current?.deactivate(); };
  }, []);

  return { estado, erro, sala, historico, conectarWebSocket, desconectarWebSocket, trocarSala, enviarMensagem };
}