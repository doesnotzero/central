import React from "react";

export const TableRowSkeleton = ({ rows = 4 }) => (
  <div style={{ display: "grid", gap: 8 }}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} style={{ height: 42, borderRadius: 12, background: "linear-gradient(90deg,rgba(255,255,255,.035),rgba(255,255,255,.075),rgba(255,255,255,.035))", backgroundSize: "220% 100%", animation: "shimmer 1.3s infinite linear" }} />
    ))}
  </div>
);
