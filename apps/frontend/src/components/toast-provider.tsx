'use client';

import { Toaster, toast as hotToast } from 'react-hot-toast';
import { toastVariants } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      if (!title && !description) return;
      return hotToast.custom(
        (t) =>
          title || description ? (
            <div
              className={cn(
                toastVariants({ variant }),
                t.visible ? 'animate-in slide-in-from-top-full' : 'animate-out slide-out-to-right-full'
              )}
            >
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && <div className="text-sm opacity-90">{description}</div>}
            </div>
          ) : null,
        { duration: 4000 }
      );
    },
  };
}
