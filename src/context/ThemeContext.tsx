import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 
  | 'light' 
  | 'light-oat' 
  | 'light-sage' 
  | 'light-azure' 
  | 'light-lavender'
  | 'dimmed-slate' 
  | 'midnight-navy' 
  | 'emerald-matrix' 
  | 'forest-pine' 
  | 'nordic-steel' 
  | 'indigo-twilight';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  category: 'light' | 'dark';
  description: string;
  previewBg: string;
  previewCard: string;
  previewAccent: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  // Soft & Clean Light Themes
  {
    id: 'light-oat',
    name: 'Soft Oat & Sand',
    category: 'light',
    description: 'Gentle warm cream canvas with amber stone accents',
    previewBg: '#FAF8F5',
    previewCard: '#FFFFFF',
    previewAccent: '#B45309',
  },
  {
    id: 'light-sage',
    name: 'Soft Sage Mist',
    category: 'light',
    description: 'Calming botanical pastel green with forest emerald highlights',
    previewBg: '#F3F7F4',
    previewCard: '#FFFFFF',
    previewAccent: '#059669',
  },
  {
    id: 'light-azure',
    name: 'Soft Sky Azure',
    category: 'light',
    description: 'Airy tranquil blue wash with refined ocean accents',
    previewBg: '#F2F7FA',
    previewCard: '#FFFFFF',
    previewAccent: '#0284C7',
  },
  {
    id: 'light-lavender',
    name: 'Soft Lavender Mist',
    category: 'light',
    description: 'Gentle soothing lilac pastel with soft iris accents',
    previewBg: '#F7F5FA',
    previewCard: '#FFFFFF',
    previewAccent: '#7C3AED',
  },
  {
    id: 'light',
    name: 'Clean Slate Light',
    category: 'light',
    description: 'Crisp minimal white canvas with high contrast typography',
    previewBg: '#F8FAFC',
    previewCard: '#FFFFFF',
    previewAccent: '#2563EB',
  },

  // Deep Dark Themes
  {
    id: 'emerald-matrix',
    name: 'Deep Emerald Obsidian',
    category: 'dark',
    description: 'Ultra-dark emerald black (#020B06) with vibrant mint green accents',
    previewBg: '#020B06',
    previewCard: '#06170E',
    previewAccent: '#10B981',
  },
  {
    id: 'forest-pine',
    name: 'Pine Forest Night',
    category: 'dark',
    description: 'Deep woodland night (#040D09) with soft sage accents',
    previewBg: '#040D09',
    previewCard: '#091A13',
    previewAccent: '#34D399',
  },
  {
    id: 'dimmed-slate',
    name: 'Deep Dimmed Slate',
    category: 'dark',
    description: 'Ultra-dark slate navy (#030712) with electric sky accents',
    previewBg: '#030712',
    previewCard: '#0B1120',
    previewAccent: '#38BDF8',
  },
  {
    id: 'midnight-navy',
    name: 'Pitch Midnight Navy',
    category: 'dark',
    description: 'Deep ocean midnight (#020617) with royal sapphire accents',
    previewBg: '#020617',
    previewCard: '#070D1E',
    previewAccent: '#60A5FA',
  },
  {
    id: 'nordic-steel',
    name: 'Nordic Steel Black',
    category: 'dark',
    description: 'Deep arctic black-blue (#040910) with cyan highlights',
    previewBg: '#040910',
    previewCard: '#0A1320',
    previewAccent: '#00B4D8',
  },
  {
    id: 'indigo-twilight',
    name: 'Deep Indigo Night',
    category: 'dark',
    description: 'Deep obsidian night (#04050E) with soft violet highlights',
    previewBg: '#04050E',
    previewCard: '#0A0D1E',
    previewAccent: '#818CF8',
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('app-theme') as ThemeId;
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'forest-pine';
    }
    return 'light-oat';
  });

  const currentOption = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];
  const isDark = currentOption.category === 'dark';

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const toggleTheme = () => {
    if (isDark) {
      setTheme('light-oat');
    } else {
      setTheme('forest-pine');
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove all previous theme classes
    THEME_OPTIONS.forEach(t => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.remove('dark');

    if (isDark) {
      root.classList.add('dark');
    }
    root.classList.add(`theme-${theme}`);

    // Update meta theme-color tag dynamically for mobile browser UI (Firefox, Chrome, Safari)
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', currentOption.previewBg);

    // Keep html & body inline background matching so overscroll has no white padding
    root.style.backgroundColor = currentOption.previewBg;
    if (document.body) {
      document.body.style.backgroundColor = currentOption.previewBg;
    }
  }, [theme, isDark, currentOption]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme, currentOption }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
