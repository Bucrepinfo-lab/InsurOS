export const tokens = {
  colors: {
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    primary: '#020617',
    primaryForeground: '#ffffff',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626'
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
} as const;

export type InsurOSTokens = typeof tokens;
