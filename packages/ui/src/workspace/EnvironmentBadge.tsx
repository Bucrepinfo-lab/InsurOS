import { Badge } from '../components/Badge';

export interface EnvironmentBadgeProps {
  environment: 'local' | 'development' | 'staging' | 'production';
}

export function EnvironmentBadge({ environment }: EnvironmentBadgeProps) {
  const tone = environment === 'production' ? 'danger' : environment === 'staging' ? 'warning' : 'neutral';

  return <Badge tone={tone}>{environment}</Badge>;
}
