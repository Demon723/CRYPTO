'use client';

import { useState, useEffect } from 'react';
import { OnboardingFlow } from '@/components/onboarding-flow';
import { synexWebSocket } from '@/lib/websocket';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
  TrendingUp,
  Search,
  Zap,
  Gift,
  Vote,
  Coins,
  Key,
  Globe,
  ChevronRight,
  Rocket,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
  { name: 'Transactions', href: '/transactions', icon: Globe },
  { name: 'AI Assistant', href: '/ai', icon: MessageSquare },
  { name: 'Token Research', href: '/tokens', icon: Search },
  { name: 'Smart Contracts', href: '/scanner', icon: Shield },
  { name: 'NFTs', href: '/nfts', icon: TrendingUp },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Staking', href: '/staking', icon: Coins },
  { name: 'Deployments', href: '/deployments', icon: Rocket },
  { name: 'Governance', href: '/governance', icon: Vote },
  { name: 'API Keys', href: '/api', icon: Key },
  { name: 'Referrals', href: '/referrals', icon: Gift },
  { name: 'Subscription', href: '/subscription', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const onboardingComplete = localStorage.getItem('onboardingComplete');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [router]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Synex</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          <div className="px-3 py-2">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold hidden md:block">
              {navigation.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
