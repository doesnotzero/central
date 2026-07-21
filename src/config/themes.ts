export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    muted: string
    faint: string
  }
  fonts: {
    display: string
    body: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
}

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#ff2400",
    secondary: "#3b82f6",
    background: "#0d0d0d",
    surface: "rgba(255,255,255,0.04)",
    text: "#e8e8e8",
    muted: "#666",
    faint: "#2a2a2a"
  },
  fonts: {
    display: "Syne",
    body: "DM Sans"
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px"
  }
};
