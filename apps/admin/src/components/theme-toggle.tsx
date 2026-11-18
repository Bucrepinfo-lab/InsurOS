'use client';

import { useSyncExternalStore } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';
const KEY = 'insuros-theme';
const CHOICES: { value: ThemeChoice; label: string; title: string }[] = [
  { value: 'light', label: 'Light', title: 'Light theme' },
  { value: 'dark', label: 'Dark', title: 'Dark theme' },
  { value: 'system', label: 'Auto', title: 'Follow this phone or computer' }
];

/**
 * Runs before the page paints (see the root layout), so a dark choice never
 * flashes light. Kept as a string because it is inlined in <head>.
 */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem('${KEY}');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'system'}catch(e){document.documentElement.dataset.theme='system'}`;

const listeners = new Set<() => void>();
function read(): ThemeChoice {
  const value = document.documentElement.dataset.theme;
  return value === 'light' || value === 'dark' ? value : 'system';
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function choose(choice: ThemeChoice) {
  document.documentElement.dataset.theme = choice;
  try {
    if (choice === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // Private windows can refuse storage: the choice still holds for this visit.
  }
  listeners.forEach((listener) => listener());
}

/** Light, Dark or Auto. Remembered on this device only. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const current = useSyncExternalStore(subscribe, read, () => 'system' as ThemeChoice);
  return (
    <div role='group' aria-label='Theme' className={`inline-flex rounded-lg border border-line bg-sheet p-0.5 text-xs ${className}`}>
      {CHOICES.map((choice) => (
        <button
          key={choice.value}
          type='button'
          title={choice.title}
          aria-pressed={current === choice.value}
          onClick={() => choose(choice.value)}
          className={`rounded-md px-2.5 py-1 font-medium transition ${
            current === choice.value ? 'bg-seal text-white' : 'text-dim hover:text-ink'
          } focus-visible:outline-2 focus-visible:outline-seal`}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
