/**
 * Languages and local time per country — PURE.
 *
 * Each country has its own clock and its own languages (the first is the
 * default). Customer-facing pages are offered in the country's languages
 * where a translation exists; staff screens are in English for now, and the
 * AI helper translates messages between English and Kiswahili.
 */
export type LanguageTag = "en" | "sw";

export const LANGUAGE_NAMES: Record<LanguageTag, string> = { en: "English", sw: "Kiswahili" };

export const COUNTRY_CLOCKS: Record<string, { timeZone: string; languages: LanguageTag[] }> = {
  KE: { timeZone: "Africa/Nairobi", languages: ["en", "sw"] },
  UG: { timeZone: "Africa/Kampala", languages: ["en", "sw"] },
  TZ: { timeZone: "Africa/Dar_es_Salaam", languages: ["sw", "en"] },
  RW: { timeZone: "Africa/Kigali", languages: ["en"] },
  NG: { timeZone: "Africa/Lagos", languages: ["en"] },
  GH: { timeZone: "Africa/Accra", languages: ["en"] },
  ZA: { timeZone: "Africa/Johannesburg", languages: ["en"] },
  IN: { timeZone: "Asia/Kolkata", languages: ["en"] },
  GB: { timeZone: "Europe/London", languages: ["en"] },
  US: { timeZone: "America/New_York", languages: ["en"] }
};

export const DEFAULT_COUNTRY = "KE";

export function clockFor(countryCode: string | undefined): { timeZone: string; languages: LanguageTag[] } {
  return COUNTRY_CLOCKS[(countryCode ?? DEFAULT_COUNTRY).toUpperCase()] ?? COUNTRY_CLOCKS[DEFAULT_COUNTRY]!;
}

/** Hours ahead of UTC in a time zone at a moment (e.g. Nairobi 3, Lagos 1, Kolkata 5.5). */
export function utcOffsetHours(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const local = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((local - Math.floor(at.getTime() / 60_000) * 60_000) / 900_000) / 4;
}

/** Customer-page words. Every key has every language: a test checks it. */
export const CUSTOMER_TEXT = {
  conversationTitle: { en: "Your conversation with us", sw: "Mazungumzo yako nasi" },
  lookingAfter: { en: "is looking after you.", sw: "anakuhudumia." },
  supervisorWillReply: { en: "A supervisor will pick this up and reply.", sw: "Msimamizi atalichukua na kujibu." },
  replyPromise: {
    en: "We reply within 4 hours; if your agent cannot, their supervisor will.",
    sw: "Tunajibu ndani ya saa 4; wakala wako asipoweza, msimamizi wake atajibu."
  },
  keepPage: {
    en: "We have your message. Keep this page: bookmark it or add it to your home screen. It is private to you, and the reply will appear here.",
    sw: "Tumepokea ujumbe wako. Hifadhi ukurasa huu au uuweke kwenye skrini ya simu yako. Ni wako peke yako, na jibu litaonekana hapa."
  },
  you: { en: "You", sw: "Wewe" },
  writeToUs: { en: "Write to us", sw: "Tuandikie" },
  send: { en: "Send", sw: "Tuma" },
  sending: { en: "Sending…", sw: "Inatuma…" },
  doNotShare: {
    en: "Do not share this link: anyone who has it can read this conversation. If you think someone else has it, ask your agent for a new one.",
    sw: "Usishiriki kiungo hiki: yeyote aliye nacho anaweza kusoma mazungumzo haya. Ukidhani mtu mwingine anacho, mwombe wakala wako kiungo kipya."
  },
  claimPack: { en: "Download my claim pack (PDF)", sw: "Pakua faili ya dai langu (PDF)" },
  myCover: { en: "My cover", sw: "Bima zangu" },
  hello: { en: "Hello", sw: "Habari" },
  policies: { en: "policies", sw: "bima" },
  insuredInAll: { en: "insured in all", sw: "jumla iliyowekewa bima" },
  homeScreen: { en: "Add this page to your home screen to keep it at hand.", sw: "Weka ukurasa huu kwenye skrini ya simu yako ili uupate kwa urahisi." },
  downloadCover: { en: "Download my cover (PDF)", sw: "Pakua bima zangu (PDF)" },
  reminders: { en: "Reminders", sw: "Vikumbusho" },
  askRenew: { en: "Ask your agent to renew", sw: "Mwombe wakala wako kuhuisha" },
  whatInsured: { en: "What you have insured", sw: "Ulichowekea bima" },
  noPolicies: { en: "No policies are on record yet. Your agent will add them here.", sw: "Bado hakuna bima zilizorekodiwa. Wakala wako ataziweka hapa." },
  valueInsured: { en: "Value insured", sw: "Thamani iliyowekewa bima" },
  valueToday: { en: "Estimated value today", sw: "Thamani inayokadiriwa leo" },
  premium: { en: "Premium", sw: "Ada ya bima" },
  cover: { en: "Cover", sw: "Muda wa bima" },
  reportClaim: { en: "Report a claim", sw: "Ripoti dai" },
  askPolicy: { en: "Ask about this policy", sw: "Uliza kuhusu bima hii" },
  yourClaims: { en: "Your claims", sw: "Madai yako" },
  privatePage: {
    en: "This page is private to you: anyone with the link can see it, so do not share it. Figures are as your agent recorded them; your policy schedule decides.",
    sw: "Ukurasa huu ni wako peke yako: yeyote mwenye kiungo anaweza kuuona, kwa hiyo usiushiriki. Takwimu ni kama wakala wako alivyorekodi; ratiba ya bima yako ndiyo inayoamua."
  },
  language: { en: "Lugha / Language", sw: "Lugha / Language" },
  contactTitle: { en: "Talk to your agent", sw: "Ongea na wakala wako" },
  contactIntro: {
    en: "Give your policy or claim number if you have it, and your message goes straight to the person who looks after it. We reply within 4 hours; if they cannot, their supervisor will. You will get your own private page to follow the conversation.",
    sw: "Weka nambari ya bima au ya dai kama unayo, na ujumbe wako utamfikia moja kwa moja anayeishughulikia. Tunajibu ndani ya saa 4; asipoweza, msimamizi wake atajibu. Utapata ukurasa wako binafsi wa kufuatilia mazungumzo."
  },
  yourName: { en: "Your name", sw: "Jina lako" },
  phoneOrEmail: { en: "Phone or email", sw: "Simu au barua pepe" },
  about: { en: "About", sw: "Kuhusu" },
  aClaim: { en: "A claim", sw: "Dai" },
  aPolicy: { en: "A policy", sw: "Bima" },
  somethingElse: { en: "Something else", sw: "Jambo jingine" },
  claimOrPolicyNumber: { en: "Claim or policy number", sw: "Nambari ya dai au bima" },
  message: { en: "Message", sw: "Ujumbe" },
  covered: { en: "Covered", sw: "Ina bima" },
  itemsInsured: { en: "Things insured", sw: "Vilivyowekewa bima" },
  plusOpen: { en: "My Cover Plus is free for everyone while we launch.", sw: "My Cover Plus ni bure kwa wote wakati huu wa uzinduzi." },
  plusTrial: { en: "Your free month of My Cover Plus: {n} days left, until {date}.", sw: "Mwezi wako wa bure wa My Cover Plus: siku {n} zimebaki, hadi {date}." },
  plusPaid: { en: "My Cover Plus is on for this month. Thank you.", sw: "My Cover Plus imewashwa kwa mwezi huu. Asante." },
  plusPaused: {
    en: "My Cover Plus is paused this month. {price} switches it on until the month ends; nothing is charged for months you skip.",
    sw: "My Cover Plus imesimamishwa mwezi huu. {price} inaiwasha hadi mwisho wa mwezi; hakuna malipo kwa miezi unayoruka."
  },
  plusPaySoon: { en: "Paying by M-Pesa is being switched on. Your agent will tell you when.", sw: "Malipo kwa M-Pesa yanawashwa. Wakala wako atakujulisha." },
  plusIncludes: { en: "Plus includes", sw: "Plus inajumuisha" },
  plusAlwaysFree: {
    en: "Always free: what you have insured, when cover ends, reminders, reporting a claim and talking to your agent.",
    sw: "Bure daima: ulichowekea bima, tarehe ya mwisho, vikumbusho, kuripoti dai na kuongea na wakala wako."
  },
  partOfPlus: { en: "Part of My Cover Plus", sw: "Sehemu ya My Cover Plus" },
  news: { en: "News from your agency", sw: "Habari kutoka kwa wakala wako" },
  shareTitle: { en: "Show a friend", sw: "Mwonyeshe rafiki" },
  shareBody: {
    en: "Share how easy your cover is to follow. Nothing private goes with it: no values, numbers or claims.",
    sw: "Shiriki jinsi bima yako ilivyo rahisi kufuatilia. Hakuna cha siri kinachotumwa: thamani, nambari wala madai."
  },
  share: { en: "Share", sw: "Shiriki" },
  sendWhatsApp: { en: "Send on WhatsApp", sw: "Tuma kwa WhatsApp" },
  copyLink: { en: "Copy link", sw: "Nakili kiungo" },
  copied: { en: "Link copied", sw: "Kiungo kimenakiliwa" },
  referredBy: { en: "Referred by a friend", sw: "Umependekezwa na rafiki" },
  mpesaPhone: { en: "M-Pesa phone number", sw: "Nambari ya simu ya M-Pesa" },
  payPlus: { en: "Pay {price} with M-Pesa", sw: "Lipa {price} kwa M-Pesa" },
  payPrompt: {
    en: "Check your phone and enter your M-Pesa PIN. Plus switches on once the payment is confirmed; refresh this page in a minute.",
    sw: "Angalia simu yako na uweke PIN yako ya M-Pesa. Plus itawaka malipo yakithibitishwa; onyesha upya ukurasa huu baada ya dakika moja."
  }
} as const satisfies Record<string, Record<LanguageTag, string>>;

export type CustomerTextKey = keyof typeof CUSTOMER_TEXT;

export function pickLanguage(raw: unknown, allowed: readonly LanguageTag[] = ["en", "sw"]): LanguageTag {
  return allowed.find((tag) => tag === raw) ?? allowed[0] ?? "en";
}

export function t(key: CustomerTextKey, lang: LanguageTag): string {
  return CUSTOMER_TEXT[key][lang];
}

/** The cover-ends line on the customer's page, in their language. */
export function expiryWords(status: { level: "expired" | "due-soon" | "in-force" | "unknown"; days: number | null; words: string }, lang: LanguageTag): string {
  if (lang === "en" || status.days === null) return lang === "en" ? status.words : "Tarehe ya mwisho haijarekodiwa";
  const d = Math.abs(status.days);
  if (status.level === "expired") return `Iliisha siku ${d} zilizopita`;
  if (status.days === 0) return "Leo ni siku ya mwisho ya bima";
  if (status.level === "due-soon") return `Inaisha baada ya siku ${d}`;
  return `Inaendelea kwa siku ${d} zaidi`;
}

/** A customer-page sentence with {placeholders} filled in. */
export function tf(key: CustomerTextKey, lang: LanguageTag, values: Record<string, string | number>): string {
  return t(key, lang).replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}
