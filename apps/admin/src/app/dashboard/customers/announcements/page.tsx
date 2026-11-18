import { formatDate } from '@insuros/ui';
import { hasPermission } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { AnnouncementForm, TakeDown } from '@/components/announcement-forms';
import { getAuthState } from '@/lib/auth/session';

export const metadata = { title: 'News for customers' };
export const dynamic = 'force-dynamic';

/** News and offers on every customer's own page (part of My Cover Plus). */
export default async function AnnouncementsPage() {
  const state = await getAuthState();
  const canPost = state.status === 'active' && hasPermission(state.principal.permissions, 'Operations', 'Create');
  const posts = (await getPersistence().marketingContent.findAll())
    .filter((item) => item.placement === 'CustomerHome' && item.status !== 'Archived')
    .sort((a, b) => (b.startsAt ?? '').localeCompare(a.startsAt ?? ''));
  return (
    <div className='grid max-w-3xl gap-6'>
      <header>
        <h1 className='text-[28px] leading-tight text-ink'>News for customers</h1>
        <p className='mt-1 max-w-2xl text-sm text-dim'>
          What you post here shows on every customer&#8217;s own page under &#8220;News from your agency&#8221;: renewal offers, new covers, office hours.
          Keep it short and plain. Never put one customer&#8217;s details in a post.
        </p>
      </header>
      {canPost ? (
        <AnnouncementForm />
      ) : (
        <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>Posting news is for operations leads. Ask yours to post it.</p>
      )}
      <section aria-labelledby='live' className='grid gap-3'>
        <h2 id='live' className='text-[20px] text-ink'>Showing now</h2>
        {posts.length === 0 ? (
          <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-dim'>Nothing yet. Your first post appears here and on customers&#8217; pages.</p>
        ) : (
          <ul className='grid gap-3'>
            {posts.map((post) => (
              <li key={post.id} className='grid gap-1 rounded-2xl border border-line bg-sheet p-5'>
                <p className='font-display text-[18px] text-ink'>{post.headline}</p>
                <p className='whitespace-pre-wrap text-sm text-ink'>{post.body}</p>
                <p className='text-xs text-dim'>
                  Posted {post.startsAt ? formatDate(post.startsAt) : ''}
                  {post.endsAt ? `, shows until ${formatDate(post.endsAt)}` : ''}
                </p>
                {canPost ? <div className='pt-1'><TakeDown id={post.id} /></div> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
