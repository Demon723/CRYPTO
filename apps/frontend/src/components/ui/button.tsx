import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

const buttonVariants = [
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  'h-9 px-4 py-2 has-[>svg]:px-3',
  'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
  'focus-visible:ring-primary/50 dark:focus-visible:ring-primary/40',
].join(' ');

const outlineVariants = [
  'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
].join(' ');

const ghostVariants = [
  'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
].join(' ');

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const variantClasses = variant === 'outline' ? outlineVariants : variant === 'ghost' ? ghostVariants : buttonVariants;

    return (
      <Comp
        className={cn(buttonVariants, variantClasses, className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
