import * as React from 'react';

import { cn } from '@/lib/utils';

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & { variant?: 'default' | 'secondary' | 'outline' | 'destructive' }) {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80',
    outline: 'text-foreground',
  };

  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium w-fit transition-colors',
        variants[variant || 'default'],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
