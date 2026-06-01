import React, { useEffect, useMemo, useRef, useState } from "react";
import { drivePreviewUrl, driveViewUrl, extractDriveFileId } from "../services/driveService.js";
import {
  createDeliverable,
  createVideoComment,
  getCommentsByDeliverable,
  getDeliverableByToken,
  updateDeliverableStatus
} from "../services/reviewService.js";

const C = {
  orange: "#f97316",
  orangeD: "#ea580c",
  muted: "#858585",
  border: "rgba(255,255,255,.11)"
};

const fmtTimecode = seconds => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const Card = ({ children, style = {}, className = "" }) => (
  <div
    className={`card-hover ${className}`}
    style={{
      background: style.background || "var(--glass-bg)",
      border: style.border || `1px solid var(--glass-border)`,
      borderRadius: style.borderRadius || 26,
      padding: style.padding || "26px 28px",
      boxShadow: style.boxShadow || "var(--glass-shadow)",
      backdropFilter: style.backdropFilter || "var(--glass-blur)",
      WebkitBackdropFilter: style.WebkitBackdropFilter || "var(--glass-blur)",
      ...style
    }}
  >
    {children}
  </div>
);

const Tag = ({ children, color = C.orange }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 99, border: `1px solid ${color}40`, background: `${color}15`, color, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) => {
  const vs = {
    primary: { background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: "#fff", boxShadow: "0 4px 16px rgba(249,115,22,.3)", border: "none" },
    ghost: { background: "rgba(255,255,255,.06)", color: "#ccc", border: `1px solid ${C.border}` },
    danger: { background: "rgba(239,68,68,.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,.25)" },
    success: { background: "rgba(16,185,129,.15)", color: "#10b981", border: "1px solid rgba(16,185,129,.3)" }
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-hover" style={{ borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7, padding: size === "sm" ? "6px 12px" : "10px 20px", fontSize: size === "sm" ? 11 : 14, opacity: disabled ? .5 : 1, ...vs[variant], ...style }}>
      {children}
    </button>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 11, color: C.muted, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>
    {children}
  </div>
);

const Inp = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 7, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: "rgba(255,255,255,0.065)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
  </div>
);

const Modal = ({ open, onClose, title, children, wide }) => {
  useEffect(() => {
    if (!open) return undefined;
    const h = e => {
      if (e.key === "Escape") onClose?.();
    };
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
          <button type="button" onClick={onClose} aria-label="Fechar janela" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>x</button>
        </div>
        <div className="modal-scroll modal-body">{children}</div>
      </div>
    </div>
  );
};

const PremiumEmpty = ({ icon, title, text, action }) => (
  <Card style={{ textAlign: "center", padding: "34px 24px" }}>
    <div style={{ fontSize: 32, color: C.orange, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 20, color: "#fff", fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{title}</div>
    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, maxWidth: 520, margin: "8px auto 16px" }}>{text}</p>
    {action}
  </Card>
);

export default function TabVideoReview({ state, dispatch, publicToken = "", isPublic = false }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [publicItem, setPublicItem] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(() => !!publicToken);
  const [reviewError, setReviewError] = useState("");
  const [commentForm, setCommentForm] = useState({ name: "", content: "", timestamp: "" });
  const [playerTime, setPlayerTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [form, setForm] = useState({ title: "", videoUrl: "", source: "direct", projectTitle: "", clientName: "" });
  const videoRef = useRef(null);
  const items = state.reviewDeliverables || [];
  const current = publicItem || (selected && items.find(i => i.id === selected));
  const comments = useMemo(() => [...(current?.comments || [])].sort((a, b) => Number(a.timestamp_seconds ?? 999999) - Number(b.timestamp_seconds ?? 999999)), [current?.comments]);
  const hlsReady = current?.video_url && String(current.video_url).toLowerCase().includes(".m3u8");
  const statusMeta = {
    waiting_review: { label: "Aguardando cliente", color: "#eab308" },
    revision_requested: { label: "Revisão solicitada", color: "#f97316" },
    approved_with_changes: { label: "Aprovado com ajustes", color: "#3b82f6" },
    rejected: { label: "Precisa revisar", color: "#ef4444" },
    approved: { label: "Aprovado", color: "#10b981" }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current?.video_url || current.video_source === "drive") return undefined;
    let hls;
    let active = true;
    if (hlsReady) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = current.video_url;
      } else {
        import("hls.js").then(mod => {
          if (!active) return;
          const Hls = mod.default;
          if (!Hls?.isSupported?.()) return;
          hls = new Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(current.video_url);
          hls.attachMedia(video);
        }).catch(() => {});
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl") || video.src !== current.video_url) {
      video.src = current.video_url;
    }
    return () => {
      active = false;
      hls?.destroy();
    };
  }, [current?.video_url, current?.video_source, hlsReady]);

  const seekTo = seconds => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(Number(seconds))) return;
    video.currentTime = Math.max(0, Number(seconds));
    setPlayerTime(video.currentTime);
    video.pause();
  };

  useEffect(() => {
    if (!publicToken) return undefined;
    const local = items.find(i => String(i.review_token) === String(publicToken));
    if (local) {
      setSelected(local.id);
      setPublicItem(null);
      setReviewError("");
      setReviewLoading(false);
      return undefined;
    }
    let active = true;
    setReviewLoading(true);
    setReviewError("");
    (async () => {
      const deliverable = await getDeliverableByToken(publicToken);
      if (!active) return;
      if (!deliverable) {
        setPublicItem(null);
        setReviewError("Esse link de revisão não foi encontrado ou ainda não foi sincronizado com o banco.");
        setReviewLoading(false);
        return;
      }
      const loadedComments = await getCommentsByDeliverable(deliverable.id);
      if (!active) return;
      setPublicItem({ ...deliverable, supabaseId: deliverable.id, comments: loadedComments });
      setReviewLoading(false);
    })().catch(() => {
      if (active) {
        setReviewError("Não foi possível carregar esse review agora.");
        setReviewLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [publicToken, items]);

  const create = async () => {
    if (!form.title || !form.videoUrl) return;
    const driveId = form.source === "drive" ? extractDriveFileId(form.videoUrl) : "";
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const payload = {
      title: form.title,
      video_url: driveId ? drivePreviewUrl(driveId) : form.videoUrl,
      public_url: driveId ? driveViewUrl(driveId) : form.videoUrl,
      drive_file_id: driveId || "",
      video_source: driveId ? "drive" : String(form.videoUrl).toLowerCase().includes(".m3u8") ? "hls" : form.source,
      project_title: form.projectTitle,
      client_name: form.clientName,
      review_token: token,
      status: "waiting_review"
    };
    const { data } = await createDeliverable({
      title: payload.title,
      video_url: payload.video_url,
      drive_file_id: payload.drive_file_id || null,
      video_source: payload.video_source === "hls" ? "direct" : payload.video_source,
      review_token: payload.review_token,
      status: payload.status
    });
    dispatch({ type: "ADD_REVIEW_DELIVERABLE", deliverable: { ...payload, supabaseId: data?.id || "", review_token: data?.review_token || payload.review_token } });
    setForm({ title: "", videoUrl: "", source: "direct", projectTitle: "", clientName: "" });
    setShowAdd(false);
  };

  const setStatus = async status => {
    if (!current) return;
    if (current.supabaseId) {
      const { error } = await updateDeliverableStatus(current.supabaseId, status);
      if (!error) setPublicItem(p => p ? { ...p, status } : p);
      return;
    }
    dispatch({ type: "UPDATE_REVIEW_DELIVERABLE", id: current.id, data: { status } });
  };

  const saveComment = async () => {
    if (!current || !commentForm.content.trim()) return;
    const seconds = commentForm.timestamp !== "" ? Number(commentForm.timestamp) : Math.floor(playerTime || 0);
    const comment = {
      author_name: commentForm.name.trim() || (isPublic ? "Cliente" : "Produção"),
      author_type: isPublic ? "client" : "producer",
      content: commentForm.content.trim(),
      timestamp_seconds: Number.isFinite(seconds) ? seconds : null,
      timecode: Number.isFinite(seconds) ? fmtTimecode(seconds) : "Geral"
    };
    if (current.supabaseId) {
      const { data, error } = await createVideoComment({ deliverable_id: current.supabaseId, ...comment });
      if (!error) setPublicItem(p => p ? { ...p, comments: [...(p.comments || []), data || { ...comment, id: Date.now(), created_at: new Date().toISOString() }] } : p);
    } else {
      dispatch({ type: "ADD_REVIEW_COMMENT", deliverableId: current.id, comment });
    }
    setCommentForm({ name: "", content: "", timestamp: "" });
  };

  if (publicToken && reviewLoading) {
    return <div className="page-stack"><Card className="page-hero"><div className="page-eyebrow" style={{ color: "#06b6d4" }}>VIDEO REVIEW</div><div className="page-title">Carregando revisão...</div><p className="page-subtitle">Buscando vídeo, status e comentários.</p></Card></div>;
  }

  if (publicToken && reviewError && !current) {
    return <div className="page-stack"><Card className="page-hero"><div className="page-eyebrow" style={{ color: "#ef4444" }}>LINK INDISPONÍVEL</div><div className="page-title">Review não encontrado</div><p className="page-subtitle">{reviewError}</p></Card></div>;
  }

  if (current) {
    const meta = statusMeta[current.status] || statusMeta.waiting_review;
    return (
      <div className="page-stack">
        {!isPublic && <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.orange, cursor: "pointer", fontSize: 13, fontWeight: 800, width: "max-content" }}>← Voltar</button>}
        <Card className="page-hero">
          <div className="page-hero-row">
            <div>
              <div className="page-eyebrow" style={{ color: meta.color }}>VIDEO REVIEW</div>
              <div className="page-title">{current.title}</div>
              <p className="page-subtitle">{current.project_title || "Projeto sem nome"} {current.client_name ? `· ${current.client_name}` : ""} · v{current.version || 1}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <Tag color={meta.color}>{meta.label}</Tag>
                <Tag color="#3b82f6">{current.video_source === "drive" ? "Google Drive" : hlsReady ? "HLS/CDN" : "Link direto"}</Tag>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn onClick={() => setStatus("approved")} variant="success">Aprovado</Btn>
              <Btn onClick={() => setStatus("approved_with_changes")} variant="ghost">Aprovado com ajustes</Btn>
              <Btn onClick={() => setStatus("revision_requested")} variant="ghost">Revisão solicitada</Btn>
              <Btn onClick={() => setStatus("rejected")} variant="danger">Precisa revisar</Btn>
            </div>
          </div>
        </Card>
        <div className="split-layout">
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {current.video_url ? (
              current.video_source === "drive"
                ? <iframe title={`Review ${current.title}`} src={current.video_url} style={{ width: "100%", aspectRatio: "16/9", border: "none", background: "#050505" }} allow="autoplay; fullscreen" />
                : <video ref={videoRef} controls onPause={() => setCommentForm(f => ({ ...f, timestamp: f.timestamp || String(Math.floor(videoRef.current?.currentTime || 0)) }))} onTimeUpdate={e => setPlayerTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setPlayerDuration(e.currentTarget.duration || 0)} style={{ width: "100%", aspectRatio: "16/9", background: "#050505", display: "block" }} />
            ) : <div style={{ padding: 30, color: C.muted }}>Sem vídeo vinculado.</div>}
            {current.video_source !== "drive" && <div style={{ padding: "14px 16px 16px", background: "rgba(0,0,0,.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 900 }}>TIMELINE DE COMENTÁRIOS</span>
                <span style={{ fontSize: 11, color: hlsReady ? "#10b981" : C.muted, fontWeight: 900 }}>{hlsReady ? "HLS adaptativo" : "MP4 direto"}</span>
              </div>
              <div onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seekTo(((e.clientX - rect.left) / rect.width) * (playerDuration || 0)); }} style={{ position: "relative", height: 18, borderRadius: 999, background: "rgba(255,255,255,.08)", cursor: "pointer", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${playerDuration ? Math.min(100, playerTime / playerDuration * 100) : 0}%`, background: "rgba(249,115,22,.22)" }} />
                {comments.filter(c => c.timestamp_seconds != null && playerDuration).map(c => <button key={c.id} onClick={e => { e.stopPropagation(); seekTo(c.timestamp_seconds); }} title={`${fmtTimecode(c.timestamp_seconds)} - ${c.content}`} style={{ position: "absolute", left: `${Math.min(99, Math.max(0, Number(c.timestamp_seconds) / playerDuration * 100))}%`, top: 3, transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", border: "2px solid #111", background: C.orange, boxShadow: "0 0 0 3px rgba(249,115,22,.18)", cursor: "pointer", padding: 0 }} />)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginTop: 6 }}>
                <span>{fmtTimecode(playerTime)}</span><span>{fmtTimecode(playerDuration)}</span>
              </div>
            </div>}
          </Card>
          <aside className="side-panel">
            <Card>
              <SectionTitle>COMENTÁRIOS</SectionTitle>
              {comments.length === 0 && <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Nenhum comentário ainda.</div>}
              {comments.map(c => <button key={c.id} onClick={() => seekTo(c.timestamp_seconds)} style={{ width: "100%", display: "block", textAlign: "left", padding: "10px 0", border: "none", borderBottom: `1px solid ${C.border}`, background: "transparent", fontFamily: "inherit", cursor: c.timestamp_seconds != null ? "pointer" : "default" }}>
                <div style={{ fontSize: 11, color: C.orange, fontWeight: 900 }}>{c.timecode || fmtTimecode(c.timestamp_seconds)} · {c.author_name}</div>
                <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.45, marginTop: 4 }}>{c.content}</div>
              </button>)}
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "#ddd", fontWeight: 900 }}>Comentar neste momento: <span style={{ color: C.orange }}>{fmtTimecode(commentForm.timestamp !== "" ? commentForm.timestamp : playerTime)}</span></div>
                <input value={commentForm.name} onChange={e => setCommentForm(f => ({ ...f, name: e.target.value }))} placeholder={isPublic ? "Seu nome" : "Autor"} style={{ height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,.045)", color: "#fff", padding: "0 10px", fontFamily: "inherit", outline: "none" }} />
                <input type="number" min="0" value={commentForm.timestamp} onChange={e => setCommentForm(f => ({ ...f, timestamp: e.target.value }))} placeholder="Segundo do vídeo (opcional)" style={{ height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,.045)", color: "#fff", padding: "0 10px", fontFamily: "inherit", outline: "none" }} />
                <textarea value={commentForm.content} onChange={e => setCommentForm(f => ({ ...f, content: e.target.value }))} placeholder="Escreva o ajuste ou comentário..." rows={4} style={{ borderRadius: 12, border: `1px solid ${C.border}`, background: "rgba(255,255,255,.045)", color: "#fff", padding: 10, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
                <Btn onClick={saveComment} size="sm" disabled={!commentForm.content.trim()}>Enviar comentário</Btn>
              </div>
            </Card>
            {!isPublic && <Card>
              <SectionTitle>LINK DO CLIENTE</SectionTitle>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, wordBreak: "break-all" }}>{`${location.origin}${location.pathname}?review=${current.review_token}`}</div>
              <Btn onClick={() => navigator.clipboard?.writeText(`${location.origin}${location.pathname}?review=${current.review_token}`)} size="sm" variant="ghost" style={{ marginTop: 12 }}>Copiar link</Btn>
            </Card>}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <Card className="page-hero">
        <div className="page-hero-row">
          <div>
            <div className="page-eyebrow" style={{ color: "#06b6d4" }}>VIDEO REVIEW NATIVO</div>
            <div className="page-title">Revisões de vídeo sem fricção</div>
            <p className="page-subtitle">Central para versões, links do cliente, comentários por timestamp e aprovações. Use MP4 direto ou HLS/CDN para reprodução mais leve.</p>
          </div>
          <Btn onClick={() => setShowAdd(true)}>+ Novo review</Btn>
        </div>
      </Card>
      {items.length === 0 && <PremiumEmpty icon="▶" title="Nenhum vídeo em revisão" text="Crie um review com link direto, HLS ou Google Drive. Depois você acompanha status, comentários e aprovação." action={<Btn onClick={() => setShowAdd(true)} size="sm">Criar review</Btn>} />}
      <div className="elite-briefing">
        {items.map(item => {
          const meta = statusMeta[item.status] || statusMeta.waiting_review;
          return <button key={item.id} onClick={() => setSelected(item.id)} className="elite-brief-card" style={{ "--accent": meta.color, textAlign: "left", fontFamily: "inherit" }}>
            <div className="elite-brief-label">{item.video_source === "drive" ? "Google Drive" : item.video_source === "hls" ? "HLS/CDN" : "Link direto"}</div>
            <div className="elite-brief-value" style={{ fontSize: 20, lineHeight: 1.1 }}>{item.title}</div>
            <div className="elite-brief-note">{item.project_title || "Sem projeto"} · {(item.comments || []).length} comentário{(item.comments || []).length === 1 ? "" : "s"}</div>
            <div className="elite-brief-action">{meta.label}</div>
          </button>;
        })}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Novo Video Review" wide>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {[["direct", "Link direto / HLS"], ["drive", "Google Drive"]].map(([id, label]) => <button key={id} onClick={() => setForm(f => ({ ...f, source: id }))} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${form.source === id ? C.orange : C.border}`, background: form.source === id ? "rgba(249,115,22,.14)" : "rgba(255,255,255,.035)", color: form.source === id ? C.orange : C.muted, fontFamily: "inherit", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>{label}</button>)}
        </div>
        <div className="form-grid-2">
          <Inp label="Título do vídeo" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Ex: Institucional v1" />
          <Inp label="Projeto" value={form.projectTitle} onChange={v => setForm(f => ({ ...f, projectTitle: v }))} placeholder="Nome do projeto" />
          <Inp label="Cliente" value={form.clientName} onChange={v => setForm(f => ({ ...f, clientName: v }))} placeholder="Nome do cliente" />
          <Inp label={form.source === "drive" ? "Link ou ID do Google Drive" : "URL do vídeo ou .m3u8"} value={form.videoUrl} onChange={v => setForm(f => ({ ...f, videoUrl: v }))} placeholder={form.source === "drive" ? "https://drive.google.com/file/d/..." : "https://.../playlist.m3u8"} />
        </div>
        <Btn onClick={create} disabled={!form.title || !form.videoUrl}>Criar review</Btn>
      </Modal>
    </div>
  );
}
