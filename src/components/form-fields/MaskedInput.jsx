import React from "react";

const onlyDigits = value => String(value || "").replace(/\D/g, "");

const maskValue = (value, mask) => {
  const digits = onlyDigits(value);
  if (mask === "cpf") return digits.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2").slice(0, 14);
  if (mask === "cnpj") return digits.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").slice(0, 18);
  if (mask === "phone") return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2").slice(0, 15);
  if (mask === "currency") return (Number(digits || 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return value;
};

export const MaskedInput = ({ label, value, onChange, mask = "phone", placeholder }) => (
  <label style={{ display: "grid", gap: 7, fontSize: 11, color: "#858585", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
    {label}
    <input
      value={maskValue(value, mask)}
      onChange={event => onChange(onlyDigits(event.target.value))}
      placeholder={placeholder}
      style={{ width: "100%", background: "rgba(255,255,255,0.065)", border: "1px solid rgba(255,255,255,.11)", borderRadius: 14, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
    />
  </label>
);
