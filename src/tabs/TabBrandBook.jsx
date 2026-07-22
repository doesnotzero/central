import React, { useMemo, useRef, useState } from "react";
import logoMain from "../../assets/brand/dnz-logo-main.png";
import logoDark from "../../assets/brand/dnz-logo-dark.png";
import logoOrangeLight from "../../assets/brand/dnz-logo-orange-light.png";
import logoDoesNotZeroLight from "../../assets/brand/does-not-zero-light.png";
import logoLight from "../../assets/brand/dnz-logo-light.png";

const BRAND_COLORS = [
  { name: "Preto principal", hex: "#0B0B0B", role: "Primária", cmyk: "C0 M0 Y0 K96", pantone: "PMS Black 6 C", usage: "Base da marca, fundos, capas e contraste cinematográfico." },
  { name: "Branco principal", hex: "#F5F5F3", role: "Primária", cmyk: "C1 M1 Y2 K0", pantone: "PMS Cool Gray 1 C", usage: "Documentos, respiro visual, contraste e leitura premium." },
  { name: "Acento principal", hex: "#FF2400", role: "Acento", cmyk: "C0 M90 Y95 K0", pantone: "PMS 172 C", usage: "Corte, CTA, linha de energia, marcação e assinatura visual." },
  { name: "Areia", hex: "#C8B08A", role: "Editorial", cmyk: "C20 M28 Y45 K8", pantone: "PMS 7502 C", usage: "Textura, legenda, tom humano e peças editoriais." },
  { name: "Verde profundo", hex: "#1E3A34", role: "Apoio", cmyk: "C80 M45 Y65 K55", pantone: "PMS 5605 C", usage: "Aprovação, estabilidade, arquivos fechados e status positivo." },
];

const LOGOS = [
  { title: "Logo principal - fundo escuro", file: "dnz-logo-main.png", src: logoMain, format: "PNG", usage: "Aplicação oficial em fundo preto, peças digitais e apresentações internas." },
  { title: "Logo textura - fundo escuro", file: "dnz-logo-dark.png", src: logoDark, format: "PNG", usage: "Versão com peso cinematográfico para capas, PDF e moodboards." },
  { title: "Logo acento", file: "dnz-logo-orange-light.png", src: logoOrangeLight, format: "PNG", usage: "Uso em fundo claro quando a marca precisa ter presença de campanha." },
  { title: "Assinatura vertical", file: "does-not-zero-light.png", src: logoDoesNotZeroLight, format: "PNG", usage: "Peças editoriais, assinatura conceitual e variação tipográfica." },
  { title: "Logo claro", file: "dnz-logo-light.png", src: logoLight, format: "PNG", usage: "Documentos, propostas, capas claras e materiais de leitura." },
];

const TYPOGRAPHY = [
  { label: "DISPLAY", name: "Bebas Neue", specimen: "DOES NOT ZERO", use: "Títulos, capas, chamadas curtas e impacto. Sempre em caixa alta." },
  { label: "CORPO", name: "Archivo", specimen: "O processo importa tanto quanto o resultado.", use: "Interface, textos longos, formulários, notas e documentação." },
  { label: "EDITORIAL", name: "Instrument Serif", specimen: "A jornada antes da conquista.", use: "Manifesto, citações e frases com peso humano. Uso pontual." },
  { label: "TÉCNICO", name: "JetBrains Mono", specimen: "CLIENTE_20260619_MASTER_v01.mov", use: "Tokens, specs, nomes de arquivos, metadados e versões." },
];

const PHILOSOPHY = [
  ["01", "Toda experiência gera aprendizado.", "O que se vive não desaparece. O que se sente vira matéria-prima."],
  ["02", "Toda jornada gera evolução.", "Ninguém atravessa um caminho e permanece o mesmo. Distância é transformação."],
  ["03", "Toda construção possui valor.", "O que se constrói com tempo carrega densidade. Cada camada importa."],
  ["04", "Toda história deixa marcas.", "O que foi vivido permanece. A marca preserva essas marcas."],
];

const ESSENCES = [
  { index: "01", title: "Shape & Craft", text: "Shapers, artesãos e pessoas que constroem com as mãos. O processo manual como forma de arte.", tags: "LIXADEIRA · RESINA · PACIÊNCIA · FORMA" },
  { index: "02", title: "Surf & Água", text: "Surfistas, sessões e ondas. Não o surf genérico de câmera lenta, mas o surf de quem vive no mar.", tags: "MAR · LUZ · SESSÃO · SILÊNCIO" },
  { index: "03", title: "Jornada de Atleta", text: "Atletas que escolhem provas que a maioria não termina. A câmera está nos meses antes da linha de chegada.", tags: "TREINO · DESERTO · LIMITE · RETORNO" },
];

const PERSONALITY = [
  ["01", "Observador", "Vê antes de mostrar. Nunca reage: registra."],
  ["02", "Autoral", "Tem ponto de vista. Não executa pedido: propõe visão."],
  ["03", "Silencioso", "Não precisa explicar o que faz. O trabalho fala."],
  ["04", "Presente", "Está no lugar, no momento, com atenção total."],
  ["05", "Profundo", "Procura camadas. Não confunde pressa com entrega."],
];

const POSITIONING_YES = ["Autoral", "Cinematográfica", "Humana", "Cultural", "Profunda", "De processo"];
const POSITIONING_NO = ["Agência genérica", "Social media comum", "Produtora corporativa", "Empresa de marketing", "Câmera de aluguel"];

const ICONS = ["Processo", "Frame", "Entrega", "Jornada", "Câmera", "Áudio", "Movimento", "Surf"];
const COMPONENTS = [
  { title: "Botões", items: ["Primário", "Secundário", "Acento"], rule: "bg: #FF2400 · color: #0B0B0B · font: Bebas Neue · radius: 2px" },
  { title: "Tags & Labels", items: ["LOOP", "MOTION", "ZERO", "ATIVO"], rule: "font-size: 9px · weight: 700 · letter-spacing: .2em · caps" },
  { title: "Citação Editorial", items: ["Filmamos a jornada. Não o resultado."], rule: "Instrument Serif · italic · respiro lateral" },
];

const VIDEO_SPECS = [
  ["Codec", "ProRes 422 HQ", "H.264 High Profile", "WMV · AVI · FLV"],
  ["Resolução", "3840x2160 (4K)", "1920x1080 (HD)", "Abaixo de 1080p"],
  ["Frame Rate", "23.976p", "25fps (PAL)", "Misturar frame rates"],
  ["Bitrate", "> 50 Mbps", "> 20 Mbps (web)", "Abaixo de 15 Mbps"],
  ["Cor", "Rec.709", "DCI-P3 (cinema)", "sRGB em master"],
  ["Áudio", "AAC 48kHz 320kbps", "PCM 24bit", "MP3 em entrega"],
  ["Container", ".mov", ".mp4", ".wmv · .avi"],
];

const SOCIAL_SPECS = [
  ["Instagram Reel", "9:16", "1080x1920", "≤ 90s", "H.264 · MP4"],
  ["Instagram Feed", "4:5", "1080x1350", "≤ 60s", "H.264 · MP4"],
  ["Instagram Story", "9:16", "1080x1920", "≤ 15s", "H.264 · MP4"],
  ["YouTube", "16:9", "3840x2160", "Livre", "H.264 · MP4"],
  ["YouTube Shorts", "9:16", "1080x1920", "≤ 60s", "H.264 · MP4"],
];

const COLOR_GRADING = [
  ["Temperatura", "Quente: 5200K", "Nunca fria sem intenção."],
  ["Contraste", "Alto nas sombras", "Sombras profundas sem perder detalhe."],
  ["Saturação", "-10 a -20%", "Dessaturado, nunca sem vida."],
  ["Grain", "Leve a moderado", "Textura e identidade. Nunca digital limpo."],
  ["Highlights", "Contidos", "Nunca estourar. Preservar detalhe na luz."],
  ["LUT Base", "Custom 042", "Cinematográfico quente. Nunca preset genérico."],
];

const CHECKLIST = [
  "Luz natural presente ou justificada",
  "Grão coerente com a cena",
  "Áudio ambiente captado no local",
  "Nenhum frame sem intenção narrativa",
  "Zero stock footage",
  "Frame rate correto",
  "Tons quentes preservados",
  "Sombras profundas sem perder detalhe",
  "Cortes respirados, sem pressa desnecessária",
  "Trilha serve a cena, não o contrário",
  "Master em ProRes ou H.264 correto",
  "Reels em 9:16 e feed em 4:5 quando necessário",
  "Nome do arquivo sem espaço ou acento",
  "Versão final marcada como v01, v02 ou final",
  "Thumbnail exportada",
  "Legenda ou contexto salvo",
  "Backup local feito",
  "Cliente recebeu link de revisão ou entrega",
];

const VOICE_YES = [
  "Três anos de preparo. Dois dias de prova. A câmera esteve nos três anos.",
  "O setup levou 40 minutos. A cena durou 8 segundos. Os 8 segundos valem os 40 minutos.",
  "Ele entrou no mar às 5h30. Ninguém estava olhando. Mas alguém estava filmando.",
];

const VOICE_NO = [
  "Produzimos conteúdo audiovisual premium de alta qualidade para atletas e marcas!",
  "Clique no link da bio e agende sua sessão fotográfica!",
  "A melhor produtora de vídeo de Florianópolis - resultados incríveis garantidos!",
];

const FAQ = [
  ["Posso usar o logo em fundo colorido?", "Somente preto ou branco. Exceção única: fundo laranja em adesivos ou peças físicas com limitação técnica."],
  ["Posso usar outra fonte nos materiais?", "Não. As três fontes cobrem todos os casos. Se a plataforma não suporta fonte customizada, usar Arial Bold como fallback de emergência."],
  ["Qual codec usar para entrega ao cliente?", "Master em ProRes 422 HQ .mov. Redes sociais em H.264 .mp4. Nunca entregar master comprimido como arquivo principal."],
  ["Posso usar áudio viral nos reels?", "Não como regra de marca. O áudio do lugar tem prioridade. Se usar trilha, ela precisa servir à cena."],
  ["Como nomear corretamente um arquivo?", "CLIENTE_AAAAMMDD_TIPO_v00.ext. Sem espaços, sem acentos, sem caracteres especiais e versões com dois dígitos."],
];

const SOCIAL_TYPES = [
  { title: "Frame", phrase: "O trabalho fala.", text: "Um frame ou sequência do projeto. Mínima legenda. A imagem carrega o peso.", freq: "Principal" },
  { title: "Afirmação", phrase: "O que você filma dura mais que a trend.", text: "Frase de manifesto. Visual limpo, texto como design. Sem decoração.", freq: "Semanal" },
  { title: "Processo", phrase: "Por trás do frame.", text: "Bastidores, setup, decisão de corte. A marca expõe o processo porque acredita nele.", freq: "Quinzenal" },
];

const DEFAULT_BRAND_BOOK = {
  version: "V.5",
  headline: "NINGUÉM VOLTA AO ZERO.",
  manifesto: "Antes de qualquer câmera, existe um processo que ninguém viu. A marca existe para registrar esses momentos: não o troféu, o que custou o troféu. Não a onda perfeita, os anos de água salgada nos olhos. Não a prancha, as mãos que a criaram. O processo é tão importante quanto o resultado.",
  principle: "A frase que dá nome, direção e gravidade a tudo o que fazemos.",
  ambition: "Não ser lembrada pelos vídeos. Ser lembrada pelas histórias preservadas.",
  positioning: "Produtora audiovisual autoral para marcas, atletas, shapers e projetos culturais que precisam transformar processo real em filme com direção.",
  audience: "Pessoas em construção, marcas com alma e cultura viva. Quem acredita que processo importa, valoriza autenticidade acima de perfeição e prefere uma história verdadeira a um vídeo bonito.",
};

const safeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[char]));

function triggerDownload(href, filename) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function className(...parts) {
  return parts.filter(Boolean).join(" ");
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
}

function Page({ id, eyebrow, title, children, theme = "dark", className: extra }) {
  return (
    <section id={id} className={className("brandbook-export-page", `brandbook-${theme}`, extra)}>
      <div className="brandbook-page-inner">
        <div className="bb-eyebrow">{eyebrow}</div>
        {title && <h2 className="bb-page-title">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

function SpecTable({ columns, rows }) {
  return (
    <table className="bb-spec-table">
      <thead><tr>{columns.map(col => <th key={col}>{col}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, i) => <td key={`${index}-${i}`}>{cell}</td>)}</tr>)}</tbody>
    </table>
  );
}

function buildStandaloneHtml(brand, form) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeText(brand)} - Brand Book</title><style>${BRANDBOOK_PRINT_CSS}</style></head><body><main class="brandbook-standalone"><h1>${safeText(form.headline)}</h1><p>${safeText(form.manifesto)}</p><p>${safeText(form.positioning)}</p></main></body></html>`;
}

const BRANDBOOK_PRINT_CSS = `
@page{size:A4 landscape;margin:0}body{margin:0;background:#050505;color:#f5f5f3;font-family:Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.brandbook-standalone{max-width:980px;margin:0 auto;padding:72px}.brandbook-standalone h1{font-size:92px;line-height:.86;margin:0 0 32px}.brandbook-standalone p{max-width:720px;font-size:22px;line-height:1.6;color:#c8c8c8}`;

export default function TabBrandBook({ state, dispatch, shared }) {
  const { C, Tag } = shared;
  const exportRef = useRef(null);
  const business = state?.business || {};
  const brandName = business.companyName || business.brandName || "Marca";
  const brandSlug = brandName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
  const logoAssets = useMemo(() => {
    if (!business.logoUrl) return LOGOS;
    return [
      { title: `Logo ${brandName}`, file: "logo-custom", src: business.logoUrl, format: "CUSTOM", usage: "Logo configurado no workspace atual." },
      ...LOGOS,
    ];
  }, [business.logoUrl, brandName]);
  const defaultBrandBook = {
    ...DEFAULT_BRAND_BOOK,
    manifesto: DEFAULT_BRAND_BOOK.manifesto.replace("A marca", `A ${brandName}`),
  };
  const [form, setForm] = useState(() => ({ ...defaultBrandBook, ...(state?.brandBook || {}) }));
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [checked, setChecked] = useState(() => new Set(CHECKLIST.slice(0, 5)));
  const savedDocs = (state?.studioDocs || []).filter(doc => doc.docType === "brandbook");
  const completion = Math.round((checked.size / CHECKLIST.length) * 100);

  const tokensCss = useMemo(() => BRAND_COLORS.map(color => `--dnz-${color.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}: ${color.hex};`).join("\n"), []);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const downloadLogo = logo => triggerDownload(logo.src, logo.file);

  const downloadTokens = () => {
    const blob = new Blob([tokensCss], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${brandSlug}-tokens.css`);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const downloadFontsGuide = () => {
    const guide = TYPOGRAPHY.map(font => `${font.label}\n${font.name}\n${font.use}`).join("\n\n");
    const blob = new Blob([guide], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${brandSlug}-fonts-guide.txt`);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const downloadHtml = () => {
    const html = buildStandaloneHtml(brandName, form);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${brandSlug}-brand-portal-${form.version}.html`);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const saveSnapshot = () => {
    dispatch?.({
      type: "ADD_STUDIO_DOC",
      doc: {
        docType: "brandbook",
        title: `Brand Book ${brandName} ${form.version}`,
        label: "Brand Book",
        payload: form,
      },
    });
  };

  const exportPdf = async () => {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    try {
      await document.fonts?.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      const pages = Array.from(exportRef.current.querySelectorAll(".brandbook-export-page"));
      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        const canvas = await html2canvas(page, {
          backgroundColor: page.classList.contains("brandbook-light") ? "#F5F5F3" : "#050505",
          scale: Math.min(2, window.devicePixelRatio || 1.5),
          useCORS: true,
          logging: false,
        });
        const image = canvas.toDataURL("image/jpeg", 0.95);
        if (index > 0) pdf.addPage();
        pdf.addImage(image, "JPEG", 0, 0, 297, 210, undefined, "FAST");
      }
      pdf.save(`${brandSlug}-brand-book.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const toggleChecklist = item => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  return (
    <div className="brandbook-shell">
      <style>{BRANDBOOK_TAB_CSS}</style>

      <header className="brandbook-control-hero">
        <div>
          <div className="bb-eyebrow">BRAND PORTAL · {brandName.toUpperCase()}</div>
          <h1>Brand Book {brandName}</h1>
          <p>Manual vivo da marca: manifesto, sistema visual, specs de produção, voz, redes, checklist e assets oficiais em uma área interna limpa.</p>
          <div className="brandbook-chip-row">
            <Tag color="#FF2400">20 páginas</Tag>
            <Tag color="#06b6d4">PDF A4 paisagem</Tag>
            <Tag color="#10b981">Assets oficiais</Tag>
          </div>
        </div>
        <div className="brandbook-actions">
          <button className="bb-btn bb-btn-ghost" onClick={() => setEditing(true)}>Editar conteúdo</button>
          <button className="bb-btn bb-btn-ghost" onClick={saveSnapshot}>Salvar versão</button>
          <button className="bb-btn bb-btn-ghost" onClick={downloadHtml}>Baixar HTML</button>
          <button className="bb-btn bb-btn-main" onClick={exportPdf} disabled={exporting}>{exporting ? "Gerando PDF..." : "Exportar PDF"}</button>
        </div>
      </header>

      <section className="brandbook-asset-panel">
        <div>
          <div className="bb-eyebrow">ARQUIVOS OFICIAIS</div>
          <h2>Logos em uma única seção.</h2>
          <p>Sem duplicar downloads em várias áreas. Esta é a gaveta oficial da marca para baixar a versão certa no momento certo.</p>
        </div>
        <div className="brandbook-logo-grid">
          {logoAssets.map(logo => (
            <button key={logo.file} className="brandbook-logo-card" onClick={() => downloadLogo(logo)}>
              <img src={logo.src} alt={logo.title} />
              <strong>{logo.title}</strong>
              <span>{logo.file}</span>
              <small>{logo.usage}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="brandbook-preview-tools">
        <div>
          <div className="bb-eyebrow">SISTEMA VISUAL</div>
          <h2>Tokens, fontes e checklist prontos para operação.</h2>
        </div>
        <div className="brandbook-tool-grid">
          <button onClick={downloadTokens}><strong>Tokens CSS</strong><span>Baixar paleta em variáveis</span></button>
          <button onClick={downloadFontsGuide}><strong>Guia de fontes</strong><span>Função de cada família</span></button>
          <button onClick={() => copyText(tokensCss)}><strong>Copiar tokens</strong><span>HEX direto para UI e docs</span></button>
          <button onClick={() => setChecked(new Set(CHECKLIST))}><strong>Checklist {completion}%</strong><span>Marcar tudo como pronto</span></button>
        </div>
      </section>

      <div className="brandbook-export-wrap" ref={exportRef}>
        <Page id="bb-cover" eyebrow="Branding Book" title={null} className="brandbook-cover-page">
          <div className="brandbook-cover-mark">
            <img src={business.logoUrl || logoDark} alt={brandName} />
            <span>Branding Book</span>
          </div>
          <div className="brandbook-cover-line" />
        </Page>

        <Page id="bb-manifesto" eyebrow="Marca · Manifesto" title="NINGUÉM VOLTA AO ZERO.">
          <div className="bb-two-col bb-manifesto-grid">
            <div className="bb-editorial-text">
              <p>{form.manifesto}</p>
              <p><strong>Motion never stops.</strong></p>
            </div>
            <div className="bb-side-notes">
              <h3>Princípio fundador</h3><p>{form.principle}</p>
              <h3>Referências de olhar</h3><p>Chris Burkard - o humano diante do ambiente real.<br />Red Bull - jornada como conteúdo, não publicidade.<br />180° South - processo, artesanato, profundidade filosófica.</p>
              <h3>A ambição</h3><p>{form.ambition}</p>
            </div>
          </div>
        </Page>

        <Page id="bb-filosofia" eyebrow="Marca · Filosofia" title="A FILOSOFIA" theme="light">
          <p className="bb-lead-dark">Quatro verdades que sustentam a marca.</p>
          <div className="bb-quad-grid">{PHILOSOPHY.map(([num, title, text]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </Page>

        <Page id="bb-posicionamento" eyebrow="Marca · Posicionamento" title="SOMOS / NÃO SOMOS">
          <p className="bb-lead">A {brandName} deve ser percebida de um jeito específico - e jamais de outro.</p>
          <div className="bb-two-col">
            <div className="bb-list-box positive"><h3>A marca é -</h3>{POSITIONING_YES.map(item => <strong key={item}>{item}</strong>)}</div>
            <div className="bb-list-box negative"><h3>A marca nunca é -</h3>{POSITIONING_NO.map(item => <strong key={item}>{item}</strong>)}</div>
          </div>
        </Page>

        <Page id="bb-strategy" eyebrow="Marca · Estratégia" title={`STP ${brandName}`}>
          <div className="bb-three-grid">
            <article><span>Segmento</span><h3>Surf, esporte, cultura e construção manual.</h3><p>Marcas, atletas e projetos em que processo tem mais valor que pressa.</p></article>
            <article><span>Target</span><h3>Pessoas em construção.</h3><p>Quem vive um caminho real e quer preservar a jornada antes da conquista.</p></article>
            <article><span>Posicionamento</span><h3>{form.positioning}</h3><p>Filme com direção, profundidade e assinatura visual.</p></article>
          </div>
        </Page>

        <Page id="bb-essencia" eyebrow="Marca · Essência" title={`O QUE A ${brandName.toUpperCase()} DOCUMENTA.`} theme="light">
          <p className="bb-lead-dark">O foco principal não é a câmera - é a transformação.</p>
          <div className="bb-essence-grid">{ESSENCES.map(item => <article key={item.index}><span>/ {item.index}</span><h3>{item.title}</h3><p>{item.text}</p><small>{item.tags}</small></article>)}</div>
        </Page>

        <Page id="bb-personalidade" eyebrow="Marca · Personalidade" title={`SE A ${brandName.toUpperCase()} FOSSE UMA PESSOA -`}>
          <div className="bb-personality-list">{PERSONALITY.map(([num, title, text]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </Page>

        <Page id="bb-assets" eyebrow="Assets para download" title="LOGO & ARQUIVOS">
          <div className="bb-assets-grid">{logoAssets.slice(0, 4).map(logo => <article key={logo.file}><img src={logo.src} alt={logo.title} /><h3>{logo.title}</h3><p>{logo.usage}</p><span>{logo.format}</span></article>)}</div>
        </Page>

        <Page id="bb-logo" eyebrow="Sistema Visual · Logo" title="LOGO & SISTEMA">
          <p className="bb-lead">Versões oficiais da marca {brandName} para aplicação em diferentes formatos e fundos.</p>
          <div className="bb-logo-system">{logoAssets.map(logo => <article key={logo.file}><img src={logo.src} alt={logo.title} /><div><h3>{logo.title}</h3><p>{logo.file}</p></div></article>)}</div>
        </Page>

        <Page id="bb-colors" eyebrow="Sistema Visual · Paleta" title="CORES & TOKENS">
          <div className="bb-color-grid">{BRAND_COLORS.map(color => <button key={color.hex} onClick={() => copyText(color.hex)}><i style={{ background: color.hex }} /><strong>{color.hex}</strong><span>{color.role}</span><h3>{color.name}</h3><p>{color.cmyk}<br />{color.pantone}</p></button>)}</div>
        </Page>

        <Page id="bb-typography" eyebrow="Sistema Visual · Tipografia" title="AS FONTES" theme="light">
          <p className="bb-lead-dark">Três famílias principais. Papéis distintos. Nunca intercambiáveis.</p>
          <div className="bb-type-grid">{TYPOGRAPHY.map(font => <article key={font.name}><span>{font.label}</span><h3 className={`font-${font.name.toLowerCase().split(" ")[0]}`}>{font.specimen}</h3><strong>{font.name}</strong><p>{font.use}</p></article>)}</div>
        </Page>

        <Page id="bb-icons-components" eyebrow="Sistema Visual · Componentes" title="ÍCONES & BLOCOS">
          <div className="bb-two-col">
            <div><h3 className="bb-section-mini">Ícones da marca</h3><div className="bb-icon-grid">{ICONS.map(icon => <button key={icon} onClick={() => copyText(icon)}><span>ø</span>{icon}</button>)}</div></div>
            <div><h3 className="bb-section-mini">Componentes</h3><div className="bb-component-stack">{COMPONENTS.map(component => <article key={component.title}><h4>{component.title}</h4><div>{component.items.map(item => <span key={item}>{item}</span>)}</div><p>{component.rule}</p></article>)}</div></div>
          </div>
        </Page>

        <Page id="bb-specs-video" eyebrow="Produção · Specs Técnicas" title="SPECS DE PRODUÇÃO">
          <h3 className="bb-section-mini">Vídeo - entrega master</h3>
          <SpecTable columns={["Parâmetro", "Valor padrão", "Alternativo", "Nunca"]} rows={VIDEO_SPECS} />
        </Page>

        <Page id="bb-specs-social" eyebrow="Produção · Entregas" title="REDES & COR">
          <div className="bb-table-stack">
            <div><h3 className="bb-section-mini">Redes sociais - entrega final</h3><SpecTable columns={["Canal", "Formato", "Resolução", "Duração", "Codec"]} rows={SOCIAL_SPECS} /></div>
            <div><h3 className="bb-section-mini">Color grading - parâmetros da marca</h3><SpecTable columns={["Parâmetro", "Valor", "Observação"]} rows={COLOR_GRADING} /></div>
          </div>
        </Page>

        <Page id="bb-naming" eyebrow="Produção · Nomenclatura" title="NOMEAR ARQUIVOS">
          <p className="bb-lead">Nomenclatura consistente é controle de produção. Sem espaços, sem acentos, sem surpresas.</p>
          <div className="bb-file-name">CLIENTE_AAAAMMDD_TIPO_v00.ext</div>
          <div className="bb-example-list"><span>Cliente_20260115_REEL_v01.mp4</span><span>Projeto_20260320_MASTER_v03.mov</span><span>{brandSlug.toUpperCase()}_20260401_THUMB_16x9_v01.png</span></div>
        </Page>

        <Page id="bb-checklist" eyebrow="Produção · Checklist" title="ANTES DE ENTREGAR.">
          <div className="bb-check-header"><span>{checked.size} / {CHECKLIST.length} itens</span><button onClick={() => setChecked(new Set())}>Resetar</button></div>
          <div className="bb-checklist-grid">{CHECKLIST.map(item => <button key={item} className={checked.has(item) ? "done" : ""} onClick={() => toggleChecklist(item)}><span>{checked.has(item) ? "✓" : ""}</span>{item}</button>)}</div>
        </Page>

        <Page id="bb-voice" eyebrow="Comunicação · Tom de Voz" title={`COMO A ${brandName.toUpperCase()} FALA.`} theme="light">
          <div className="bb-two-col">
            <div className="bb-voice-box yes"><h3>Assim</h3>{VOICE_YES.map(item => <p key={item}>"{item}"</p>)}</div>
            <div className="bb-voice-box no"><h3>Nunca assim</h3>{VOICE_NO.map(item => <p key={item}>"{item}"</p>)}</div>
          </div>
        </Page>

        <Page id="bb-faq" eyebrow="Comunicação · FAQ" title="DÚVIDAS FREQUENTES." theme="light">
          <div className="bb-faq-list">{FAQ.map(([q, a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div>
        </Page>

        <Page id="bb-redes" eyebrow="Aplicação · Redes Sociais" title={`A ${brandName.toUpperCase()} NAS REDES.`}>
          <p className="bb-lead">O feed como extensão do olhar - não como vitrine.</p>
          <div className="bb-social-grid">{SOCIAL_TYPES.map((item, index) => <article key={item.title}><span>Tipo {String(index + 1).padStart(2, "0")}</span><h3>{item.phrase}</h3><p>{item.text}</p><small>Frequência: {item.freq}</small></article>)}</div>
        </Page>

        <Page id="bb-publico" eyebrow="Encerramento · Para Quem" title={`A ${brandName.toUpperCase()} FOI CRIADA PARA QUEM -`}>
          <div className="bb-two-col bb-ending">
            <div><h3>Foi criada para -</h3><p>{form.audience}</p></div>
            <div><h3>Quem se identifica -</h3><ul><li>Quem acredita que processo importa.</li><li>Quem valoriza autenticidade acima de perfeição.</li><li>Quem prefere uma história verdadeira a um vídeo bonito.</li><li>Quem entende que jornada é matéria-prima.</li></ul></div>
          </div>
          <div className="bb-final-word">MOTION NEVER STOPS.</div>
        </Page>
      </div>

      {savedDocs.length > 0 && (
        <section className="brandbook-saved">
          <div className="bb-eyebrow">VERSÕES SALVAS</div>
          <div className="brandbook-saved-grid">
            {savedDocs.slice(0, 4).map(doc => (
              <button key={doc.id} onClick={() => doc.payload && setForm({ ...defaultBrandBook, ...doc.payload })}>
                <strong>{doc.title || "Brand Book salvo"}</strong>
                <span>{new Date(doc.createdAt).toLocaleString("pt-BR")}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {editing && (
        <div className="bb-modal-backdrop" role="dialog" aria-modal="true">
          <div className="bb-modal">
            <div className="bb-modal-head"><div><span>Editar Brand Book</span><strong>Conteúdo mestre da marca</strong></div><button onClick={() => setEditing(false)}>×</button></div>
            <div className="bb-modal-grid">
              <label>Versão<input value={form.version} onChange={event => setField("version", event.target.value)} /></label>
              <label>Título de capa<input value={form.headline} onChange={event => setField("headline", event.target.value)} /></label>
              <label className="wide">Manifesto<textarea value={form.manifesto} onChange={event => setField("manifesto", event.target.value)} rows={5} /></label>
              <label>Princípio fundador<textarea value={form.principle} onChange={event => setField("principle", event.target.value)} rows={3} /></label>
              <label>Ambição<textarea value={form.ambition} onChange={event => setField("ambition", event.target.value)} rows={3} /></label>
              <label className="wide">Posicionamento<textarea value={form.positioning} onChange={event => setField("positioning", event.target.value)} rows={4} /></label>
              <label className="wide">Público e legado<textarea value={form.audience} onChange={event => setField("audience", event.target.value)} rows={4} /></label>
            </div>
            <div className="bb-modal-actions"><button onClick={() => setEditing(false)}>Concluir edição</button><button onClick={saveSnapshot}>Salvar versão</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

const BRANDBOOK_TAB_CSS = `
.brandbook-shell{display:grid;gap:18px;--bb-orange:#FF2400;--bb-dark:#050505;--bb-black:#0B0B0B;--bb-cream:#F5F5F3;--bb-muted:#8e8e8e;--bb-border:rgba(255,255,255,.12)}
.brandbook-control-hero,.brandbook-asset-panel,.brandbook-preview-tools,.brandbook-saved{border:1px solid rgba(255,106,0,.28);background:linear-gradient(135deg,rgba(255,106,0,.12),rgba(255,255,255,.035) 48%,rgba(5,5,5,.82));border-radius:22px;padding:24px;box-shadow:0 28px 90px rgba(0,0,0,.28)}
.brandbook-control-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:end}.brandbook-control-hero h1,.brandbook-asset-panel h2,.brandbook-preview-tools h2{font-family:"Bebas Neue","Syne",Impact,sans-serif;font-size:clamp(38px,5vw,72px);line-height:.9;margin:10px 0 8px;letter-spacing:0;color:#fff}.brandbook-control-hero p,.brandbook-asset-panel p{color:var(--bb-muted);max-width:760px;line-height:1.55;margin:0}.bb-eyebrow{color:var(--bb-orange);font:900 11px/1 "JetBrains Mono",monospace;letter-spacing:.22em;text-transform:uppercase}.brandbook-chip-row,.brandbook-actions{display:flex;gap:9px;flex-wrap:wrap}.brandbook-actions{justify-content:flex-end}.bb-btn{border:1px solid var(--bb-border);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.04);color:#f5f5f3;font:900 11px/1 "JetBrains Mono",monospace;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}.bb-btn-main{background:var(--bb-orange);border-color:var(--bb-orange);color:#050505;box-shadow:0 14px 40px rgba(255,106,0,.25)}.bb-btn:disabled{opacity:.6;cursor:wait}
.brandbook-asset-panel{display:grid;grid-template-columns:minmax(240px,.48fr) minmax(0,1fr);gap:20px}.brandbook-logo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}.brandbook-logo-card{border:1px solid var(--bb-border);background:rgba(255,255,255,.035);border-radius:16px;padding:11px;text-align:left;color:#fff;font-family:inherit;cursor:pointer}.brandbook-logo-card img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;background:#050505;border:1px solid rgba(255,255,255,.09)}.brandbook-logo-card strong{display:block;font-size:12px;margin-top:10px}.brandbook-logo-card span{display:block;color:var(--bb-orange);font:900 9px/1.2 "JetBrains Mono",monospace;letter-spacing:.08em;margin-top:5px}.brandbook-logo-card small{display:block;color:var(--bb-muted);font-size:10px;line-height:1.35;margin-top:6px}.brandbook-preview-tools{display:grid;grid-template-columns:minmax(260px,.55fr) minmax(0,1fr);gap:18px;align-items:center}.brandbook-tool-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.brandbook-tool-grid button,.brandbook-saved-grid button{border:1px solid var(--bb-border);background:rgba(255,255,255,.04);border-radius:14px;padding:14px;text-align:left;color:#fff;font-family:inherit;cursor:pointer}.brandbook-tool-grid strong,.brandbook-saved-grid strong{display:block;color:#fff;font-size:13px}.brandbook-tool-grid span,.brandbook-saved-grid span{display:block;color:var(--bb-muted);font-size:11px;line-height:1.4;margin-top:6px}
.brandbook-export-wrap{display:grid;gap:18px}.brandbook-export-page{width:100%;aspect-ratio:297/210;min-height:520px;background:#050505;color:#f5f5f3;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.09);box-shadow:0 22px 80px rgba(0,0,0,.3)}.brandbook-page-inner{position:absolute;inset:0;padding:4.9% 5.6%;display:flex;flex-direction:column}.brandbook-light{background:#f5f5f3;color:#0b0b0b}.brandbook-light .bb-eyebrow{color:#ff2400}.bb-page-title{font-family:"Bebas Neue","Syne",Impact,sans-serif;font-size:clamp(58px,7.4vw,120px);line-height:.82;letter-spacing:0;margin:10px 0 30px;color:inherit;max-width:760px}.bb-lead,.bb-lead-dark{font-size:18px;line-height:1.55;color:#909090;max-width:760px;margin:0 0 28px}.bb-lead-dark{color:#555}.bb-two-col{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:start}.bb-three-grid,.bb-quad-grid,.bb-essence-grid,.bb-assets-grid,.bb-color-grid,.bb-type-grid,.bb-social-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.bb-quad-grid{grid-template-columns:repeat(4,1fr)}.bb-editorial-text{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:23px;line-height:1.56;color:#cfcfcf;max-width:690px}.bb-editorial-text strong{font-family:"Bebas Neue",Impact,sans-serif;font-style:normal;letter-spacing:.08em;color:#fff;font-size:28px}.bb-side-notes{border-left:1px solid rgba(255,255,255,.11);padding-left:36px;color:#888}.bb-side-notes h3,.bb-section-mini{color:var(--bb-orange);font:900 12px/1 "JetBrains Mono",monospace;letter-spacing:.18em;text-transform:uppercase;margin:0 0 10px}.bb-side-notes p{line-height:1.55;margin:0 0 24px}.brandbook-cover-page{background:#000}.brandbook-cover-page:before{content:"";position:absolute;inset:9% 5%;background:radial-gradient(circle at 78% 48%,rgba(255,106,0,.22),transparent 20%),linear-gradient(110deg,rgba(255,106,0,.08),transparent 36%),#070707}.brandbook-cover-mark{position:relative;z-index:1;margin-top:auto;margin-bottom:10%;display:grid;gap:28px;width:240px}.brandbook-cover-mark img{width:150px}.brandbook-cover-mark span{font:900 11px/1 "JetBrains Mono",monospace;letter-spacing:.55em;text-transform:uppercase;color:#ddd}.brandbook-cover-line{position:absolute;left:10%;right:7%;bottom:18%;height:3px;background:linear-gradient(90deg,transparent,var(--bb-orange),transparent);transform:rotate(-9deg);transform-origin:left center}.bb-list-box,.bb-three-grid article,.bb-quad-grid article,.bb-essence-grid article,.bb-assets-grid article,.bb-type-grid article,.bb-social-grid article,.bb-component-stack article,.bb-faq-list article{border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.04);padding:22px}.bb-list-box h3{color:var(--bb-orange);text-transform:uppercase;letter-spacing:.2em;font:900 12px/1 "JetBrains Mono",monospace}.bb-list-box strong{display:block;font-family:"Bebas Neue",Impact,sans-serif;font-size:34px;line-height:1;color:#fff;margin:9px 0}.bb-list-box.negative strong{color:#777}.bb-three-grid article span,.bb-essence-grid article span,.bb-type-grid article span,.bb-social-grid article span{color:var(--bb-orange);font:900 10px/1 "JetBrains Mono",monospace;letter-spacing:.16em;text-transform:uppercase}.bb-three-grid article h3,.bb-essence-grid article h3,.bb-social-grid article h3{font-size:28px;line-height:1.05;margin:12px 0;color:#fff}.brandbook-light .bb-three-grid article h3,.brandbook-light .bb-essence-grid article h3,.brandbook-light .bb-social-grid article h3{color:#0b0b0b}.bb-three-grid article p,.bb-essence-grid article p,.bb-social-grid article p,.bb-quad-grid article p{color:#aaa;line-height:1.5;margin:0}.brandbook-light .bb-quad-grid article p,.brandbook-light .bb-essence-grid article p{color:#555}.bb-quad-grid article span{display:inline-grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#ff2400;color:#050505;font-weight:900}.bb-quad-grid article h3{font-size:22px;line-height:1.1;color:#0b0b0b}.bb-essence-grid article small{display:block;color:#ff2400;font:900 10px/1.4 "JetBrains Mono",monospace;letter-spacing:.12em;margin-top:18px}.bb-personality-list{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:auto}.bb-personality-list article{border-top:2px solid var(--bb-orange);padding-top:18px}.bb-personality-list span{color:#ff2400;font:900 12px/1 "JetBrains Mono",monospace}.bb-personality-list h3{font-family:"Bebas Neue",Impact,sans-serif;font-size:38px;margin:12px 0 8px}.bb-personality-list p{color:#999;line-height:1.45}.bb-assets-grid article img{width:100%;aspect-ratio:1/1;object-fit:cover;background:#111;border:1px solid rgba(255,255,255,.1)}.bb-assets-grid h3,.bb-logo-system h3{font-size:14px;color:#fff;margin:12px 0 4px}.bb-assets-grid p,.bb-logo-system p{font-size:11px;color:#888;line-height:1.4}.bb-assets-grid span{display:inline-block;border:1px solid rgba(16,185,129,.35);color:#10b981;border-radius:3px;padding:3px 7px;font:900 9px/1 "JetBrains Mono",monospace}.bb-logo-system{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:auto}.bb-logo-system article{background:#161616;border:1px solid rgba(255,255,255,.1);padding:12px}.bb-logo-system img{width:100%;aspect-ratio:1/1;object-fit:cover;background:#050505}.bb-color-grid{grid-template-columns:repeat(5,1fr);gap:0;margin-top:20px}.bb-color-grid button{min-height:390px;border:0;border-right:1px solid rgba(255,255,255,.12);background:#121212;color:#fff;text-align:left;padding:24px;font-family:inherit;cursor:pointer}.bb-color-grid i{display:block;height:132px;background:#333;margin:-24px -24px 24px}.bb-color-grid strong{font:900 14px/1 "JetBrains Mono",monospace}.bb-color-grid span{display:block;color:var(--bb-orange);font:900 10px/1 "JetBrains Mono",monospace;letter-spacing:.14em;margin-top:12px;text-transform:uppercase}.bb-color-grid h3{font-size:20px;margin:12px 0 8px}.bb-color-grid p{color:#888;font-size:12px;line-height:1.6}.bb-type-grid article{background:rgba(0,0,0,.035);border-color:rgba(0,0,0,.12)}.bb-type-grid h3{font-size:42px;line-height:1;margin:18px 0;color:#0b0b0b}.bb-type-grid strong{display:block;color:#ff2400;font:900 12px/1 "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase}.bb-type-grid p{color:#555;line-height:1.5}.font-bebas{font-family:"Bebas Neue",Impact,sans-serif}.font-archivo{font-family:Archivo,Arial,sans-serif}.font-instrument{font-family:"Instrument Serif",Georgia,serif;font-style:italic}.font-jetbrains{font-family:"JetBrains Mono",monospace;font-size:26px!important}.bb-icon-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.bb-icon-grid button{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#eee;border-radius:14px;min-height:86px;display:grid;place-items:center;gap:7px;font-weight:800}.bb-icon-grid span{font-size:28px;color:#fff}.bb-component-stack{display:grid;gap:10px}.bb-component-stack h4{margin:0 0 10px;color:#fff}.bb-component-stack span{display:inline-block;border:1px solid rgba(255,106,0,.45);color:#ff2400;border-radius:999px;padding:5px 9px;margin:0 6px 6px 0;font:900 10px/1 "JetBrains Mono",monospace}.bb-component-stack p{color:#888;font-size:11px}.bb-spec-table{width:100%;border-collapse:collapse;font:700 12px/1.3 "JetBrains Mono",monospace;color:#aaa}.bb-spec-table th{text-align:left;color:#ff2400;font-size:10px;text-transform:uppercase;letter-spacing:.12em;padding:11px;border-bottom:1px solid rgba(255,255,255,.12)}.bb-spec-table td{padding:10px 11px;border-bottom:1px solid rgba(255,255,255,.07)}.bb-spec-table td:not(:first-child){color:#ff5a33}.bb-table-stack{display:grid;gap:28px}.bb-file-name{border:1px solid rgba(255,106,0,.38);background:rgba(255,106,0,.08);padding:30px;font:900 34px/1 "JetBrains Mono",monospace;color:#ff2400;letter-spacing:.08em;margin:18px 0}.bb-example-list{display:grid;gap:10px;color:#aaa;font:700 14px/1.4 "JetBrains Mono",monospace}.bb-check-header{display:flex;align-items:center;justify-content:space-between;margin:-8px 0 16px}.bb-check-header span{color:#ff2400;font:900 18px/1 "JetBrains Mono",monospace}.bb-check-header button{border:1px solid rgba(255,255,255,.14);background:transparent;color:#eee;border-radius:999px;padding:8px 12px}.bb-checklist-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.bb-checklist-grid button{text-align:left;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);color:#aaa;padding:11px 12px;border-radius:10px;font-family:inherit;font-size:12px}.bb-checklist-grid button.done{border-color:rgba(16,185,129,.45);color:#e8fff4;background:rgba(16,185,129,.09)}.bb-checklist-grid span{display:inline-grid;place-items:center;width:18px;height:18px;margin-right:8px;border-radius:50%;border:1px solid currentColor;color:#10b981}.bb-voice-box{border:1px solid rgba(0,0,0,.12);background:rgba(0,0,0,.035);padding:24px}.bb-voice-box h3{text-transform:uppercase;color:#ff2400;letter-spacing:.16em;font:900 12px/1 "JetBrains Mono",monospace}.bb-voice-box p{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:20px;line-height:1.45;color:#333}.bb-voice-box.no p{color:#777;text-decoration:line-through;text-decoration-color:rgba(255,106,0,.45)}.bb-faq-list{display:grid;grid-template-columns:1fr 1fr;gap:12px}.bb-faq-list article{background:rgba(0,0,0,.035);border-color:rgba(0,0,0,.12)}.bb-faq-list h3{font-size:18px;margin:0 0 9px;color:#0b0b0b}.bb-faq-list p{color:#555;line-height:1.45;margin:0}.bb-social-grid article small{display:inline-block;margin-top:14px;color:#ff2400;text-transform:uppercase;font:900 10px/1 "JetBrains Mono",monospace;letter-spacing:.12em}.bb-ending h3{font-family:"Bebas Neue",Impact,sans-serif;font-size:42px;margin:0 0 12px;color:#fff}.bb-ending p,.bb-ending li{color:#aaa;font-size:17px;line-height:1.55}.bb-final-word{margin-top:auto;color:#ff2400;font-family:"Bebas Neue",Impact,sans-serif;font-size:72px;line-height:1}.brandbook-saved-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px}.bb-modal-backdrop{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);display:grid;place-items:center;padding:18px}.bb-modal{width:min(980px,100%);max-height:min(820px,92vh);overflow:auto;border:1px solid rgba(255,106,0,.32);border-radius:22px;background:#111;color:#fff;box-shadow:0 40px 120px rgba(0,0,0,.55)}.bb-modal-head{display:flex;justify-content:space-between;align-items:center;padding:20px 22px;border-bottom:1px solid rgba(255,255,255,.1)}.bb-modal-head span{display:block;color:#ff2400;font:900 11px/1 "JetBrains Mono",monospace;letter-spacing:.18em;text-transform:uppercase}.bb-modal-head strong{display:block;font-size:22px;margin-top:7px}.bb-modal-head button{border:0;background:transparent;color:#aaa;font-size:34px;cursor:pointer}.bb-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:22px}.bb-modal-grid label{display:grid;gap:7px;color:#999;font:900 10px/1 "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase}.bb-modal-grid label.wide{grid-column:1/-1}.bb-modal-grid input,.bb-modal-grid textarea{width:100%;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.065);border-radius:12px;color:#fff;padding:12px 13px;font:500 14px/1.45 Archivo,Arial,sans-serif;text-transform:none;letter-spacing:0}.bb-modal-actions{display:flex;gap:10px;justify-content:flex-end;padding:0 22px 22px}.bb-modal-actions button{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;border-radius:12px;padding:12px 14px;font-weight:900}.bb-modal-actions button:last-child{background:#ff2400;border-color:#ff2400;color:#050505}@media(max-width:980px){.brandbook-control-hero,.brandbook-asset-panel,.brandbook-preview-tools{grid-template-columns:1fr}.brandbook-tool-grid{grid-template-columns:1fr 1fr}.brandbook-export-page{min-height:auto}.bb-two-col,.bb-three-grid,.bb-quad-grid,.bb-essence-grid,.bb-assets-grid,.bb-type-grid,.bb-social-grid,.bb-faq-list{grid-template-columns:1fr}.bb-personality-list,.bb-logo-system,.bb-color-grid{grid-template-columns:1fr 1fr}.bb-page-title{font-size:58px}.brandbook-page-inner{position:relative;padding:28px}.brandbook-export-page{aspect-ratio:auto}.bb-modal-grid{grid-template-columns:1fr}}@media(max-width:620px){.brandbook-tool-grid,.brandbook-logo-grid,.bb-personality-list,.bb-logo-system,.bb-color-grid{grid-template-columns:1fr}.brandbook-actions{justify-content:stretch}.bb-btn{width:100%}.bb-page-title{font-size:46px}.bb-checklist-grid{grid-template-columns:1fr}.brandbook-control-hero,.brandbook-asset-panel,.brandbook-preview-tools{border-radius:16px;padding:18px}.brandbook-export-page{min-height:auto}.bb-file-name{font-size:18px;word-break:break-word}.bb-final-word{font-size:48px}}
`;
