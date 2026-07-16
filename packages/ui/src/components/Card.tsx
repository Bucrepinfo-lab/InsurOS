import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-sheet',
        'shadow-[0_1px_2px_rgba(18,28,49,0.04),0_12px_32px_-20px_rgba(18,28,49,0.25)]',
        'transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(18,28,49,0.05),0_20px_44px_-20px_rgba(18,28,49,0.32)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-line px-6 py-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-lg text-ink', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}
