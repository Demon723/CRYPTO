'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Shield, Zap } from 'lucide-react';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingFlow({ isOpen, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Synex',
      description: 'Your AI-powered crypto operating system',
      icon: Zap,
      content: (
        <div className="text-center space-y-4">
          <Zap className="h-16 w-16 text-primary mx-auto" />
          <p className="text-muted-foreground">
            Track assets, analyze transactions, chat with AI, and manage your crypto portfolio.
          </p>
        </div>
      ),
    },
    {
      title: 'Connect Your Wallet',
      description: 'Link your wallets to get started',
      icon: Wallet,
      content: (
        <div className="text-center space-y-4">
          <Wallet className="h-16 w-16 text-primary mx-auto" />
          <p className="text-muted-foreground">
            Connect MetaMask, WalletConnect, or create an embedded wallet.
          </p>
        </div>
      ),
    },
    {
      title: 'Track Your Portfolio',
      description: 'Monitor your assets in real-time',
      icon: TrendingUp,
      content: (
        <div className="text-center space-y-4">
          <TrendingUp className="h-16 w-16 text-primary mx-auto" />
          <p className="text-muted-foreground">
            View balances, track performance, and analyze your portfolio.
          </p>
        </div>
      ),
    },
    {
      title: 'Stay Secure',
      description: 'Advanced security features',
      icon: Shield,
      content: (
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-primary mx-auto" />
          <p className="text-muted-foreground">
            Smart contract analysis, scam detection, and risk scoring.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {currentStep.content}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
