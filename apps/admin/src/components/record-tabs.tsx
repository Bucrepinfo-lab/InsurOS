import Link from 'next/link';
import { Tabs as BaseTabs, type TabsProps } from '@insuros/ui';

/** Record tabs that switch through the router (no full page reload). */
export function Tabs(props: Omit<TabsProps, 'LinkComponent'>) {
  return <BaseTabs {...props} LinkComponent={Link} />;
}
