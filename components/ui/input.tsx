import * as React from 'react';
import { cn } from '@/components/ui/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300', className)}
      {...props}
    />
  )
);
Input.displayName = 'Input';
