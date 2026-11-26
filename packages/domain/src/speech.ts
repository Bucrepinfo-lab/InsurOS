import type { LanguageTag } from "./locale";

/**
 * Speak instead of type (owner 26/11/26). A customer reporting a claim, or an
 * agent in the field, may not be able to type. They tap the microphone and
 * talk; the words land in the box to check. PURE: the languages a phone can
 * write down and the screen words.
 */
export interface SpeechLanguage {
  /** BCP-47 tag for the phone's speech recognition. */
  id: string;
  native: string;
  app: LanguageTag;
}

/**
 * Kiswahili and English only: phones cannot yet write down Kikuyu, Dholuo,
 * Kalenjin or Luhya, and a button that hears nothing loses trust.
 */
export const SPEECH_LANGUAGES: SpeechLanguage[] = [
  { id: "sw-KE", native: "Kiswahili", app: "sw" },
  { id: "en-KE", native: "English", app: "en" },
];

export function speechLanguageFor(lang: LanguageTag | null | undefined): string {
  return lang === "sw" ? "sw-KE" : "en-KE";
}

export const SPEECH_WORDS = {
  tap: { en: "Tap and speak", sw: "Bonyeza uongee" },
  stop: { en: "Stop", sw: "Simamisha" },
  listening: { en: "Listening… speak clearly, close to the phone", sw: "Ninasikiliza… ongea wazi, karibu na simu" },
  speakIn: { en: "I will speak in", sw: "Nitaongea kwa" },
  none: {
    en: "Your phone cannot listen inside the app. Tap the box, then the microphone key on your keyboard, and speak.",
    sw: "Simu yako haiwezi kusikiliza ndani ya programu. Gusa kisanduku, kisha kitufe cha maikrofoni kwenye kibodi, uongee.",
  },
  denied: {
    en: "The microphone is blocked for InsurOS. Allow it in your phone settings, or use the keyboard microphone.",
    sw: "Maikrofoni imezuiwa kwa InsurOS. Iruhusu kwenye mipangilio ya simu, au tumia maikrofoni ya kibodi.",
  },
  check: { en: "Read it through and correct any wrong words before you send.", sw: "Soma tena na urekebishe maneno yasiyo sahihi kabla ya kutuma." },
  gap: {
    en: "Kikuyu, Dholuo, Kalenjin and Luhya cannot be written down by phones yet. Speak in Kiswahili or English, or mix them.",
    sw: "Simu bado haziwezi kuandika Kikuyu, Dholuo, Kalenjin wala Luhya. Ongea kwa Kiswahili au Kiingereza, au changanya.",
  },
} as const satisfies Record<string, Record<LanguageTag, string>>;

export type SpeechWordKey = keyof typeof SPEECH_WORDS;

export function speechWord(key: SpeechWordKey, lang: LanguageTag | null | undefined): string {
  return SPEECH_WORDS[key][lang === "sw" ? "sw" : "en"];
}

/** Add newly spoken words to what is already in a box, within its length limit. */
export function appendSpoken(current: string, spoken: string, maxLength: number): string {
  const words = spoken.replace(/\s+/g, " ").trim();
  if (!words) return current;
  return (current.trim() ? `${current.trimEnd()} ${words}` : words).slice(0, maxLength);
}
