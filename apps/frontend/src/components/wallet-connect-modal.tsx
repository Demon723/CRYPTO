'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Globe, Smartphone, Key } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const wallets = [
    {
      name: 'MetaMask',
      icon: Globe,
      description: 'Connect to your MetaMask wallet',
      color: 'bg-orange-500',
    },
    {
      name: 'WalletConnect',
      icon: Smartphone,
      description: 'Scan with WalletConnect',
      color: 'bg-blue-500',
    },
    {
      name: 'Coinbase Wallet',
      icon: Wallet,
      description: 'Connect to Coinbase Wallet',
      color: 'bg-blue-600',
    },
    {
      name: 'Embedded',
      icon: Key,
      description: 'Create an embedded wallet',
      color: 'bg-primary',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Synex
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="h-auto p-4 flex items-center gap-4"
              onClick={() => onConnect(wallet.name.toLowerCase().replace(' ', '-'))}
            >
              <div className={`p-2 rounded-lg ${wallet.color} text-white`}>
                <wallet.icon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-medium">{wallet.name}</p>
                <p className="text-sm text-muted-foreground">{wallet.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
