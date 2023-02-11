export interface Theme {
  url?: string
  /** @deprecated Use brightness instead */
  quality?: 'dark' | 'light'
  brightness: 'dark' | 'light'
  colors: {
    surface: string
    background: string
    foreground: string
    primary: string
    primaryContrast: string
    secondary?: string
    secondaryContrast?: string
    success?: string
    successContrast?: string
    warn: string
    warnContrast: string
    error: string
    errorContrast: string
    disabled: string
  }
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  fontFamily: string
  /** A unit to multiply for margin & padding */
  space: number
}

export interface ThemeUrls {
  light: string;
  dark: string;
}
