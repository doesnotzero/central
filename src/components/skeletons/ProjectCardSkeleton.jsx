import React from "react";

export const ProjectCardSkeleton = () => (
  <div className="metric-tile" style={{ display: "grid", gap: 12 }}>
    <div style={{ height: 12, width: "40%", borderRadius: 99, background: "rgba(255,255,255,.08)" }} />
    <div style={{ height: 28, width: "80%", borderRadius: 12, background: "rgba(255,255,255,.08)" }} />
    <div style={{ height: 8, width: "100%", borderRadius: 99, background: "rgba(255,255,255,.06)" }} />
  </div>
);
