// ── SHARED UI COMPONENTS ────────────────────────────────────────────────
// Micro components extracted from App.jsx for reuse across all tabs.

import React, { useState, useEffect, useRef } from "react";
import { C, APP_NAME } from "../../theme.config.js";

// ── Bar ──
export const Bar = ({ v, color = C.orange, h = 6 }) => (
  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: h, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, v))}%`, background: color, borderRadius: 99, transition: "width .7s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 10px ${color}50` }} />
  </div>
);

// ── Tag ──
export const Tag = ({ children, color = C.orange }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 99, border: `1px solid ${color}40`, background: `${color}15`, color, whiteSpace: "nowrap" }}>{children}</span>
);

// ── EyeToggle ──
export const EyeToggle = ({ hidden, onClick, label }) => (
  <button type="button" onClick={onClick} title={hidden ? "Mostrar valores" : "Ocultar valores"} aria-label={hidden ? "Mostrar valores" : "Ocultar valores"} style={{ height: 34, borderRadius: 12, border: `1px solid ${hidden ? C.border : C.orange}`, background: hidden ? "rgba(255,255,255,.045)" : "rgba(249,115,22,.14)", color: hidden ? C.muted : C.orange, fontFamily: "inherit", fontSize: 11, fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, padding: "0 11px", whiteSpace: "nowrap" }}>
    <span style={{ width: 16, height: 10, border: "1.8px solid currentColor", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor", display: "block" }} />
      {hidden && <span style={{ position: "absolute", width: 20, height: 2, background: "currentColor", transform: "rotate(-35deg)", borderRadius: 99 }} />}
    </span>
    {label || (hidden ? "Ver valores" : "Ocultar")}
  </button>
);

// ── Card ──
export const Card = ({ children, style = {}, onClick, className = "" }) => (
  <div onClick={onClick} className={`card-hover ${className}`} style={{ background: style.background || "var(--glass-bg)", border: style.border || `1px solid var(--glass-border)`, borderRadius: style.borderRadius || 26, padding: style.padding || "26px 28px", cursor: onClick ? "pointer" : "default", boxShadow: style.boxShadow || "var(--glass-shadow)", backdropFilter: style.backdropFilter || "var(--glass-blur)", WebkitBackdropFilter: style.WebkitBackdropFilter || "var(--glass-blur)", ...style }}>{children}</div>
);

// ── LazyTabFallback ──
export const LazyTabFallback = ({ label = "Carregando..." }) => (
  <div className="page-stack">
    <Card className="page-hero">
      <div className="page-eyebrow" style={{ color: C.orange }}>CARREGANDO</div>
      <div className="page-title">{label}</div>
      <p className="page-subtitle">Preparando esta área sob demanda.</p>
    </Card>
  </div>
);

// ── Inp ──
export const Inp = ({ label, value, onChange, placeholder, type = "text" }) => {
  const id = useRef(`inp-${Math.random().toString(36).slice(2)}`);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label htmlFor={id.current} style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 7, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</label>}
      <input id={id.current} aria-label={label || placeholder || "Campo"} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.065)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color .2s,background .2s", backdropFilter: "blur(12px)" }}
        onFocus={(e) => (e.target.style.borderColor = C.orange)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
    </div>
  );
};

// ── Txt ──
export const Txt = ({ label, value, onChange, placeholder, rows = 3 }) => {
  const id = useRef(`txt-${Math.random().toString(36).slice(2)}`);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label htmlFor={id.current} style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 7, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</label>}
      <textarea id={id.current} aria-label={label || placeholder || "Texto"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", background: "rgba(255,255,255,0.065)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color .2s,background .2s", backdropFilter: "blur(12px)", lineHeight: 1.5 }}
        onFocus={(e) => (e.target.style.borderColor = C.orange)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
    </div>
  );
};

// ── Btn ──
export const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false, className = "" }) => {
  const vs = {
    primary: { background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: "#fff", boxShadow: "0 4px 16px rgba(249,115,22,.3)", border: "none" },
    ghost: { background: "rgba(255,255,255,.06)", color: "#ccc", border: `1px solid ${C.border}` },
    danger: { background: "rgba(239,68,68,.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,.25)" },
    success: { background: "rgba(16,185,129,.15)", color: "#10b981", border: "1px solid rgba(16,185,129,.3)" },
    focus: { background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff", boxShadow: "0 4px 16px rgba(139,92,246,.4)", border: "none" },
    proposal: { background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", boxShadow: "0 4px 16px rgba(59,130,246,.35)", border: "none" },
  };
  return <button type="button" onClick={onClick} disabled={disabled} className={`btn-hover ${className}`} style={{ borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7, padding: size === "sm" ? "6px 12px" : "10px 20px", fontSize: size === "sm" ? 11 : 14, opacity: disabled ? 0.5 : 1, ...vs[variant], ...style }}>{children}</button>;
};

// ── Modal ──
export const Modal = ({ open, onClose, title, children, wide }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-shell" role="presentation">
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`scale-in modal-panel ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title || "Janela"}>
        <div className="modal-head">
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar janela" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1, transition: "color .15s" }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = C.muted)}>✕</button>
        </div>
        <div className="modal-scroll modal-body">{children}</div>
      </div>
    </div>
  );
};

// ── Divider ──
export const Divider = () => <div style={{ height: 1, background: C.border, margin: "14px 0" }} />;

// ── SectionTitle ──
export const SectionTitle = ({ children, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>{children}</span>
    {action}
  </div>
);

// ── PremiumEmpty ──
export const PremiumEmpty = ({ title, text, action, icon = "+" }) => (
  <Card style={{ textAlign: "center", padding: "30px 22px", background: "linear-gradient(135deg,rgba(255,255,255,.045),rgba(0,0,0,0))" }}>
    <div style={{ width: 42, height: 42, borderRadius: 14, margin: "0 auto 12px", display: "grid", placeItems: "center", background: "rgba(249,115,22,.12)", border: "1px solid rgba(249,115,22,.28)", color: C.orange, fontSize: 18, fontWeight: 900 }}>{icon}</div>
    <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>{title}</div>
    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: "0 auto 14px", maxWidth: 420 }}>{text}</p>
    {action}
  </Card>
);

// ── AccessWall ──
export const AccessWall = ({ onLogin }) => (
  <div className="access-wall">
    <div className="access-wall-card scale-in">
      <div className="elite-kicker">ACESSO PRIVADO</div>
      <h1 style={{ fontSize: "clamp(30px,5vw,52px)", lineHeight: 1, color: "#fff", fontFamily: "'Syne',sans-serif", margin: "10px 0 12px" }}>Workspace interno do {APP_NAME}.</h1>
      <p style={{ fontSize: 15, color: "#cfcfcf", lineHeight: 1.65, maxWidth: 640, margin: "0 0 20px" }}>O {APP_NAME} guarda clientes, propostas, produção, documentos, financeiro e Video Review. A entrada é restrita ao admin autorizado.</p>
      <div className="access-steps">
        {[["1", "Login", "Entre com GitHub."], ["2", "Admin", "O email precisa estar autorizado."], ["3", "Operação", `Abra o workspace ${APP_NAME}.`]].map(([n, t, d]) => (
          <div key={n} style={{ padding: "13px", borderRadius: 16, border: `1px solid ${C.border}`, background: "rgba(255,255,255,.04)" }}>
            <div style={{ fontSize: 10, color: C.orange, fontWeight: 900 }}>0{n}</div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 900, marginTop: 4 }}>{t}</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, marginTop: 3 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onLogin} className="elite-primary">Entrar com GitHub</button>
      </div>
    </div>
  </div>
);

// ── Logo helpers ──
const resizeLogoFile = (file, max = 640, quality = 0.88) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) { reject(new Error("Arquivo inválido")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      if (file.type === "image/svg+xml") { resolve(reader.result); return; }
      const img = new Image();
      img.onerror = () => reject(new Error("Não foi possível abrir essa imagem."));
      img.onload = () => {
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const type = file.type === "image/png" ? "image/png" : "image/webp";
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

// ── LogoMark ──
export const LogoMark = ({ business, size = 58, textColor }) => {
  const [failed, setFailed] = useState(false);
  const src = business?.logoUrl;
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) return <img src={src} alt={`Logo ${business?.brandName || APP_NAME}`} onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  const color = business?.primaryColor || C.orange;
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      <rect x="7" y="7" width="50" height="50" rx="16" fill={textColor ? "rgba(0,0,0,.1)" : "#121212"} stroke={color} strokeWidth="3" />
      <path d="M19 43V21h6l14 17V21h6v22h-6L25 26v17h-6z" fill={textColor || color} />
      <path d="M16 16h13M35 48h13" stroke={textColor || "#fff"} strokeWidth="3" strokeLinecap="round" opacity=".9" />
    </svg>
  );
};

// ── LogoUploader ──
export const LogoUploader = ({ value, onChange, color = C.orange, label = "Logo da marca" }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputId = useRef(`logo-upload-${Math.random().toString(36).slice(2)}`);
  const preview = { brandName: "Logo", primaryColor: color, logoUrl: value };
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setError("");
    try {
      const data = await resizeLogoFile(file);
      onChange(data);
    } catch (err) {
      setError(err?.message || "Não foi possível usar essa imagem.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 7, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12, alignItems: "center", padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: "rgba(255,255,255,.035)" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, border: `1px solid ${color}55`, background: `${color}18`, display: "grid", placeItems: "center", overflow: "hidden" }}>
          <LogoMark business={preview} size={64} />
        </div>
        <div>
          <input id={inputId.current} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={pick} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label htmlFor={inputId.current} className="btn-hover" style={{ borderRadius: 10, cursor: "pointer", fontWeight: 800, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 13px", fontSize: 12, background: "rgba(255,255,255,.06)", color: "#ddd", border: `1px solid ${C.border}` }}>{busy ? "Processando..." : "Enviar imagem"}</label>
            {value && <button type="button" onClick={() => onChange("")} style={{ borderRadius: 10, cursor: "pointer", fontWeight: 800, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 13px", fontSize: 12, background: "rgba(239,68,68,.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,.24)" }}>Remover</button>}
          </div>
          <div style={{ fontSize: 11, color: error ? "#ef4444" : C.muted, lineHeight: 1.4, marginTop: 7 }}>{error || "PNG, JPG, WebP ou SVG. A imagem é otimizada e salva neste navegador."}</div>
        </div>
      </div>
    </div>
  );
};

// ── Chart components ──
export const WeekChart = ({ data, color = C.orange }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 64 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: "100%", borderRadius: 4, background: `${color}30`, height: `${Math.max(4, (d.value / max) * 52)}px`, transition: "height .4s ease" }} />
          <span style={{ fontSize: 8, color: C.muted, fontWeight: 700 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export const RevenueChart = ({ entries, color = "#10b981" }) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString("pt-BR", { month: "short" }), value: 0 };
  });
  entries.forEach((e) => {
    if (e.type !== "entrada" || e.status !== "pago") return;
    const d = new Date(e.date || e.createdAt);
    const m = months.find((x) => x.month === d.getMonth() && x.year === d.getFullYear());
    if (m) m.value += Number(e.value || 0);
  });
  return <WeekChart data={months} color={color} />;
};
