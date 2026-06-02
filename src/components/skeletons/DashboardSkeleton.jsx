import React from "react";

const SkeletonBlock = ({ style = {} }) => (
  <div style={{ borderRadius: 16, minHeight: 84, background: "linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.08),rgba(255,255,255,.04))", backgroundSize: "220% 100%", animation: "shimmer 1.3s infinite linear", ...style }} />
);

export const DashboardSkeleton = () => (
  <div className="page-stack">
    <SkeletonBlock style={{ minHeight: 190, borderRadius: 26 }} />
    <div className="summary-strip">
      {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} />)}
    </div>
  </div>
);
