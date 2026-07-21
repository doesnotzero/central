import React, { useEffect, useMemo, useState } from "react";
import { BRANDING } from "./config/branding.js";
import { ASSETS } from "./config/assets.js";

const logoSrc = ASSETS.logoUrl;
const socialInstagram = import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com/doesnotzero";

const portfolioItems = [
  { title: "Dashboard executivo", category: "Cockpit operacional", vimeoId: "1177779611", thumb: ASSETS.productScreenshots?.[0], featured: true },
  { title: "CRM e pipeline", category: "Comercial", vimeoId: "1177775878", thumb: ASSETS.productScreenshots?.[1] },
  { title: "Video Review", category: "Aprovação de clientes", vimeoId: "1177774829", thumb: ASSETS.productScreenshots?.[2] },
  { title: "Financeiro e relatórios", category: "Gestão", vimeoId: "1177798436", thumb: ASSETS.productScreenshots?.[3], vertical: true }
];

const packages = [
  ["STARTER", "Para freelancers e pequenos estudios que precisam sair da planilha.", "01 / ESSENCIAL", "STARTER - sistema audiovisual", "Organizacao inicial", ["CRM simples com pipeline", "Projetos, prazos e tarefas", "Documentos operacionais", "Backup e exportacao", "Video Review basico", "Ideal para: operacao enxuta"]],
  ["PRO", "Para produtoras em crescimento que precisam de previsibilidade.", "02 / CRESCIMENTO", "PRO - operacao completa", "Gestao de produtora", ["CRM avancado e propostas", "Projetos com briefing e checklist", "Financeiro e relatorios", "Video Review com comentarios", "Command Palette e automacoes", "Ideal para: times comerciais e producao"]],
  ["ENTERPRISE", "Para operacoes multi-time, whitelabel e clientes com escala.", "03 / WHITELABEL", "ENTERPRISE - whitelabel", "SaaS multi-tenant", ["Branding configuravel", "Workspaces e permissoes", "Limites e features por cliente", "Setup de deploy dedicado", "Relatorios executivos", "Ideal para: redes, agencias e franquias"]]
];

const leadDefaults = {
  project: "",
  service: "",
  package: "",
  deadline: "",
  name: "",
  phone: "",
  company: "",
  message: ""
};

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 6v12l10-6L9 6Z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.34 4.95L2.05 22l5.27-1.38a9.86 9.86 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.51 2 12.04 2Zm0 18.12h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.25-4.35c0-4.53 3.69-8.21 8.22-8.21a8.2 8.2 0 0 1 8.21 8.21c0 4.53-3.68 8.21-8.21 8.21Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.96-.14.17-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.16 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.48-.29Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.7 2.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Z" />
  </svg>
);

const SectionHead = ({ label, title, subtitle }) => (
  <div className="dnz-sec-head">
    <div className="dnz-sec-label">{label}</div>
    <h2 className="dnz-sec-title">{title}</h2>
    {subtitle && <p className="dnz-sec-sub">{subtitle}</p>}
  </div>
);

const VideoButton = ({ item, onPlay, className = "" }) => (
  <button type="button" className={className} onClick={() => onPlay(item)} aria-label={`Assistir ${item.title}`}>
    <img src={item.thumb} alt={item.title} loading={item.featured ? "eager" : "lazy"} />
    <span className="dnz-video-shade" />
    <span className="dnz-play"><PlayIcon /></span>
    <span className="dnz-work-caption">
      <span>{item.category}</span>
      <strong>{item.title}</strong>
    </span>
  </button>
);

const LoginPage = ({ session, isAdmin, adminEmails, cloudStatus, onLogin, onLogout, onHome }) => (
  <main id="main-content" className="dnz-login-page">
    <div className="dnz-login-bg" />
    <section className="dnz-login-card">
      <div className="dnz-login-top">
        <button type="button" className="dnz-login-logo" onClick={onHome} aria-label={`Voltar para ${BRANDING.brandName}`}>
          <img src={ASSETS.loginLogoUrl || logoSrc} alt={BRANDING.brandName} />
        </button>
        <span>{cloudStatus === "loading" ? "Verificando" : session?.user ? "Conta conectada" : "Acesso privado"}</span>
      </div>
      <div className="dnz-login-kicker">{BRANDING.appSubtitle}</div>
      <h1>Area reservada.</h1>
      <p>
        Acesso interno para revisar clientes, propostas, projetos, documentos, financeiro e Video Review da {BRANDING.brandName}.
        Entre apenas com a conta autorizada.
      </p>
      {session?.user && !isAdmin && (
        <div className="dnz-denied">
          <strong>Conta sem permissao</strong>
          <span>{session.user.email || "Esta conta"} nao esta liberada para este workspace.</span>
        </div>
      )}
      {session?.user && isAdmin && (
        <div className="dnz-allowed">
          <strong>Acesso liberado</strong>
          <span>{session.user.email}</span>
        </div>
      )}
      <div className="dnz-login-actions">
        {session?.user ? (
          <>
            {isAdmin && <a className="dnz-btn-red" href="/app">Abrir workspace</a>}
            <button type="button" className="dnz-btn-ghost" onClick={onLogout}>Sair desta conta</button>
          </>
        ) : (
          <button type="button" className="dnz-btn-red" onClick={onLogin}>Entrar</button>
        )}
        <button type="button" className="dnz-btn-ghost" onClick={onHome}>Voltar para o site</button>
      </div>
      <div className="dnz-login-meta">
        <span>{cloudStatus === "loading" ? "Verificando sessao..." : `${BRANDING.brandName} / ${BRANDING.appSubtitle}`}</span>
      </div>
    </section>
  </main>
);

const LandingPage = ({ onLogin }) => {
  const [video, setVideo] = useState(null);
  const [lead, setLead] = useState(leadDefaults);

  useEffect(() => {
    if (document.activeElement?.classList?.contains("skip-link")) document.activeElement.blur();
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const whatsappUrl = useMemo(() => {
    const lines = [
      `Ola, ${BRANDING.brandName}! Vim pelo site e quero conhecer o sistema.`,
      lead.name && `Nome: ${lead.name}`,
      lead.phone && `WhatsApp: ${lead.phone}`,
      lead.company && `Empresa: ${lead.company}`,
      lead.project && `Operacao: ${lead.project}`,
      lead.service && `Desafio: ${lead.service}`,
      lead.package && `Plano de interesse: ${lead.package}`,
      lead.deadline && `Timing: ${lead.deadline}`,
      lead.message && `Contexto: ${lead.message}`
    ].filter(Boolean);
    return `https://wa.me/${BRANDING.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [lead]);

  const updateLead = (field, value) => setLead(prev => ({ ...prev, [field]: value }));
  const ChoiceButton = ({ field, value, children }) => (
    <button
      type="button"
      className={`dnz-form-opt ${lead[field] === value ? "sel" : ""}`}
      onClick={() => updateLead(field, value)}
      aria-pressed={lead[field] === value}
    >
      <span className="dnz-opt-mark" />
      {children}
    </button>
  );
  return (
    <main id="main-content" className="dnz-site">
      <nav className="dnz-nav">
        <a href="#inicio" className="dnz-nav-logo" aria-label={BRANDING.brandName}>
          <img src={logoSrc} alt={BRANDING.brandName} />
        </a>
        <div className="dnz-nav-right">
          <a href="#trabalhos">Produto</a>
          <a href="#cases">Cases</a>
          <a href="#sobre">Sobre</a>
          <a href="#pacotes">Planos</a>
          <button type="button" onClick={onLogin}>Login</button>
          <a className="dnz-nav-cta" href="#briefing">Agendar demo</a>
        </div>
      </nav>

      <header id="inicio" className="dnz-hero">
        <div className="dnz-hero-bg"><span /><span /><span /></div>
        <div className="dnz-hero-copy">
          <div className="dnz-tag">Sistema operacional audiovisual</div>
          <h1>{BRANDING.appSubtitle.split(" ").map((word, index) => <React.Fragment key={word}>{index > 0 && <br />}{word}</React.Fragment>)}</h1>
          <div className="dnz-sub">{BRANDING.brandName}</div>
          <div className="dnz-hero-bottom">
            <p><strong>CRM. Projetos. Financeiro.</strong><br />Centralize clientes, propostas, documentos, entregas e reviews em um so lugar.</p>
            <div>
              <a className="dnz-btn-red" href="#briefing">Agendar demo</a>
              <a className="dnz-btn-link" href="#trabalhos">Ver produto</a>
            </div>
          </div>
        </div>
        <button type="button" className="dnz-reel" onClick={() => setVideo({ title: `Demo ${BRANDING.brandName}`, category: "Demo do sistema", vimeoId: "1177771656" })}>
          <img src={ASSETS.heroPreviewUrl} alt={`Demo ${BRANDING.brandName}`} />
          <span>
            <small>Demo</small>
            <strong>VEJA A OPERACAO.</strong>
          </span>
          <i><PlayIcon /></i>
        </button>
      </header>

      <div className="dnz-ticker" aria-hidden="true">
        <div>
          {["CRM", "PROJETOS", "DOCUMENTOS", "FINANCEIRO", "VIDEO REVIEW", "ANALYTICS", "COMMAND PALETTE", "WHITELABEL", "CRM", "PROJETOS", "DOCUMENTOS", "FINANCEIRO"].map((item, idx) => <span key={`${item}-${idx}`}>{item}<b /></span>)}
        </div>
      </div>

      <section className="dnz-problem">
        <div>
          <div className="dnz-sec-label">O problema</div>
          <h2>SUA<br />OPERACAO<br /><span>MERECE</span><br />MAIS.</h2>
        </div>
        <div>
          <p>Voce tem multiplos clientes, projetos em andamento, propostas espalhadas e financeiro manual.</p>
          <p><strong>Mas a informacao vive fragmentada entre planilhas, WhatsApp, e-mail e memoria da equipe.</strong></p>
          <p>O resultado e retrabalho: briefing perdido, prazo que escapa, cliente sem retorno e aprovacao confusa.</p>
          <p>O {BRANDING.brandName} existe para resolver isso: centralizar a operacao audiovisual com clareza, automacao e contexto.</p>
        </div>
      </section>

      <section className="dnz-solutions">
        {[
          ["01", "CRM", "Gestao de clientes, pipeline comercial, propostas e historico de interacoes em uma tela."],
          ["02", "PROJETOS", "Fluxo completo do briefing a entrega, com prazos, checklist, equipe e status de producao."],
          ["03", "DOCUMENTOS", "Briefing, roteiro, callsheet, checklist e relatorios com exportacao pronta para PDF."]
        ].map(([n, title, text]) => (
          <article key={n}>
            <small>{n}</small>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section id="trabalhos" className="dnz-work">
        <SectionHead label="Produto" title={<>MODULOS<br />PRINCIPAIS.</>} />
        <div className="dnz-work-grid">
          {portfolioItems.map(item => <VideoButton key={item.vimeoId} item={item} onPlay={setVideo} className={`dnz-work-card ${item.featured ? "featured" : ""}`} />)}
        </div>
      </section>

      <section id="cases" className="dnz-cases">
        <SectionHead label="Resultados" title={<>PROVA<br />OPERACIONAL.</>} />
        {[
          ["01", "10H/SEMANA", "Produtora com 6 clientes ativos", "\"Antes usava 3 planilhas diferentes. Agora tudo fica no mesmo sistema e a equipe sabe o que fazer.\"", "Diretor de producao", "Menos retrabalho"],
          ["02", "REVIEWS", "Aprovacao de videos e comentarios", "\"O cliente comenta no ponto certo do video e a revisao vira tarefa. Parou de sumir ajuste no WhatsApp.\"", "Editor lider", "Fluxo claro", "1177774829"],
          ["03", "SUA OPERACAO", "Setup whitelabel / SaaS audiovisual", "Organize CRM, producao, documentos, financeiro e relatorios antes da escala cobrar a conta.", "", ""],
        ].map(([n, title, type, quote, cite, label, vimeoId]) => (
          <article key={title} className={vimeoId ? "case-link" : ""} onClick={() => vimeoId && setVideo({ title, category: "Case", vimeoId })}>
            <small>{n}</small>
            <strong>{title}<span>{type}</span></strong>
            <p>{quote}{cite && <cite>— {cite}</cite>}</p>
            <div className="dnz-case-stat">
              {label ? <><b>∅</b><span>{label}</span></> : <a className="dnz-btn-red" href="#briefing" onClick={event => event.stopPropagation()}>Agendar demo</a>}
            </div>
          </article>
        ))}
      </section>

      <section id="sobre" className="dnz-about">
        <div>
          <SectionHead label="Sistema" title={<>CRIADO PARA<br />PRODUTORAS.</>} />
          <p><strong>{BRANDING.brandName}</strong> organiza a parte invisivel da producao audiovisual: cliente, proposta, briefing, prazo, revisao, financeiro e entrega.</p>
          <p>O foco e simples: reduzir retrabalho, guardar contexto e transformar uma operacao criativa em um processo claro para equipe, cliente e gestao.</p>
          <div className="dnz-about-facts">
            <span><b>Comercial</b> Leads, propostas e pipeline</span>
            <span><b>Producao</b> Briefing, checklist e prazos</span>
            <span><b>Gestao</b> Financeiro, relatorios e reviews</span>
          </div>
        </div>
        <img src={ASSETS.aboutImageUrl} alt={`Operacao ${BRANDING.brandName}`} />
      </section>

      <section id="pacotes" className="dnz-packages">
        <SectionHead label="Planos" title={<>ESCOLHA<br />SEU FORMATO.</>} subtitle="Tres caminhos para organizar a operacao audiovisual: do estúdio enxuto ao whitelabel multi-tenant." />
        <div>
          {packages.map(([title, tag, note, packageValue, presetValue, items], idx) => (
            <article key={title} className={idx === 1 ? "hot" : ""}>
              <small>{note}</small>
              <h3>{title}</h3>
              <p>{tag}</p>
              <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
              <a href="#briefing" onClick={() => setLead(prev => ({ ...prev, package: packageValue, project: presetValue }))}>{title === "ENTERPRISE" ? "Falar com vendas" : `Quero o ${title}`}</a>
            </article>
          ))}
        </div>
      </section>

      <section id="briefing" className="dnz-briefing">
        <div className="dnz-form-wrap">
          <SectionHead label="Demo" title={<>4 PERGUNTAS.<br />DEMO DIRETA.</>} subtitle="Conte como sua produtora opera hoje e receba uma conversa objetiva sobre setup, plano e proximos passos." />
          <div className="dnz-form-steps" aria-hidden="true"><span className="active" /><span /><span /><span /></div>
        </div>
        <form className="dnz-form-wrap" onSubmit={event => { event.preventDefault(); window.open(whatsappUrl, "_blank", "noopener,noreferrer"); }}>
          <div className="dnz-form-block">
            <h3>Como e sua <em>operacao?</em></h3>
            <p>Escolha a opcao que mais se encaixa</p>
            <div className="dnz-form-opts">
              {["Freelancer com clientes pontuais","Pequeno estudio com 2-5 pessoas","Produtora com equipe e varios projetos","Agencia com demandas audiovisuais recorrentes","Operacao multi-unidade / whitelabel","Outro - explico melhor no WhatsApp"].map(item => <ChoiceButton key={item} field="project" value={item}>{item}</ChoiceButton>)}
            </div>
          </div>
          <div className="dnz-form-block">
            <h3>O que precisa <em>organizar?</em></h3>
            <p>Principais dores da operacao</p>
            <div className="dnz-form-opts">
              {["CRM e propostas","Projetos, prazos e entregas","Documentos e checklist de producao","Video Review com cliente","Financeiro e relatorios","Tudo isso em um fluxo so"].map(item => <ChoiceButton key={item} field="service" value={item}>{item}</ChoiceButton>)}
            </div>
            <p className="dnz-form-hint">Plano de interesse</p>
            <div className="dnz-form-opts">
              {["STARTER - sistema audiovisual","PRO - operacao completa","ENTERPRISE - whitelabel","Ainda nao sei o plano"].map(item => <ChoiceButton key={item} field="package" value={item}>{item}</ChoiceButton>)}
            </div>
          </div>
          <div className="dnz-form-grid">
            <label>Timing
              <input value={lead.deadline} onChange={event => updateLead("deadline", event.target.value)} placeholder="Ex: este mes, proximo trimestre..." />
            </label>
            <label>Nome
              <input value={lead.name} onChange={event => updateLead("name", event.target.value)} placeholder="Como voce se chama?" autoComplete="name" required />
            </label>
            <label>WhatsApp
              <input value={lead.phone} onChange={event => updateLead("phone", event.target.value)} placeholder="(48) 99999-9999" autoComplete="tel" inputMode="tel" required />
            </label>
            <label>Empresa
              <input value={lead.company} onChange={event => updateLead("company", event.target.value)} placeholder="Nome da produtora / agencia" />
            </label>
            <label className="wide">Contexto
              <textarea value={lead.message} onChange={event => updateLead("message", event.target.value)} rows="4" placeholder="Como voces controlam clientes, projetos, revisoes, financeiro e documentos hoje?" />
            </label>
          </div>
          <div className="dnz-form-nav">
            <span>1 / 4</span>
            <button type="submit" className="dnz-btn-red">Enviar via WhatsApp</button>
          </div>
        </form>
      </section>

      <section className="dnz-final">
        <div>Pronto para organizar?</div>
        <h2>ORGANIZE<br />SUA<br />OPERACAO.</h2>
        <p className="dnz-final-actions">
          <a className="dnz-final-primary" href="#briefing"><span>Agendar demo</span><b>→</b></a>
          <a className="dnz-final-secondary" href={socialInstagram} target="_blank" rel="noopener noreferrer"><InstagramIcon /><span>Ver atualizacoes do produto</span></a>
        </p>
      </section>

      <footer className="dnz-footer">
        <img src={logoSrc} alt={BRANDING.brandName} />
        <div><strong>{BRANDING.brandName} / {BRANDING.appSubtitle}</strong><span>Sistema operacional audiovisual</span><span>© {new Date().getFullYear()} {BRANDING.brandName}. Todos os direitos reservados.</span></div>
        <nav>
          <a href={`https://wa.me/${BRANDING.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="#trabalhos">Produto</a>
          <a href={socialInstagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <button type="button" onClick={onLogin}>Login</button>
        </nav>
      </footer>

      <div className="dnz-float-actions">
        <a className="dnz-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp"><WhatsAppIcon /></a>
        <a className="dnz-instagram" href={socialInstagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${BRANDING.brandName}`}><InstagramIcon /></a>
      </div>

      {video && (
        <div className={`dnz-lightbox ${video.vertical ? "vertical" : ""}`} role="dialog" aria-modal="true" onClick={() => setVideo(null)}>
          <div className="dnz-lightbox-dialog" onClick={event => event.stopPropagation()}>
            <button type="button" onClick={() => setVideo(null)} aria-label="Fechar video">x</button>
            <header><span>{video.category}</span><strong>{video.title}</strong></header>
            <iframe
              title={video.title}
              src={`https://player.vimeo.com/video/${video.vimeoId}?autoplay=1&autopause=0&title=0&byline=0&portrait=0&dnt=1`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </main>
  );
};

export { LandingPage, LoginPage };
