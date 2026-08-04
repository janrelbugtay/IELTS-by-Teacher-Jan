import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'picture';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme') as Theme;
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    
    // Remove existing theme classes
    document.documentElement.classList.remove('dark', 'theme-picture');
    document.body.style.backgroundColor = '';
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'picture') {
      document.documentElement.classList.add('theme-picture');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
