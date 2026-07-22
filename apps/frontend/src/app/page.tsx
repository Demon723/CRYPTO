'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  Brain,
  Shield,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Zap,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Chat Assistant',
    description: 'Get instant insights about your portfolio, transactions, and market trends powered by advanced AI.',
  },
  {
    icon: Wallet,
    title: 'Multi-Wallet Support',
    description: 'Connect MetaMask, WalletConnect, and multiple wallets across Ethereum, Polygon, BSC, and more.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Analytics',
    description: 'Track your assets, analyze performance, and visualize profit/loss with beautiful charts.',
  },
  {
    icon: Shield,
    title: 'Smart Contract Analyzer',
    description: 'Analyze smart contracts for risks, ownership, and security vulnerabilities before interacting.',
  },
  {
    icon: TrendingUp,
    title: 'Token Research',
    description: 'Research tokens, check liquidity, holder distribution, and scam detection with AI-powered analysis.',
  },
  {
    icon: Zap,
    title: 'Real-Time Alerts',
    description: 'Set up price alerts, whale tracking, and security notifications to stay ahead of the market.',
  },
];

const stats = [
  { label: 'Active Users', value: '50K+' },
  { label: 'Wallets Tracked', value: '200K+' },
  { label: 'Transactions Analyzed', value: '10M+' },
  { label: 'AI Queries', value: '5M+' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Synex</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10" />
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-4 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300">
                <Zap className="h-4 w-4" />
                AI-Powered Crypto Intelligence
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Your Crypto{' '}
                <span className="gradient-text">Operating System</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                Track assets, analyze transactions, chat with AI, and manage your crypto portfolio with the most advanced crypto intelligence platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage, analyze, and grow your crypto portfolio in one platform.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>
              <TabsContent value="features" className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="security" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { title: 'SOC 2 Compliant', desc: 'Enterprise-grade security and compliance standards.' },
                    { title: 'End-to-End Encryption', desc: 'All data encrypted at rest and in transit.' },
                    { title: 'Non-Custodial', desc: 'We never hold your private keys or funds.' },
                    { title: 'Regular Audits', desc: 'Third-party security audits and penetration testing.' },
                  ].map((item, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-accent" />
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{item.desc}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="integration" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { title: 'Multi-Chain Support', desc: 'Ethereum, Polygon, BSC, Arbitrum, Base, Avalanche, and LXON.' },
                    { title: 'Wallet Integration', desc: 'MetaMask, WalletConnect, Coinbase Wallet.' },
                    { title: 'API Access', desc: 'RESTful APIs for developers and bots.' },
                    { title: 'Third-Party Tools', desc: 'Integrations with DEXes, aggregators, and analytics.' },
                  ].map((item, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{item.desc}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of users who are already using Synex to manage their crypto portfolios.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p> Synex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
