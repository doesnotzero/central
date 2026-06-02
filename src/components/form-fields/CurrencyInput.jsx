import React from "react";

const parseCurrency = value => Number(String(value || "").replace(/\D/g, "")) / 100;

export const CurrencyInput = ({ label, value, onChange, placeholder = "R$ 0,00" }) => {
  const formatted = Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <label style={{ display: "grid", gap: 7 }}>
      {label && <span style={{ fontSize: 11, color: "#858585", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</span>}
      <input
        inputMode="numeric"
        value={value === "" || value === null || value === undefined ? "" : formatted}
        onChange={event => onChange(parseCurrency(event.target.value))}
        placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.065)", border: "1px solid rgba(255,255,255,.11)", borderRadius: 14, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
      />
    </label>
  );
};
