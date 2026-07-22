import React from "react";
import logoMain from "../../assets/brand/dnz-logo-main.png";
import logoDark from "../../assets/brand/dnz-logo-dark.png";
import logoOrangeLight from "../../assets/brand/dnz-logo-orange-light.png";
import logoDoesNotZeroLight from "../../assets/brand/does-not-zero-light.png";
import logoLight from "../../assets/brand/dnz-logo-light.png";

const BRAND_COLORS = [
  { name: "Preto principal", hex: "#0B0B0B", role: "Primária", pantone: "PMS Black 6 C", usage: "Base da marca, fundos e capas." },
  { name: "Branco principal", hex: "#F5F5F3", role: "Primária", pantone: "PMS Cool Gray 1 C", usage: "Documentos, respiro e leitura." },
  { name: "Acento (vermelho)", hex: "#FF2400", role: "Acento", pantone: "PMS 172 C", usage: "CTA, corte, marcação e assinatura." },
  { name: "Areia", hex: "#C8B08A", role: "Editorial", pantone: "PMS 7502 C", usage: "Textura, legenda e peças editoriais." },
  { name: "Verde profundo", hex: "#1E3A34", role: "Apoio", pantone: "PMS 5605 C", usage: "Aprovação, status positivo e fechados." },
];

const LOGOS = [
  { title: "Logo principal — fundo escuro", file: "dnz-logo-main.png", src: logoMain, format: "PNG" },
  { title: "Logo textura — fundo escuro", file: "dnz-logo-dark.png", src: logoDark, format: "PNG" },
  { title: "Logo acento", file: "dnz-logo-orange-light.png", src: logoOrangeLight, format: "PNG" },
  { title: "Assinatura vertical", file: "does-not-zero-light.png", src: logoDoesNotZeroLight, format: "PNG" },
  { title: "Logo claro", file: "dnz-logo-light.png", src: logoLight, format: "PNG" },
];

const TYPOGRAPHY = [
  { label: "DISPLAY", name: "Bebas Neue", family: "'Bebas Neue', sans-serif", specimen: "DOES NOT ZERO", use: "Títulos, capas e impacto. Sempre em caixa alta." },
  { label: "CORPO", name: "DM Sans", family: "'DM Sans', sans-serif", specimen: "O processo importa tanto quanto o resultado.", use: "Interface, textos e formulários." },
  { label: "LABEL / TÉCNICO", name: "Space Mono", family: "'Space Mono', monospace", specimen: "CLIENTE_20260619_MASTER_v01", use: "Labels, tokens, specs e nomes de arquivo." },
  { label: "EDITORIAL", name: "Instrument Serif", family: "'Instrument Serif', serif", specimen: "A jornada antes da conquista.", use: "Manifesto e citações. Uso pontual." },
];

const PHILOSOPHY = [
  ["01", "Toda experiência gera aprendizado.", "O que se vive não desaparece. O que se sente vira matéria-prima."],
  ["02", "Toda jornada gera evolução.", "Ninguém atravessa um caminho e permanece o mesmo."],
  ["03", "Toda construção possui valor.", "O que se constrói com tempo carrega densidade."],
  ["04", "Toda história deixa marcas.", "O que foi vivido permanece. A marca preserva essas marcas."],
];

const VOICE_YES = [
  "Três anos de preparo. Dois dias de prova. A câmera esteve nos três anos.",
  "O setup levou 40 minutos. A cena durou 8 segundos. Os 8 segundos valem os 40.",
  "Ele entrou no mar às 5h30. Ninguém estava olhando. Mas alguém estava filmando.",
];

const VOICE_NO = [
  "Produzimos conteúdo audiovisual premium de alta qualidade para atletas e marcas!",
  "Clique no link da bio e agende sua sessão!",
  "A melhor produtora de vídeo da cidade — resultados incríveis garantidos!",
];

const SOCIAL_SPECS = [
  ["Instagram Reel", "9:16", "1080×1920", "≤ 90s"],
  ["Instagram Feed", "4:5", "1080×1350", "≤ 60s"],
  ["Story", "9:16", "1080×1920", "≤ 15s"],
  ["YouTube", "16:9", "3840×2160", "livre"],
  ["YouTube Shorts", "9:16", "1080×1920", "≤ 60s"],
];

const COLOR_GRADING = [
  ["Temperatura", "Quente ~5200K", "Nunca fria sem intenção."],
  ["Contraste", "Alto nas sombras", "Sombras profundas com detalhe."],
  ["Saturação", "-10 a -20%", "Dessaturado, nunca sem vida."],
  ["Grain", "Leve a moderado", "Textura e identidade."],
  ["Highlights", "Contidos", "Nunca estourar."],
];

const POSITIONING = "Produtora audiovisual autoral para marcas, atletas, lutadores, shapers e projetos culturais que precisam transformar processo real em filme com direção.";

export default function TabBrandBook({ state, shared }) {
  const { C, Card, Tag, Btn, SectionTitle } = shared;
  const business = state?.business || {};
  const brandName = business.companyName || business.brandName || "DNZ Films";
  const logos = business.logoUrl
    ? [{ title: `Logo ${brandName} (workspace)`, file: "logo-custom", src: business.logoUrl, format: "CUSTOM" }, ...LOGOS]
    : LOGOS;

  const [copied, setCopied] = React.useState("");
  const copyHex = hex => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(""), 1200);
  };
  const downloadLogo = logo => {
    const a = document.createElement("a");
    a.href = logo.src;
    a.download = logo.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const downloadTokens = () => {
    const css = ":root{\n" + BRAND_COLORS.map(c => `  --dnz-${c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}: ${c.hex};`).join("\n") + "\n}";
    const url = URL.createObjectURL(new Blob([css], { type: "text/css" }));
    const a = document.createElement("a");
    a.href = url; a.download = "dnz-tokens.css";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const cellBox = { border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", background: "rgba(255,255,255,.03)" };

  return (
    <div className="page-stack">
      <Card className="page-hero">
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{ color: C.orange }}>IDENTIDADE</div>
            <div className="page-title">Brand Book — {brandName}</div>
            <p className="page-subtitle">Cores, logos, tipografia e voz da marca. Referência rápida pra manter tudo consistente.</p>
          </div>
          <Btn onClick={downloadTokens} size="sm" variant="ghost">Baixar tokens CSS</Btn>
        </div>
      </Card>

      {/* CORES */}
      <Card>
        <SectionTitle>Cores da marca</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
          {BRAND_COLORS.map(c => (
            <button key={c.hex} onClick={() => copyHex(c.hex)} title="Copiar HEX" style={{ textAlign: "left", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.03)", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
              <div style={{ height: 68, background: c.hex, borderBottom: `1px solid ${C.border}` }} />
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: C.orange, fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: 3 }}>{copied === c.hex ? "COPIADO ✓" : c.hex}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 5, lineHeight: 1.4 }}>{c.role} · {c.pantone}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>Clique numa cor pra copiar o HEX.</div>
      </Card>

      {/* LOGOS */}
      <Card>
        <SectionTitle>Logos oficiais</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          {logos.map(l => (
            <div key={l.file} style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.03)" }}>
              <div style={{ background: "#0a0a0a", display: "grid", placeItems: "center", aspectRatio: "16/10", padding: 18 }}>
                <img src={l.src} alt={l.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>{l.title}</div>
                <Btn onClick={() => downloadLogo(l)} size="sm" variant="ghost" style={{ width: "100%", justifyContent: "center" }}>Baixar {l.format}</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* TIPOGRAFIA */}
      <Card>
        <SectionTitle>Tipografia</SectionTitle>
        <div style={{ display: "grid", gap: 10 }}>
          {TYPOGRAPHY.map(t => (
            <div key={t.name} style={cellBox}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <Tag color={C.orange}>{t.label}</Tag>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 900, fontFamily: "var(--font-mono)" }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 26, color: "#fff", fontFamily: t.family, lineHeight: 1.1, margin: "8px 0" }}>{t.specimen}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{t.use}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* VOZ */}
      <div className="split-layout">
        <Card>
          <SectionTitle>Voz da marca — assim sim</SectionTitle>
          {VOICE_YES.map((v, i) => (
            <div key={i} style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 16, color: "#ddd", lineHeight: 1.5, padding: "11px 0", borderBottom: i < VOICE_YES.length - 1 ? `1px solid ${C.border}` : "none" }}>"{v}"</div>
          ))}
        </Card>
        <Card>
          <SectionTitle>Assim não</SectionTitle>
          {VOICE_NO.map((v, i) => (
            <div key={i} style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, padding: "11px 0", borderBottom: i < VOICE_NO.length - 1 ? `1px solid ${C.border}` : "none", textDecoration: "line-through", textDecorationColor: "rgba(255,36,0,.5)" }}>{v}</div>
          ))}
        </Card>
      </div>

      {/* POSICIONAMENTO + FILOSOFIA */}
      <Card>
        <SectionTitle>Posicionamento & filosofia</SectionTitle>
        <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, marginBottom: 16 }}>{POSITIONING}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {PHILOSOPHY.map(([n, t, d]) => (
            <div key={n} style={cellBox}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: C.orange, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", margin: "6px 0 6px" }}>{t}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* SPECS DE PRODUÇÃO */}
      <div className="split-layout">
        <Card>
          <SectionTitle>Formatos de rede</SectionTitle>
          <div style={{ display: "grid", gap: 6 }}>
            {SOCIAL_SPECS.map(([plat, ratio, res, dur]) => (
              <div key={plat} style={{ display: "grid", gridTemplateColumns: "1.4fr .7fr 1.1fr .8fr", gap: 8, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: "#eee", fontWeight: 800 }}>{plat}</span>
                <span style={{ color: C.orange, fontWeight: 900, fontFamily: "var(--font-mono)" }}>{ratio}</span>
                <span style={{ color: C.muted, fontFamily: "var(--font-mono)" }}>{res}</span>
                <span style={{ color: C.muted, textAlign: "right" }}>{dur}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle>Color grading DNZ</SectionTitle>
          <div style={{ display: "grid", gap: 6 }}>
            {COLOR_GRADING.map(([k, v, note]) => (
              <div key={k} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#eee", fontWeight: 800 }}>{k}</span>
                  <span style={{ fontSize: 12, color: C.orange, fontWeight: 900, fontFamily: "var(--font-mono)" }}>{v}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{note}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
