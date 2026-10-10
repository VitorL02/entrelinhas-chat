import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowRight, Check, Hash, Menu, Moon, Plus, Radio, Settings2, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usarConversa } from '@/hooks/use-conversa';
import { formatarDataHora } from '@/lib/contratos-chat';
import fotografia from '@/assets/editorial-water.jpg';

export const Route = createFileRoute('/')({
  head: function definirMetadados() {
    return { meta: [
      { title: 'Entrelinhas — Conversas em tempo real' },
      { name: 'description', content: 'Um espaço para boas conversas. Entre em uma sala e converse em tempo real com Entrelinhas.' },
      { property: 'og:title', content: 'Entrelinhas — Conversas em tempo real' },
      { property: 'og:description', content: 'Um espaço para boas conversas, em tempo real.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ] };
  },
  component: PaginaConversa,
});

function PaginaConversa() {
  const conversa = usarConversa();
  const [usuario, definirUsuario] = useState('');
  const [endereco, definirEndereco] = useState('http://localhost:8080/ws');
  const [conteudo, definirConteudo] = useState('');
  const [escuro, definirEscuro] = useState(false);
  const [configuracao, definirConfiguracao] = useState(false);
  const [menuAberto, definirMenuAberto] = useState(false);
  const [novaSalaAberta, definirNovaSalaAberta] = useState(false);
  const [novaSala, definirNovaSala] = useState('');
  const [salas, definirSalas] = useState(['geral', 'design', 'tecnologia', 'café']);
  const final = useRef<HTMLDivElement>(null);
  const campoMensagem = useRef<HTMLTextAreaElement>(null);
  const mensagens = conversa.historico[conversa.sala] || [];
  const conectado = conversa.estado === 'conectado';
  const quantidade = Object.values(conversa.historico).reduce(function contarMensagens(total, lista) { return total + lista.length; }, 0);

  useEffect(function rolarConversa() {
    final.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  }, [mensagens.length, conversa.sala]);

  function alternarTema() { definirEscuro(!escuro); }
  function selecionarSala(nome: string) { conversa.trocarSala(nome); definirMenuAberto(false); campoMensagem.current?.focus(); }
  function adicionarSala(evento: FormEvent) {
    evento.preventDefault();
    const nome = novaSala.trim().toLowerCase().replace(/[^\p{L}\p{N}_-]/gu, '-');
    if (!nome) return;
    if (!salas.includes(nome)) definirSalas([...salas, nome]);
    selecionarSala(nome); definirNovaSala(''); definirNovaSalaAberta(false);
  }
  function enviarMensagem(evento?: FormEvent) {
    evento?.preventDefault();
    if (conversa.enviarMensagem(conteudo, usuario)) { definirConteudo(''); campoMensagem.current?.focus(); }
  }
  function tratarTecla(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === 'Enter' && !evento.shiftKey && !evento.nativeEvent.isComposing) { evento.preventDefault(); enviarMensagem(); }
  }
  function acionarConexao() {
    if (conversa.estado !== 'desconectado') void conversa.desconectarWebSocket();
    else void conversa.conectarWebSocket(endereco, usuario);
  }

  return (
    <div className={`editorial ${escuro ? 'dark' : ''}`}>
      <header className="cabecalho">
        <a href="/" className="marca" aria-label="Entrelinhas, início">entrelinhas<span className="ponto-marca">.</span></a>
        <div className="assinatura">BOAS CONVERSAS, EM TEMPO REAL.</div>
        <div className="acoes-cabecalho">
          <span className={`estado estado-${conversa.estado}`}><i />{conversa.estado === 'conectado' ? 'Conectado' : conversa.estado === 'conectando' ? 'Conectando' : 'Desconectado'}</span>
          <span className="divisoria-curta" />
          <Button variant="ghost" size="icon" onClick={alternarTema} title={escuro ? 'Modo claro' : 'Modo escuro'} aria-label={escuro ? 'Ativar modo claro' : 'Ativar modo escuro'}>{escuro ? <Sun /> : <Moon />}</Button>
        </div>
      </header>
      <div className="abertura"><span>UM ESPAÇO PARA TROCAR IDEIAS.</span><span>SEM PRESSA. SEM RUÍDO.</span></div>
      <main className="estrutura">
        <aside className={`barra-lateral ${menuAberto ? 'aberta' : ''}`}>
          <div className="titulo-secao"><span>SEU ESPAÇO</span><span>01 —</span></div>
          <h1>A conversa<br />começa aqui.</h1>
          <p className="introducao">Escolha uma sala.<br />Traga seu ponto de vista.</p>
          <div className="titulo-salas"><span>SALAS DE CONVERSA</span><Button variant="ghost" size="icon" title="Criar sala" aria-label="Criar sala" onClick={function abrirNovaSala() { definirNovaSalaAberta(!novaSalaAberta); }}>{novaSalaAberta ? <X /> : <Plus />}</Button></div>
          {novaSalaAberta && <form className="formulario-sala" onSubmit={adicionarSala}><input aria-label="Nome da nova sala" placeholder="nome-da-sala" value={novaSala} maxLength={40} onChange={function editarSala(evento) { definirNovaSala(evento.target.value); }} autoFocus /><Button size="icon" type="submit" title="Adicionar sala" aria-label="Adicionar sala"><ArrowRight /></Button></form>}
          <nav className="lista-salas" aria-label="Salas de conversa">{salas.map(function renderizarSala(nome, indice) { return <Button key={nome} variant="ghost" className={`sala ${conversa.sala === nome ? 'selecionada' : ''}`} onClick={function escolherSala() { selecionarSala(nome); }}><Hash /><span>{nome}</span><span className="numero-sala">0{indice + 1}</span>{conversa.sala === nome && <span className="indicador-sala" />}</Button>; })}</nav>
          <div className="identidade">
            <div className="titulo-secao"><span>SUA IDENTIDADE</span><span>02 —</span></div>
            <label htmlFor="nome">Como podemos chamar você?</label>
            <input id="nome" value={usuario} disabled={conversa.estado !== 'desconectado'} onChange={function editarUsuario(evento) { definirUsuario(evento.target.value); }} placeholder="Seu nome" maxLength={50} autoComplete="nickname" />
            <Button className="botao-conectar" onClick={acionarConexao} disabled={!usuario.trim() && conversa.estado === 'desconectado'}>{conversa.estado === 'conectado' ? 'Desconectar' : conversa.estado === 'conectando' ? 'Cancelar conexão' : 'Entrar na conversa'}{conversa.estado === 'conectado' ? <Check /> : <ArrowRight />}</Button>
            <Button variant="ghost" className="botao-configuracao" onClick={function abrirConfiguracao() { definirConfiguracao(true); }}><Settings2 />Configurar conexão</Button>
          </div>
          <figure className="fotografia"><img src={fotografia} alt="Ramo sobre a água, em preto e branco" width={1024} height={512} /><figcaption>CONEXÕES QUE FLUEM.</figcaption></figure>
          <div className="nota-lateral"><span className="asterisco">✳</span><p>Pequenas conversas.<br />Novas perspectivas.</p></div>
        </aside>
        <section className="conversa" aria-label={`Conversa na sala ${conversa.sala}`}>
          <div className="cabecalho-conversa">
            <div className="nome-canal"><Button className="menu-mobile" variant="ghost" size="icon" aria-label="Abrir salas" onClick={function abrirMenu() { definirMenuAberto(!menuAberto); }}><Menu /></Button><span className="hash-titulo">#</span><div><h2>{conversa.sala}</h2><p>{conversa.sala === 'geral' ? 'Um pouco de tudo. Um lugar para todos.' : `Ideias, encontros e conversas sobre ${conversa.sala}.`}</p></div></div>
            <div className="selo-tempo"><Radio /><span>AO VIVO</span></div>
          </div>
          <div className="faixa-sessao"><span><span className="ponto-sessao" />{conectado ? `Você está na sala ${conversa.sala}` : 'A sala está aberta. Entre e faça parte.'}</span><span>CONVERSA Nº {String(salas.indexOf(conversa.sala) + 1).padStart(2, '0')}</span></div>
          <div className="mensagens" role="log" aria-live="polite" aria-label="Mensagens da sessão">
            {mensagens.length === 0 ? <div className="boas-vindas"><div className="simbolo-vazio"><span /><Hash /><span /></div><span className="rotulo-vazio">O INÍCIO DE UMA BOA TROCA</span><h3>Há espaço para<br />a sua voz.</h3><p>Uma ideia, uma pergunta ou só um olá.<br />Toda boa conversa começa com uma mensagem.</p><div className="convite"><span />{conectado ? 'QUE TAL DAR O PRIMEIRO PASSO?' : 'ENTRE PARA COMEÇAR'}<span /></div><ArrowDown className="seta-vazio" /></div> : <div className="lista-mensagens"><div className="separador-data">NESTA SESSÃO</div>{mensagens.map(function renderizarMensagem(mensagem, indice) { const propria = mensagem.from === usuario.trim(); return <article key={`${mensagem.timeStamp}-${indice}`} className={`mensagem ${propria ? 'propria' : ''}`}><div className="avatar">{mensagem.from.slice(0, 2).toUpperCase()}</div><div className="corpo-mensagem"><div className="autor"><strong>{mensagem.from}</strong>{propria && <span>VOCÊ</span>}<time dateTime={mensagem.timeStamp}>{formatarDataHora(mensagem.timeStamp)}</time></div><p>{mensagem.content}</p></div></article>; })}</div>}
            <div ref={final} />
          </div>
          <div className="area-compositor">
            {conversa.erro && <p className="erro-conexao" role="alert">{conversa.erro}</p>}
            <form className="compositor" onSubmit={enviarMensagem}>
              <textarea ref={campoMensagem} aria-label="Sua mensagem" value={conteudo} onChange={function editarMensagem(evento) { definirConteudo(evento.target.value); }} onKeyDown={tratarTecla} placeholder={conectado ? `Sua mensagem para #${conversa.sala}…` : 'Sua próxima conversa começa com um olá…'} maxLength={10000} rows={2} disabled={!conectado} />
              <div className="rodape-compositor"><span><i />{conectado ? `Conversando como ${usuario}` : 'Conecte-se para enviar mensagens'}</span><Button type="submit" disabled={!conectado || !conteudo.trim()} className="botao-enviar">Enviar <ArrowRight /></Button></div>
            </form>
            <div className="nota-conversa"><span>RESPEITO FAZ PARTE DA CONVERSA.</span><span>{mensagens.length} {mensagens.length === 1 ? 'mensagem' : 'mensagens'} nesta sala</span></div>
          </div>
        </section>
      </main>
      <footer className="rodape"><span>entrelinhas<span className="ponto-marca">.</span><span className="rodape-descricao"> FEITO PARA CONECTAR PESSOAS.</span></span><span>{quantidade} {quantidade === 1 ? 'mensagem' : 'mensagens'} nesta sessão <span className="separador-rodape">/</span> Em tempo real</span></footer>
      {configuracao && <div className="fundo-modal" onClick={function fecharFundo(evento) { if (evento.target === evento.currentTarget) definirConfiguracao(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-conexao"><div className="titulo-modal"><h2 id="titulo-conexao">Sua conexão.</h2><Button variant="ghost" size="icon" aria-label="Fechar configuração" onClick={function fecharConfiguracao() { definirConfiguracao(false); }}><X /></Button></div><label htmlFor="endereco">Endereço do servidor</label><input id="endereco" autoFocus type="url" value={endereco} disabled={conversa.estado !== 'desconectado'} onChange={function editarEndereco(evento) { definirEndereco(evento.target.value); }} /><p className="detalhe-conexao">Spring Boot · STOMP / SockJS</p><div className="destinos"><span>ENVIO</span><code>/app/chat.send/{conversa.sala}</code><span>RECEBIMENTO</span><code>/topic/chat/{conversa.sala}</code></div><Button className="w-full" onClick={function salvarConfiguracao() { definirConfiguracao(false); }}>Concluir <Check /></Button></section></div>}
    </div>
  );
}
