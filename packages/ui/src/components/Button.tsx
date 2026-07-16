import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const variants = {
    primary: cn(
      'bg-[linear-gradient(180deg,#22344f_0%,#1b2a41_100%)] text-paper',
      'shadow-[0_1px_2px_rgba(18,28,49,0.3),0_8px_20px_-10px_rgba(18,28,49,0.5)]',
      'hover:-translate-y-px hover:bg-[linear-gradient(180deg,#128a6b_0%,#0f6e56_100%)]',
      'hover:shadow-[0_2px_4px_rgba(15,110,86,0.25),0_10px_24px_-10px_rgba(15,110,86,0.55)]'
    ),
    secondary: cn(
      'border border-ink/15 bg-sheet/60 text-ink',
      'hover:-translate-y-px hover:border-seal/50 hover:text-seal hover:shadow-[0_6px_16px_-10px_rgba(15,110,86,0.4)]'
    ),
    ghost: 'bg-transparent text-dim hover:bg-ink/5 hover:text-ink'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
