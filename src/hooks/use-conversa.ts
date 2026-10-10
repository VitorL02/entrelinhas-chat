import { useEffect, useRef, useState } from 'react';
import { Client, type StompSubscription } from '@stomp/stompjs';
import { descreverFalha, normalizarEndpoint, validarMensagem, type AvisoConexao, type MensagemChat } from '@/lib/contratos-chat';

import SockJS from 'sockjs-client/dist/sockjs';


const SEGUNDOS_PARA_DESISTIR = 12;

export function usarConversa() {
  const [estado, definirEstado] = useState<'conectado' | 'conectando' | 'desconectado'>('desconectado');
  const [aviso, definirAviso] = useState<AvisoConexao | null>(null);
  const [sala, definirSala] = useState('geral');
  const [historico, definirHistorico] = useState<Record<string, MensagemChat[]>>({});
  const cliente = useRef<Client | null>(null);
  const inscricao = useRef<StompSubscription | null>(null);
  const salaAtual = useRef(sala);
  const geracao = useRef(0);
  const vigia = useRef<number | null>(null);
  const chegouAConectar = useRef(false);
  const desistiuPorTempo = useRef(false);
  const encerrandoDeProposito = useRef(false);

  function limparVigia() {
    if (vigia.current !== null) {
      window.clearTimeout(vigia.current);
      vigia.current = null;
    }
  }

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
        definirAviso(descreverFalha('mensagem'));
      }
    });
  }

  function conectarWebSocket(endereco: string, usuario: string) {
    if (!usuario.trim()) { definirAviso(descreverFalha('nome')); return; }
    if (estado !== 'desconectado') return;
    const tentativa = ++geracao.current;
    definirAviso(null);
    definirEstado('conectando');
    chegouAConectar.current = false;
    desistiuPorTempo.current = false;
    encerrandoDeProposito.current = false;
    let endpoint: string;
    try {
      endpoint = normalizarEndpoint(endereco);
    } catch {
      definirEstado('desconectado');
      definirAviso(descreverFalha('endereco'));
      return;
    }
    vigia.current = window.setTimeout(function aoDesistirDoServidor() {
      vigia.current = null;
      if (tentativa !== geracao.current || chegouAConectar.current) return;
      desistiuPorTempo.current = true;
      encerrandoDeProposito.current = true;
      definirEstado('desconectado');
      definirAviso(descreverFalha('tempo'));
      void cliente.current?.deactivate();
    }, SEGUNDOS_PARA_DESISTIR * 1000);
    void abrirTransporte(endpoint, tentativa);
  }

 function abrirTransporte(endpoint: string, tentativa: number) {
  if (tentativa !== geracao.current) {
    limparVigia();
    return;
  }

  const conexao = new Client({
    webSocketFactory: function criarTransporte() {
      return new SockJS(endpoint);
    },
    reconnectDelay: 0,
    onConnect: function aoConectar() {
      limparVigia();
      chegouAConectar.current = true;
      definirEstado('conectado');
      definirAviso(null);
      inscreverSala(salaAtual.current);
    },
    onStompError: function aoSerRecusado(quadro) {
      limparVigia();
      if (tentativa !== geracao.current) return;
      definirAviso(descreverFalha('recusa', quadro.headers['message']));
      void desconectarWebSocket();
    },
    onWebSocketClose: function aoEncerrar() {
      limparVigia();
      if (tentativa !== geracao.current || encerrandoDeProposito.current) return;
      definirEstado('desconectado');
      inscricao.current = null;
      if (desistiuPorTempo.current) return;
      definirAviso(chegouAConectar.current ? descreverFalha('queda') : descreverFalha('rede'));
    },
  });

  cliente.current = conexao;
  conexao.activate();
}
  async function desconectarWebSocket() {
    geracao.current += 1;
    limparVigia();
    encerrandoDeProposito.current = true;
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
    definirAviso(function limparAvisoDeLeitura(atual) { return atual?.tipo === 'mensagem' ? null : atual; });
  }

  function enviarMensagem(conteudo: string, usuario: string) {
    if (!cliente.current?.connected || !conteudo.trim() || !usuario.trim()) return false;
    const mensagem: MensagemChat = { from: usuario.trim(), content: conteudo.trim(), timeStamp: new Date().toISOString() };
    try {
      cliente.current.publish({ destination: `/app/chat.send/${salaAtual.current}`, body: JSON.stringify(mensagem) });
      return true;
    } catch {
      definirAviso(descreverFalha('envio'));
      return false;
    }
  }

  function descartarAviso() { definirAviso(null); }

  useEffect(function encerrarAoSair() {
    return function limparConexao() { geracao.current += 1; limparVigia(); void cliente.current?.deactivate(); };
  }, []);

  return { estado, aviso, sala, historico, conectarWebSocket, desconectarWebSocket, trocarSala, enviarMensagem, descartarAviso };
}
