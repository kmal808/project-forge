import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const themes: Theme[] = ['light', 'dark', 'tokyo-night', 'andromeda'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved && themes.includes(saved) ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'tokyo-night', 'andromeda');
    
    // Add current theme class
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}