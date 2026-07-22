import React from "react";

export const EmptyState = ({ title, text, action, icon = "+" }) => (
  <div className="metric-tile" style={{ textAlign: "center", padding: 28 }}>
    <div style={{ width: 42, height: 42, borderRadius: 14, margin: "0 auto 12px", display: "grid", placeItems: "center", background: "rgba(255,36,0,.12)", border: "1px solid rgba(255,36,0,.28)", color: "#ff2400", fontSize: 18, fontWeight: 900 }}>
      {icon}
    </div>
    <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>{title}</div>
    {text && <p style={{ fontSize: 13, color: "#858585", lineHeight: 1.5, margin: "0 auto 14px", maxWidth: 420 }}>{text}</p>}
    {action}
  </div>
);
