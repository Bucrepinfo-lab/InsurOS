import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-ink text-paper hover:bg-seal',
    secondary:
      'border border-ink/15 bg-transparent text-ink hover:border-seal hover:text-seal',
    ghost: 'bg-transparent text-dim hover:bg-ink/5 hover:text-ink'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
