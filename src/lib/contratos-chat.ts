export interface MensagemChat {
  from: string;
  content: string;
  timeStamp: string;
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