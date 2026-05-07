export type ThemeType = 'default' | 'premium';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  label: string;
  isPaid: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  gradients?: {
    hero?: string;
    card?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
}

export const themes: ThemeConfig[] = [
  {
    id: 'default',
    name: 'default',
    label: 'Default Dark',
    isPaid: false,
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: 'from-slate-900 via-purple-900 to-slate-900',
      surface: 'bg-white/5 border-white/10',
      text: 'text-white',
      accent: 'text-gray-300',
    },
    gradients: {
      hero: 'from-slate-900 via-purple-900 to-slate-900',
      card: 'bg-white/5 border-white/10 backdrop-blur',
    },
  },
  {
    id: 'premium',
    name: 'premium',
    label: 'Premium Gold',
    isPaid: true,
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      background: 'from-gray-900 via-amber-900 to-gray-900',
      surface: 'bg-amber-500/5 border-amber-500/20',
      text: 'text-amber-50',
      accent: 'text-amber-200',
    },
    gradients: {
      hero: 'from-gray-900 via-amber-900 to-gray-900',
      card: 'bg-amber-500/5 border-amber-500/20 backdrop-blur',
    },
    fonts: {
      heading: 'font-bold tracking-wide',
      body: 'font-medium',
    },
  },
];

export function getTheme(id: ThemeType): ThemeConfig {
  return themes.find(t => t.id === id) || themes[0];
}
