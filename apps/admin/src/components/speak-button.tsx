'use client';

/**
 * Tap to speak (owner 26/11/26): for a customer or agent who cannot type. The
 * words go into the named box of the same form (`field`), where they can still
 * be corrected by hand; nothing is sent by speaking. Uses the phone's own
 * speech recognition (Chrome on Android and the Play app). Where the phone
 * cannot listen inside the app, the person is told to use the keyboard's
 * microphone key. The chosen language is kept on the phone.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { SPEECH_LANGUAGES, appendSpoken, speechLanguageFor, speechWord, type LanguageTag } from '@insuros/domain';

type Recogniser = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

function recogniser(): (new () => Recogniser) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recogniser; webkitSpeechRecognition?: new () => Recogniser };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const KEY = 'insuros.speechLanguage';
const EVENT = 'insuros-speech-language';

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function stored(): string {
  try {
    const value = window.localStorage.getItem(KEY);
    return value && SPEECH_LANGUAGES.some((l) => l.id === value) ? value : '';
  } catch {
    return '';
  }
}

export function saveSpeechLanguage(id: string) {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    // Private mode: the choice lasts for this page.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** The language the person speaks in: their own choice, else the page's language. */
export function useSpeechLanguage(pageLang: LanguageTag = 'en'): string {
  const chosen = useSyncExternalStore(subscribe, stored, () => '');
  return chosen || speechLanguageFor(pageLang);
}

export function SpeechLanguageChips({ lang = 'en' }: { lang?: LanguageTag }) {
  const current = useSpeechLanguage(lang);
  const words: LanguageTag = SPEECH_LANGUAGES.find((l) => l.id === current)?.app ?? 'en';
  return (
    <div className='flex flex-wrap items-center gap-2' role='radiogroup' aria-label={speechWord('speakIn', words)}>
      <span className='text-sm text-dim'>{speechWord('speakIn', words)}</span>
      {SPEECH_LANGUAGES.map((l) => (
        <button
          key={l.id}
          type='button'
          role='radio'
          aria-checked={current === l.id}
          onClick={() => saveSpeechLanguage(l.id)}
          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${current === l.id ? 'border-seal bg-seal text-white' : 'border-line bg-sheet text-ink'}`}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}

export function SpeakButton({ field, lang = 'en', maxLength = 2000, showLanguages = false }: { field: string; lang?: LanguageTag; maxLength?: number; showLanguages?: boolean }) {
  const language = useSpeechLanguage(lang);
  const words: LanguageTag = SPEECH_LANGUAGES.find((l) => l.id === language)?.app ?? 'en';
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const rec = useRef<Recogniser | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => () => rec.current?.stop(), []);

  function add(spoken: string) {
    const form = root.current?.closest('form');
    const el = form?.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    const next = appendSpoken(el.value, spoken, maxLength);
    // Through the native setter, so boxes React keeps in state hear the change.
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, next);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function start() {
    const R = recogniser();
    if (!R) {
      setUnsupported(true);
      return;
    }
    const r = new R();
    r.lang = language;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]!;
        if (res.isFinal) add(res[0].transcript);
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setNote(speechWord('denied', words));
      else if (e.error === 'language-not-supported') setNote(speechWord('none', words));
    };
    r.onend = () => {
      setListening(false);
      setInterim('');
      setNote((current) => current ?? speechWord('check', words));
    };
    try {
      r.start();
      rec.current = r;
      setListening(true);
      setNote(null);
    } catch {
      setNote(speechWord('none', words));
    }
  }

  return (
    <div ref={root} className='grid justify-items-start gap-1.5'>
      {showLanguages ? <SpeechLanguageChips lang={lang} /> : null}
      {!unsupported ? (
        <button
          type='button'
          aria-pressed={listening}
          onClick={() => (listening ? rec.current?.stop() : start())}
          className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal ${listening ? 'border-red-700 bg-red-700 text-white' : 'border-seal bg-sheet text-seal'}`}
        >
          <svg viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
            <rect x='9' y='3' width='6' height='11' rx='3' fill='currentColor' />
            <path d='M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
          </svg>
          {speechWord(listening ? 'stop' : 'tap', words)}
        </button>
      ) : null}
      {listening ? (
        <p className='text-sm text-ink' role='status'>
          {speechWord('listening', words)}
          {interim ? ` — “${interim}”` : ''}
        </p>
      ) : null}
      {note || unsupported ? (
        <p className='text-xs text-dim' role='status'>
          {note ?? speechWord('none', words)}
        </p>
      ) : null}
    </div>
  );
}
