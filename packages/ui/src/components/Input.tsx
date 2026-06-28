import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none',
        'focus:border-slate-900 focus:ring-2 focus:ring-slate-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
