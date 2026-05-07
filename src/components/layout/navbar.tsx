'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Users, Target, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

const navLinks = [
  { href: '/', label: 'Home', icon: Target },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/matches/live', label: 'Live Matches', icon: Target },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  const isScorer = session?.user?.role === 'SCORER';

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <span className="text-xl font-black text-white">C</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                CricLive
              </span>
              <span className="hidden sm:block text-[10px] text-muted-foreground -mt-1">
                Live Broadcasting
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

           <div className="flex items-center gap-3">
             <ThemeSwitcher />
             {status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                {isScorer && (
                  <Link href="/scorer/dashboard">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      <Target className="w-4 h-4 mr-2" />
                      Scorer
                    </Button>
                  </Link>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={(session.user as any).photo} />
                    <AvatarFallback name={session.user.name || 'U'} />
                  </Avatar>
                  <span className="text-sm font-medium">{session.user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              status !== 'loading' && (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-slide-in">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
            {isScorer && (
              <Link
                href="/scorer/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
              >
                <Target className="w-5 h-5" />
                Scorer Panel
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
