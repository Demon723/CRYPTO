import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/toast-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Synex - AI-Powered Crypto Operating System',
    template: '%s | Synex',
  },
  description: 'Track assets, analyze transactions, chat with AI, and manage your crypto portfolio with Synex.',
  keywords: ['crypto', 'AI', 'blockchain', 'portfolio', 'wallet', 'trading', 'DeFi'],
  authors: [{ name: 'Synex Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://synex.ai',
    siteName: 'Synex',
    title: 'Synex - AI-Powered Crypto Operating System',
    description: 'Track assets, analyze transactions, chat with AI, and manage your crypto portfolio with Synex.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
