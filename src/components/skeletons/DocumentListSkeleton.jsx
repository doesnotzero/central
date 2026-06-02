import React from "react";
import { TableRowSkeleton } from "./TableRowSkeleton.jsx";

export const DocumentListSkeleton = () => (
  <div className="metric-tile">
    <div style={{ height: 14, width: 160, borderRadius: 99, background: "rgba(255,255,255,.08)", marginBottom: 14 }} />
    <TableRowSkeleton rows={5} />
  </div>
);
