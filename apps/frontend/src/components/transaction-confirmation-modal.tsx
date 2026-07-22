'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface TransactionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  preview: {
    action: string;
    amount?: string;
    to?: string;
    estimatedGas: string;
  };
}

export function TransactionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  preview,
}: TransactionConfirmationModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setStatus('idle');

    try {
      await onConfirm();
      setStatus('success');
      // Simulate transaction hash
      setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    } catch (error) {
      setStatus('error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setTxHash(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Transaction</DialogTitle>
          <DialogDescription>
            Review the transaction details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Action</span>
              <span className="font-medium capitalize">{preview.action}</span>
            </div>
            {preview.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono">{preview.amount}</span>
              </div>
            )}
            {preview.to && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-xs">{preview.to}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Gas</span>
              <span className="font-mono">{preview.estimatedGas}</span>
            </div>
          </div>

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-800">Transaction Submitted</span>
              </div>
              {txHash && (
                <p className="text-sm text-green-700 mt-2 font-mono break-all">{txHash}</p>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-800">Transaction Failed</span>
              </div>
              <p className="text-sm text-red-700 mt-2">
                The transaction could not be processed. Please try again.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isConfirming}>
            {status === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {status !== 'success' && (
            <Button onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
