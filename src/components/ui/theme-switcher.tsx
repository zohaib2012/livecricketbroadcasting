'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Palette, Crown } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative group">
      <Button variant="outline" size="icon" className="relative">
        <Palette className="h-4 w-4" />
        {theme === 'premium' && <Crown className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />}
      </Button>
      <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-slate-900 border border-white/10 rounded-lg p-2 min-w-[160px] z-50">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between hover:bg-white/10 ${theme === t.id ? 'bg-white/10' : ''}`}
          >
            <span className="flex items-center gap-2 text-white">
              {t.label}
              {t.isPaid && <Crown className="h-3 w-3 text-yellow-500" />}
            </span>
            {t.isPaid && <span className="text-xs text-yellow-500">PRO</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
