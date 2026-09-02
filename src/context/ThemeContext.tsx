import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreset =
  | 'premium-ai-tech'
  | 'modern-light-agency'
  | 'luxury-creative'
  | 'obsidian-neon'
  | 'clean-corporate'
  // Legacy fallback aliases
  | 'cyber-obsidian'
  | 'emerald-ops'
  | 'midnight-violet'
  | 'executive-slate';

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  subtitle: string;
  category: string;
  primaryAccent: string;
  secondaryAccent: string;
  bgMain: string;
  bgSurface: string;
  bgCard: string;
  borderSubtle: string;
  borderGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  glowEffect: string;
  badgeBg: string;
  badgeText: string;
  activeNavBg: string;
  fontHeading: string;
  fontBody: string;
  isLightMode: boolean;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  'premium-ai-tech': {
    id: 'premium-ai-tech',
    name: '1. Premium AI / Tech',
    subtitle: 'Dark Slate (#0F172A) + Teal (#14B8A6) + Gold (#D4A853)',
    category: 'E-commerce + AI Automation',
    primaryAccent: '#14b8a6',
    secondaryAccent: '#d4a853',
    bgMain: '#0f172a',
    bgSurface: '#162033',
    bgCard: '#1e293b',
    borderSubtle: 'rgba(20, 184, 166, 0.15)',
    borderGlow: 'rgba(212, 168, 83, 0.4)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    glowEffect: '0 0 25px rgba(20, 184, 166, 0.25)',
    badgeBg: 'rgba(20, 184, 166, 0.15)',
    badgeText: '#2dd4bf',
    activeNavBg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    fontHeading: "'Manrope', sans-serif",
    fontBody: "'Inter', sans-serif",
    isLightMode: false,
  },
  'modern-light-agency': {
    id: 'modern-light-agency',
    name: '2. Modern Light Agency',
    subtitle: 'Off-white (#F8FAFC) + Black + Electric Blue (#2563EB)',
    category: 'Corporate & Trustworthy',
    primaryAccent: '#2563eb',
    secondaryAccent: '#0284c7',
    bgMain: '#f8fafc',
    bgSurface: '#ffffff',
    bgCard: '#f1f5f9',
    borderSubtle: '#e2e8f0',
    borderGlow: 'rgba(37, 99, 235, 0.35)',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    glowEffect: '0 4px 20px rgba(37, 99, 235, 0.15)',
    badgeBg: 'rgba(37, 99, 235, 0.1)',
    badgeText: '#1d4ed8',
    activeNavBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    fontHeading: "'Manrope', sans-serif",
    fontBody: "'Inter', sans-serif",
    isLightMode: true,
  },
  'luxury-creative': {
    id: 'luxury-creative',
    name: '3. Luxury Creative',
    subtitle: 'Minimal Black (#0A0A0A) + Pure White + Muted Gold (#D4AF37)',
    category: 'High-End Brand & Portfolio',
    primaryAccent: '#d4af37',
    secondaryAccent: '#f59e0b',
    bgMain: '#0a0a0a',
    bgSurface: '#121212',
    bgCard: '#1a1a1a',
    borderSubtle: 'rgba(212, 175, 55, 0.18)',
    borderGlow: 'rgba(212, 175, 55, 0.45)',
    textPrimary: '#ffffff',
    textSecondary: '#d4d4d4',
    textMuted: '#888888',
    glowEffect: '0 0 25px rgba(212, 175, 55, 0.25)',
    badgeBg: 'rgba(212, 175, 55, 0.15)',
    badgeText: '#eab308',
    activeNavBg: 'linear-gradient(135deg, #d4af37 0%, #b49127 100%)',
    fontHeading: "'Manrope', sans-serif",
    fontBody: "'Inter', sans-serif",
    isLightMode: false,
  },
  'obsidian-neon': {
    id: 'obsidian-neon',
    name: '4. Obsidian Neon Cyber',
    subtitle: 'Deep Space (#090714) + Neon Violet (#A855F7) + Cyan (#06B6D4)',
    category: 'AI Tech & Innovation',
    primaryAccent: '#a855f7',
    secondaryAccent: '#06b6d4',
    bgMain: '#090714',
    bgSurface: '#120f26',
    bgCard: '#1a1638',
    borderSubtle: 'rgba(168, 85, 247, 0.18)',
    borderGlow: 'rgba(168, 85, 247, 0.45)',
    textPrimary: '#faf5ff',
    textSecondary: '#d8b4fe',
    textMuted: '#9333ea',
    glowEffect: '0 0 25px rgba(168, 85, 247, 0.25)',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    badgeText: '#c084fc',
    activeNavBg: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
    fontHeading: "'Space Grotesk', 'Manrope', sans-serif",
    fontBody: "'Inter', sans-serif",
    isLightMode: false,
  },
  'clean-corporate': {
    id: 'clean-corporate',
    name: '5. Clean Corporate Slate',
    subtitle: 'Navy Slate (#0B132B) + Emerald (#10B981) + Indigo (#6366F1)',
    category: 'Operational Growth Engine',
    primaryAccent: '#10b981',
    secondaryAccent: '#6366f1',
    bgMain: '#0b132b',
    bgSurface: '#1c2541',
    bgCard: '#253254',
    borderSubtle: 'rgba(16, 185, 129, 0.15)',
    borderGlow: 'rgba(16, 185, 129, 0.4)',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    glowEffect: '0 0 25px rgba(16, 185, 129, 0.2)',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeText: '#34d399',
    activeNavBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    fontHeading: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
    isLightMode: false,
  },
};

// Map legacy IDs to new ones
THEME_PRESETS['cyber-obsidian'] = THEME_PRESETS['premium-ai-tech'];
THEME_PRESETS['emerald-ops'] = THEME_PRESETS['clean-corporate'];
THEME_PRESETS['midnight-violet'] = THEME_PRESETS['obsidian-neon'];
THEME_PRESETS['executive-slate'] = THEME_PRESETS['modern-light-agency'];

interface ThemeContextType {
  theme: ThemePreset;
  setTheme: (theme: ThemePreset) => void;
  currentThemeConfig: ThemeConfig;
  allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_THEME_KEY = 'noryxa_selected_theme_v7';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemePreset;
    return saved && THEME_PRESETS[saved] ? saved : 'premium-ai-tech';
  });

  const setTheme = (newTheme: ThemePreset) => {
    setThemeState(newTheme);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
  };

  const currentThemeConfig = THEME_PRESETS[theme] || THEME_PRESETS['premium-ai-tech'];

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (currentThemeConfig.isLightMode) {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    }

    // Set CSS Custom Properties for dynamic styling
    root.style.setProperty('--bg-main', currentThemeConfig.bgMain);
    root.style.setProperty('--bg-surface', currentThemeConfig.bgSurface);
    root.style.setProperty('--bg-card', currentThemeConfig.bgCard);
    root.style.setProperty('--border-subtle', currentThemeConfig.borderSubtle);
    root.style.setProperty('--border-glow', currentThemeConfig.borderGlow);
    root.style.setProperty('--text-primary', currentThemeConfig.textPrimary);
    root.style.setProperty('--text-secondary', currentThemeConfig.textSecondary);
    root.style.setProperty('--text-muted', currentThemeConfig.textMuted);
    root.style.setProperty('--primary-accent', currentThemeConfig.primaryAccent);
    root.style.setProperty('--secondary-accent', currentThemeConfig.secondaryAccent);
    root.style.setProperty('--font-heading', currentThemeConfig.fontHeading);
    root.style.setProperty('--font-body', currentThemeConfig.fontBody);

    document.body.style.backgroundColor = currentThemeConfig.bgMain;
    document.body.style.color = currentThemeConfig.textPrimary;
    document.body.style.fontFamily = currentThemeConfig.fontBody;
  }, [theme, currentThemeConfig]);

  // Return unique main 5 themes for the menu display
  const mainFiveThemes = [
    THEME_PRESETS['premium-ai-tech'],
    THEME_PRESETS['modern-light-agency'],
    THEME_PRESETS['luxury-creative'],
    THEME_PRESETS['obsidian-neon'],
    THEME_PRESETS['clean-corporate'],
  ];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentThemeConfig,
        allThemes: mainFiveThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
