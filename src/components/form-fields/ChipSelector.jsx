import React from "react";

export const ChipSelector = ({
  options,
  value,
  onChange,
  multiple = false,
  columns,
  size = "md"
}) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const toggle = optionValue => {
    if (!multiple) {
      onChange(optionValue);
      return;
    }
    onChange(
      selected.includes(optionValue)
        ? selected.filter(item => item !== optionValue)
        : [...selected, optionValue]
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: columns ? `repeat(${columns},minmax(0,1fr))` : "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
      {options.map(option => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            style={{
              minHeight: size === "lg" ? 44 : size === "sm" ? 30 : 36,
              borderRadius: 12,
              border: `1px solid ${active ? "rgba(255,36,0,.6)" : "rgba(255,255,255,.15)"}`,
              background: active ? "rgba(255,36,0,.2)" : "rgba(255,255,255,.035)",
              color: active ? "#ff2400" : "rgba(255,255,255,.66)",
              fontFamily: "inherit",
              fontSize: size === "sm" ? 11 : 12,
              fontWeight: 900,
              cursor: "pointer",
              transform: "translateZ(0)",
              transition: "transform .12s ease,border-color .12s ease,background .12s ease"
            }}
            onMouseDown={event => { event.currentTarget.style.transform = "scale(.97)"; }}
            onMouseUp={event => { event.currentTarget.style.transform = "scale(1)"; }}
            onMouseLeave={event => { event.currentTarget.style.transform = "scale(1)"; }}
          >
            {active ? "✓ " : ""}{option.icon ? `${option.icon} ` : ""}{option.label}
          </button>
        );
      })}
    </div>
  );
};
