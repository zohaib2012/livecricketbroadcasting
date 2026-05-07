'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeType, themes, getTheme } from '@/lib/themes';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeConfig: ReturnType<typeof getTheme>;
  isPaid: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('default');

  useEffect(() => {
    const saved = localStorage.getItem('criclive-theme') as ThemeType;
    if (saved && themes.find(t => t.id === saved)) {
      setThemeState(saved);
    }
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('criclive-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const themeConfig = getTheme(theme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig, isPaid: theme === 'premium' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
