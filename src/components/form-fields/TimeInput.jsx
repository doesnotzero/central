import React from "react";

const toMinutes = value => {
  const [hours = 0, minutes = 0] = String(value || "00:00").split(":").map(Number);
  return Math.max(0, Math.min(1439, hours * 60 + minutes));
};

const fromMinutes = minutes => {
  const safe = Math.max(0, Math.min(1439, minutes));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};

export const TimeInput = ({ label, value, onChange, step = 15 }) => (
  <label style={{ display: "grid", gap: 7 }}>
    {label && <span style={{ fontSize: 11, color: "#858585", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</span>}
    <span style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", gap: 8 }}>
      <button type="button" onClick={() => onChange(fromMinutes(toMinutes(value) - step))} className="elite-secondary" style={{ minHeight: 38, padding: 0 }}>-</button>
      <input type="time" value={value || "09:00"} onChange={event => onChange(event.target.value)} style={{ textAlign: "center", background: "rgba(255,255,255,0.065)", border: "1px solid rgba(255,255,255,.11)", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: "inherit" }} />
      <button type="button" onClick={() => onChange(fromMinutes(toMinutes(value) + step))} className="elite-secondary" style={{ minHeight: 38, padding: 0 }}>+</button>
    </span>
  </label>
);
