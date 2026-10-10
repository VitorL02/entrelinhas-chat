export interface MensagemChat {
  from: string;
  content: string;
  timeStamp: string;
}

export type TipoFalha = 'nome' | 'endereco' | 'transporte' | 'rede' | 'tempo' | 'queda' | 'recusa' | 'mensagem' | 'envio';

export interface AvisoConexao {
  tipo: TipoFalha;
  titulo: string;
  detalhe: string;
}

const FALHAS: Record<TipoFalha, { titulo: string; detalhe: string }> = {
  nome: { titulo: 'Diga como podemos chamar você', detalhe: 'Escreva seu nome em “Sua identidade” antes de entrar na conversa.' },
  endereco: { titulo: 'Endereço do servidor inválido', detalhe: 'Informe um endereço completo em HTTP ou HTTPS, como https://chatrealtime-entrelinhas.vercel.app/ws.' },
  transporte: { titulo: 'Não foi possível preparar a conversa', detalhe: 'O transporte de mensagens não foi carregado neste navegador. Recarregue a página e tente de novo.' },
  rede: { titulo: 'Não foi possível alcançar o servidor', detalhe: 'Confira o endereço, sua conexão com a internet e se o servidor permite acesso a partir deste site (CORS).' },
  tempo: { titulo: 'O servidor demorou para responder', detalhe: 'Ele pode estar acordando ou ocupado. Espere um instante e entre na conversa de novo.' },
  queda: { titulo: 'A conversa foi interrompida', detalhe: 'A conexão com o servidor caiu. Entre na conversa de novo para continuar.' },
  recusa: { titulo: 'O servidor recusou a conexão', detalhe: 'Confira se o endereço aponta para o serviço de conversas e se a sala está disponível.' },
  mensagem: { titulo: 'Uma mensagem chegou em formato inesperado', detalhe: 'Ela não foi exibida. A conversa segue normalmente.' },
  envio: { titulo: 'A mensagem não foi enviada', detalhe: 'Conecte-se de novo para tentar enviar.' },
};

export function descreverFalha(tipo: TipoFalha, detalheDoServidor?: string): AvisoConexao {
  const falha = FALHAS[tipo];
  return { tipo, titulo: falha.titulo, detalhe: detalheDoServidor?.trim() || falha.detalhe };
}

export function normalizarEndpoint(endereco: string) {
  const url = new URL(endereco.trim());
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use uma URL HTTP ou HTTPS.');
  url.pathname = `${url.pathname.replace(/\/+$/, '').replace(/\/ws$/, '')}/ws`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function validarMensagem(valor: unknown): valor is MensagemChat {
  if (!valor || typeof valor !== 'object') return false;
  const mensagem = valor as Record<string, unknown>;
  return typeof mensagem['from'] === 'string' && typeof mensagem['content'] === 'string' && typeof mensagem['timeStamp'] === 'string';
}

export function formatarDataHora(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
