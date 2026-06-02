import React from "react";

export const OptionCards = ({ options, value, onChange, columns = 3 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`, gap: 10 }}>
    {options.map(option => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            minHeight: 96,
            textAlign: "left",
            padding: 14,
            borderRadius: 16,
            border: `1px solid ${active ? "rgba(249,115,22,.6)" : "rgba(255,255,255,.12)"}`,
            background: active ? "rgba(249,115,22,.16)" : "rgba(255,255,255,.04)",
            color: active ? "#f97316" : "#ddd",
            fontFamily: "inherit",
            cursor: "pointer"
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 8 }}>{option.icon || "•"}</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: active ? "#f97316" : "#fff" }}>{option.label}</div>
          {option.description && <div style={{ fontSize: 11, color: "#858585", lineHeight: 1.4, marginTop: 4 }}>{option.description}</div>}
        </button>
      );
    })}
  </div>
);
