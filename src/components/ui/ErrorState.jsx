import React from "react";

export const ErrorState = ({ title = "Não foi possível carregar", text = "Tente novamente em alguns segundos.", onRetry }) => (
  <div className="metric-tile" style={{ padding: 22, borderColor: "rgba(239,68,68,.28)", background: "rgba(239,68,68,.08)" }}>
    <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Erro</div>
    <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, fontFamily: "'Syne',sans-serif" }}>{title}</div>
    <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, margin: "8px 0 14px" }}>{text}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="elite-secondary" style={{ minHeight: 36, padding: "0 12px" }}>
        Tentar novamente
      </button>
    )}
  </div>
);
