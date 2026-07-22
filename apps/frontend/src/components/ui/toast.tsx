'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { toast as hotToast } from 'react-hot-toast';

import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Toast({
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
  VariantProps<typeof toastVariants>) {
  return (
    <ToastPrimitive.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      className={cn('text-sm font-semibold [&+div]:text-xs', className)}
      {...props}
    />
  );
}

function ToastDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  );
}

function ToastClose({ className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus:opacity-100 focus:outline-none',
        className,
      )}
      {...props}
    />
  );
}

export { Toast, ToastTitle, ToastDescription, ToastClose, toastVariants };

export function toast(options: { title?: string; description?: string; variant?: 'default' | 'destructive' }) {
  const message = options.description || options.title || '';
  return hotToast.custom(
    (t) =>
      message ? (
        <div
          className={cn(
            toastVariants({ variant: options.variant }),
            t.visible ? 'animate-in slide-in-from-top-full' : 'animate-out slide-out-to-right-full'
          )}
        >
          {options.title && <div className="text-sm font-semibold">{options.title}</div>}
          {options.description && <div className="text-sm opacity-90">{options.description}</div>}
        </div>
      ) : null,
    { duration: 4000 }
  );
}

export { Toaster } from 'react-hot-toast';
