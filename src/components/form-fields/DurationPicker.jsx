import React from "react";
import { ChipSelector } from "./ChipSelector.jsx";

const PRESETS = [
  { label: "15s", value: "15s" },
  { label: "30s", value: "30s" },
  { label: "60s", value: "60s" },
  { label: "2min", value: "2min" },
  { label: "3min", value: "3min" },
  { label: "5min+", value: "5min+" }
];

export const DurationPicker = ({ label = "Duração", value, onChange, presets = PRESETS }) => (
  <div style={{ display: "grid", gap: 8 }}>
    <div style={{ fontSize: 11, color: "#858585", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div>
    <ChipSelector options={presets} value={value} onChange={onChange} columns={3} />
  </div>
);
