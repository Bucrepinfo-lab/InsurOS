import Link from 'next/link';
import { DomainModulePage } from '@insuros/ui';
import { findStaffRole } from '@insuros/domain';
import { NewColleagueConversation, NewCustomerConversation } from '@/components/new-conversation';
import { getAuthState } from '@/lib/auth/session';
import { directoryForPrincipal } from '@/lib/messaging';

export const metadata = { title: 'New message' };
export const dynamic = 'force-dynamic';

export default async function NewMessagePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const to = params.to === 'colleague' ? 'colleague' : 'customer';
  const state = await getAuthState();
  const directory = state.status === 'active' ? await directoryForPrincipal(state.principal) : [];
  const people = directory.map((entry) => ({
    userId: entry.appointment.userId,
    name: entry.appointment.userName,
    group: entry.group,
    detail: `${findStaffRole(entry.appointment.roleId)?.name ?? 'Staff'}, ${entry.appointment.level}`
  }));
  const pill = (active: boolean) =>
    active ? 'rounded-full bg-seal px-3.5 py-1.5 text-sm font-medium text-white' : 'rounded-full border border-line bg-sheet px-3.5 py-1.5 text-sm font-medium text-dim hover:border-seal/50 hover:text-seal';
  return (
    <DomainModulePage title='New message' description='Write to a customer, who replies through a private link with no account, or to colleagues in your line of the hierarchy.'>
      <nav aria-label='Who to' className='mb-5 flex gap-2'>
        {to === 'customer' ? <span aria-current='page' className={pill(true)}>A customer</span> : <Link href='/dashboard/messages/new?to=customer' className={pill(false)}>A customer</Link>}
        {to === 'colleague' ? <span aria-current='page' className={pill(true)}>Colleagues</span> : <Link href='/dashboard/messages/new?to=colleague' className={pill(false)}>Colleagues</Link>}
      </nav>
      {to === 'customer' ? <NewCustomerConversation /> : <NewColleagueConversation people={people} />}
    </DomainModulePage>
  );
}
