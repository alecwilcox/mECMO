import * as React from 'react';
import { cn } from '@/components/ui/utils';

type Variant = 'default' | 'secondary' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors';
    const variants: Record<Variant, string> = {
      default: 'bg-black text-white hover:opacity-90',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    };
    return (
      <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
    );
  }
);
Button.displayName = 'Button';
