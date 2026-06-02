import React from "react";
import { ChipSelector } from "./ChipSelector.jsx";

const PRESETS = [
  { label: "15s", value: "00:15" },
  { label: "30s", value: "00:30" },
  { label: "60s", value: "01:00" },
  { label: "2min", value: "02:00" },
  { label: "5min", value: "05:00" },
  { label: "10min+", value: "10:00" }
];

export const DurationPicker = ({ label = "Duração", value, onChange }) => (
  <div style={{ display: "grid", gap: 8 }}>
    <div style={{ fontSize: 11, color: "#858585", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div>
    <ChipSelector options={PRESETS} value={value} onChange={onChange} columns={3} />
  </div>
);
