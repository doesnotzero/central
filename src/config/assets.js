import { BRANDING } from "./branding.js";

const parseEnvJson = (key, fallback = {}) => {
  const raw = import.meta.env[key];
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    console.warn(`Invalid ${key}. Expected a JSON object.`);
    return fallback;
  }
};

const DEFAULT_PUBLIC_ASSET_ROOT = "/dnz-assets";

export const DEFAULT_ASSETS = {
  publicRoot: DEFAULT_PUBLIC_ASSET_ROOT,
  logoUrl: BRANDING.logoUrl || `${DEFAULT_PUBLIC_ASSET_ROOT}/dnz-logo-nav.webp`,
  loginLogoUrl: BRANDING.logoUrl || `${DEFAULT_PUBLIC_ASSET_ROOT}/dnz-logo-nav.webp`,
  heroPreviewUrl: `${DEFAULT_PUBLIC_ASSET_ROOT}/showreel-preview.webp`,
  aboutImageUrl: `${DEFAULT_PUBLIC_ASSET_ROOT}/dante.webp`,
  productScreenshots: [
    `${DEFAULT_PUBLIC_ASSET_ROOT}/1177779611.webp`,
    `${DEFAULT_PUBLIC_ASSET_ROOT}/1177775878.webp`,
    `${DEFAULT_PUBLIC_ASSET_ROOT}/1177774829.webp`,
    `${DEFAULT_PUBLIC_ASSET_ROOT}/social-impact.webp`,
  ],
};

export const ASSETS = {
  ...DEFAULT_ASSETS,
  ...parseEnvJson("VITE_ASSET_CONFIG"),
};
