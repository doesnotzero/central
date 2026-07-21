const parseEnvJson = (key: string, fallback: Record<string, any> = {}): Record<string, any> => {
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

export interface BrandingConfig {
  appName: string
  appSubtitle: string
  brandName: string
  companyName: string
  logoUrl: string
  primaryColor: string
  primaryColorDark?: string
  whatsapp: string
  proposalEmail: string
  proposalDocument: string
  proposalCity: string
  currency: string
  salesEmail: string
  salesWhatsapp: string
}

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: "Production OS",
  appSubtitle: "PRODUCTION OS",
  brandName: "Your Brand",
  companyName: "Your Company",
  logoUrl: "",
  primaryColor: "#ff2400",
  primaryColorDark: "#cc1d00",
  whatsapp: "",
  proposalEmail: "",
  proposalDocument: "",
  proposalCity: "",
  currency: "BRL",
  salesEmail: "",
  salesWhatsapp: "",
};

export const BRANDING: BrandingConfig = {
  ...DEFAULT_BRANDING,
  ...parseEnvJson("VITE_BRANDING_CONFIG"),
};

export interface BusinessConfig {
  onboarded: boolean
  type: string
  ticketAverage: number
  mainServices: string[]
  brandName: string
  companyName: string
  logoUrl: string
  primaryColor: string
  whatsapp: string
  proposalEmail: string
  proposalDocument: string
  proposalCity: string
  currency: string
}

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  onboarded: true,
  type: "Audiovisual / produtora",
  ticketAverage: 2500,
  mainServices: ["Vídeo Institucional", "Reel / Short", "Cobertura de Evento"],
  brandName: "Your Brand",
  companyName: "Your Company",
  logoUrl: "",
  primaryColor: "#ff2400",
  whatsapp: "",
  proposalEmail: "",
  proposalDocument: "",
  proposalCity: "",
  currency: "BRL",
};
