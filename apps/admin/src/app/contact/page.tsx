import { CUSTOMER_REPLY_HOURS } from '@insuros/domain';
import { ContactForm } from './contact-form';

export const metadata = { title: 'Contact your agent' };

/** Public: a customer with no link reaches the agent or claims officer who owns their matter. */
export default function ContactPage() {
  return (
    <main className='min-h-screen bg-paper px-4 py-8 sm:py-12'>
      <div className='mx-auto grid max-w-xl gap-5'>
        <header>
          <h1 className='font-display text-[30px] leading-tight text-ink'>Talk to your agent</h1>
          <p className='mt-2 text-[15px] text-ink'>
            Give your policy or claim number if you have it, and your message goes straight to the person who looks after it. We reply within{' '}
            {CUSTOMER_REPLY_HOURS} hours; if they cannot, their supervisor will. You will get your own private page to follow the conversation.
          </p>
        </header>
        <ContactForm />
      </div>
    </main>
  );
}
