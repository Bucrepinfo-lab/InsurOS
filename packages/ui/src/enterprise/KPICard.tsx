import type { ReactNode } from 'react';
import { Card, CardContent } from '../components/Card';
import { cn } from '../utils/cn';

export interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  className?: string;
}

export function KPICard({ title, value, change, trend = 'neutral', icon, className }: KPICardProps) {
  const trendClass = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-500'
  };

  return (
    <Card className={className}>
      <CardContent>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-sm font-medium text-slate-500'>{title}</p>
            <p className='mt-2 text-2xl font-semibold text-slate-950'>{value}</p>
            {change ? (
              <p className={cn('mt-2 text-sm font-medium', trendClass[trend])}>{change}</p>
            ) : null}
          </div>
          {icon ? <div className='text-slate-400'>{icon}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
