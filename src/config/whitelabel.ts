import { DEFAULT_BRANDING } from './branding';

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

export interface FeatureConfig {
  commandPalette: boolean
  googleDrive: boolean
  videoReview: boolean
  studioDocs: boolean
  finance: boolean
  analytics: boolean
}

export interface LimitConfig {
  maxWorkspaces: number
  maxMembersPerWorkspace: number
  maxProjects: number
  maxStorageGB: number
}

export interface WhitelabelConfig {
  branding: BrandingConfig
  features: FeatureConfig
  limits: LimitConfig
}

export const defaultWhitelabel: WhitelabelConfig = {
  branding: DEFAULT_BRANDING,
  features: {
    commandPalette: true,
    googleDrive: true,
    videoReview: true,
    studioDocs: true,
    finance: true,
    analytics: true
  },
  limits: {
    maxWorkspaces: 1,
    maxMembersPerWorkspace: 10,
    maxProjects: 100,
    maxStorageGB: 10
  }
};
