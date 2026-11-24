'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { t, type LanguageTag } from '@insuros/domain';

/**
 * Review before sending (owner 24/11/26). Wrap any form: when its send button
 * is pressed, nothing is sent yet; the person first sees exactly what they
 * typed and the files they chose (pictures shown small), then either goes
 * back to edit or confirms. Confirming submits the same form, so every
 * server-side check still runs.
 *
 * Works with server-action forms and onSubmit forms alike, because it holds
 * back the click on the send button rather than the submit event. A form the
 * browser finds incomplete is left to the browser's own messages. A button
 * marked data-no-review sends straight away (e.g. "Remove").
 */

interface Line {
  label: string;
  value?: string;
  files?: { name: string; size: string; preview?: string }[];
}

const size = (bytes: number) => (bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function labelFor(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const own = el.labels?.[0];
  if (own) {
    // The label's own words only: not the field inside it, and not a hint under it.
    const direct = Array.from(own.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (direct) return direct;
    const copy = own.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('input, textarea, select, option').forEach((node) => node.remove());
    const words = copy.textContent?.replace(/\s+/g, ' ').trim();
    if (words) return words;
  }
  return el.getAttribute('aria-label') ?? el.getAttribute('placeholder') ?? el.name;
}

/** The question a group of choices answers (its fieldset legend), if any. */
function groupLabel(el: HTMLElement): string | null {
  return el.closest('fieldset')?.querySelector('legend')?.textContent?.replace(/\s+/g, ' ').trim() || null;
}

function isShown(el: HTMLElement): boolean {
  if (el.getAttribute('aria-hidden') === 'true' || el.tabIndex === -1) return false;
  return el.getClientRects().length > 0;
}

/** What the form would send, in the words on the screen. */
export function summarise(form: HTMLFormElement): Line[] {
  const lines: Line[] = [];
  const seenRadio = new Set<string>();
  for (const node of Array.from(form.elements)) {
    if (!(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement)) continue;
    if (!node.name || node.disabled) continue;
    if (node instanceof HTMLInputElement && ['hidden', 'submit', 'button', 'reset'].includes(node.type)) continue;
    if (!isShown(node)) continue;
    const label = labelFor(node);
    if (node instanceof HTMLSelectElement) {
      const chosen = Array.from(node.selectedOptions).map((option) => option.textContent?.trim()).filter(Boolean).join(', ');
      if (chosen) lines.push({ label, value: chosen });
    } else if (node instanceof HTMLInputElement && node.type === 'file') {
      const files = Array.from(node.files ?? []).map((file) => ({
        name: file.name,
        size: size(file.size),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
      if (files.length) lines.push({ label, files });
    } else if (node instanceof HTMLInputElement && node.type === 'checkbox') {
      if (node.checked) lines.push({ label: groupLabel(node) ?? label, value: groupLabel(node) ? label : '✓' });
    } else if (node instanceof HTMLInputElement && node.type === 'radio') {
      if (node.checked && !seenRadio.has(node.name)) {
        seenRadio.add(node.name);
        lines.push({ label: groupLabel(node) ?? node.name, value: label });
      }
    } else if (node instanceof HTMLInputElement && node.type === 'password') {
      if (node.value) lines.push({ label, value: '•'.repeat(node.value.length) });
    } else if (node.value.trim()) {
      lines.push({ label, value: node.value.trim() });
    }
  }
  return lines;
}

export function ReviewBeforeSend({ children, lang = 'en' }: { children: ReactNode; lang?: LanguageTag }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const confirmed = useRef(false);
  const pending = useRef<{ form: HTMLFormElement; button: HTMLElement } | null>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const [review, setReview] = useState<{ lines: Line[]; send: string } | null>(null);

  useEffect(() => {
    const root = wrapper.current;
    if (!root) return;
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest('button, input[type="submit"]') as HTMLButtonElement | HTMLInputElement | null;
      if (!button || !root.contains(button)) return;
      const isSubmit = button instanceof HTMLButtonElement ? button.type === 'submit' : true;
      const form = button.form;
      if (!isSubmit || !form || button.hasAttribute('data-no-review')) return;
      if (confirmed.current) {
        confirmed.current = false;
        return;
      }
      if (!form.checkValidity()) return; // the browser shows what is missing
      event.preventDefault();
      event.stopPropagation();
      pending.current = { form, button };
      const send = (button instanceof HTMLButtonElement ? button.textContent : button.value)?.trim() || t('send', lang);
      setReview({ lines: summarise(form), send });
    };
    root.addEventListener('click', onClick, true);
    return () => root.removeEventListener('click', onClick, true);
  }, [lang]);

  useEffect(() => {
    if (!review) return;
    confirmButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setReview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [review]);

  function close() {
    review?.lines.forEach((line) => line.files?.forEach((file) => file.preview && URL.revokeObjectURL(file.preview)));
    setReview(null);
  }

  function send() {
    const target = pending.current;
    close();
    if (!target) return;
    confirmed.current = true;
    target.form.requestSubmit(target.button instanceof HTMLButtonElement || target.button instanceof HTMLInputElement ? target.button : undefined);
    confirmed.current = false;
  }

  return (
    <div ref={wrapper}>
      {children}
      {review ? (
        <div className='fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4' onClick={close}>
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='review-title'
            lang={lang}
            onClick={(event) => event.stopPropagation()}
            className='max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-sheet p-5 shadow-xl sm:max-w-lg sm:rounded-2xl'
          >
            <h2 id='review-title' className='font-display text-[20px] text-ink'>{t('reviewTitle', lang)}</h2>
            <p className='mt-1 text-sm text-dim'>{t('reviewHint', lang)}</p>
            <dl className='mt-4 grid gap-3'>
              {review.lines.map((line, index) => (
                <div key={`${line.label}-${index}`} className='rounded-xl border border-line bg-paper px-3.5 py-2.5'>
                  <dt className='text-xs font-medium uppercase tracking-wide text-dim'>{line.label}</dt>
                  {line.value !== undefined ? <dd className='mt-1 whitespace-pre-wrap break-words text-[15px] text-ink'>{line.value}</dd> : null}
                  {line.files ? (
                    <dd className='mt-2 grid gap-2'>
                      {line.files.map((file) => (
                        <div key={file.name} className='flex items-center gap-3'>
                          {file.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={file.preview} alt='' className='h-14 w-14 rounded-lg border border-line object-cover' />
                          ) : (
                            <span aria-hidden='true' className='grid h-14 w-14 place-items-center rounded-lg border border-line text-xs text-dim'>
                              {file.name.split('.').pop()?.toUpperCase()}
                            </span>
                          )}
                          <span className='text-sm text-ink'>
                            {file.name} <span className='text-dim'>({file.size})</span>
                          </span>
                        </div>
                      ))}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
            <div className='mt-5 flex flex-wrap justify-end gap-3'>
              <button type='button' onClick={close} className='rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink hover:border-seal/50 hover:text-seal'>
                {t('reviewEdit', lang)}
              </button>
              <button ref={confirmButton} type='button' onClick={send} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark'>
                {review.send}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
