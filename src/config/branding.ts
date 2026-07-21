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
  appName: "DNZ Central",
  appSubtitle: "DOES NOT ZERO",
  brandName: "DNZ Films",
  companyName: "DNZ Films",
  logoUrl: "",
  primaryColor: "#ff2400",
  primaryColorDark: "#cc1d00",
  whatsapp: "5548998050267",
  proposalEmail: "contato@dnzcentral.com.br",
  proposalDocument: "",
  proposalCity: "Florianópolis, SC",
  currency: "BRL",
  salesEmail: "contato@dnzcentral.com.br",
  salesWhatsapp: "5548998050267",
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
  mainServices: ["Filme de surf", "Documentário de atleta", "Vídeo para marca", "Cobertura de evento"],
  brandName: "DNZ Films",
  companyName: "DNZ Films",
  logoUrl: "",
  primaryColor: "#ff2400",
  whatsapp: "5548998050267",
  proposalEmail: "contato@dnzcentral.com.br",
  proposalDocument: "",
  proposalCity: "Florianópolis, SC",
  currency: "BRL",
};
