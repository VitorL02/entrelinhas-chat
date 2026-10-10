import { describe, expect, it } from 'vitest';
import { normalizarEndpoint, validarMensagem, formatarDataHora } from '@/lib/contratos-chat';

describe('Contratos do chat', function testarContratos() {
  it('normaliza a URL base sem duplicar ws', function testarEndereco() {
    expect(normalizarEndpoint('http://localhost:8080')).toBe('http://localhost:8080/ws');
    expect(normalizarEndpoint('https://chat.example.com/ws/')).toBe('https://chat.example.com/ws');
    expect(normalizarEndpoint('https://chat.example.com/backend')).toBe('https://chat.example.com/backend/ws');
    expect(function rejeitarProtocolo() { normalizarEndpoint('ftp://example.com'); }).toThrow();
  });
  it('valida os três campos obrigatórios como strings', function testarMensagem() {
    expect(validarMensagem({ from: 'Vitor', content: 'Olá', timeStamp: '2026-10-10T17:42:00Z' })).toBe(true);
    expect(validarMensagem({ from: 'Vitor', content: 'Olá', timeStamp: 123 })).toBe(false);
    expect(validarMensagem(null)).toBe(false);
  });
  it('preserva timestamps não interpretáveis', function testarHorario() {
    expect(formatarDataHora('17:42')).toBe('17:42');
  });
});
