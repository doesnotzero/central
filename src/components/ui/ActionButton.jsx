import React, { useEffect, useState } from "react";

const LABELS = {
  idle: null,
  loading: "Salvando...",
  success: "Salvo",
  error: "Erro ao salvar"
};

export const ActionButton = ({
  children,
  onClick,
  state = "idle",
  successLabel = LABELS.success,
  errorLabel = LABELS.error,
  loadingLabel = LABELS.loading,
  className = "btn-hover",
  style = {},
  disabled = false,
  resetAfter = 2000
}) => {
  const [visualState, setVisualState] = useState(state);

  useEffect(() => setVisualState(state), [state]);
  useEffect(() => {
    if (!["success", "error"].includes(visualState)) return undefined;
    const timer = window.setTimeout(() => setVisualState("idle"), resetAfter);
    return () => window.clearTimeout(timer);
  }, [resetAfter, visualState]);

  const currentLabel = visualState === "loading"
    ? `⟳ ${loadingLabel}`
    : visualState === "success"
      ? `✓ ${successLabel}`
      : visualState === "error"
        ? `✕ ${errorLabel}`
        : children;

  const color = visualState === "success" ? "#10b981" : visualState === "error" ? "#ef4444" : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || visualState === "loading"}
      className={className}
      style={{
        borderRadius: 10,
        cursor: disabled || visualState === "loading" ? "not-allowed" : "pointer",
        fontWeight: 800,
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: "10px 16px",
        fontSize: 13,
        color: color || "#fff",
        background: color ? `${color}20` : "linear-gradient(135deg,#f97316,#ea580c)",
        border: color ? `1px solid ${color}55` : "none",
        opacity: disabled ? .55 : 1,
        ...style
      }}
    >
      {currentLabel}
    </button>
  );
};
