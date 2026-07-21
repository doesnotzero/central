// ── THEME CONFIG ────────────────────────────────────────────────────────
// Central theme and whitelabel-aware branding for the workspace.

import { BRANDING } from "./config/branding.js";

export { BRANDING };

export const APP_NAME = BRANDING.appName;
export const APP_SUBTITLE = BRANDING.appSubtitle;
export const SALES_EMAIL = BRANDING.salesEmail;
export const SALES_WHATSAPP = BRANDING.salesWhatsapp;

export const C = {
  bg: "#0d0d0d",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.07)",
  orange: BRANDING.primaryColor,
  orangeD: BRANDING.primaryColorDark || BRANDING.primaryColor,
  red: BRANDING.primaryColor,
  text: "#e8e8e8",
  muted: "#666",
  faint: "#2a2a2a",
};
