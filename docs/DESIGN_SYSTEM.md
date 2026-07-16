# InsurOS Design System — "The Underwriter's Ledger"

**Adopted:** 2026-07-16 · This is the binding aesthetic direction for every InsurOS surface. Evolve it only deliberately, and record changes here.

## Concept

The credibility of a classical insurance ledger, reborn digital. Insurance sells a promise, so the interface must read like a document you can trust: warm paper ground, ink-navy structure, one authoritative seal green for what is compliant/approved/go, and monospaced figures wherever money or references appear — exactness as an aesthetic. Deliberately a light theme (Telpen's system is dark; the two products must never blur).

## Tokens (defined in `apps/admin/src/app/globals.css` via Tailwind v4 `@theme`)

```text
Ground     --color-paper #F6F4EE   page background
Surface    --color-sheet #FFFDF9   cards, tables, topbar
Hairline   --color-line  #E5E1D6
Structure  --color-ink   #1B2A41   sidebar, primary text, primary button
Support    --color-dim   #5B6B7F   secondary text · --color-faint #939DAB hints
Signal     --color-seal  #0F6E56   compliant / approved / brand accent
           --color-sealdark #07423A · --color-sealsoft #E3F2EA
Statutory  --color-warnink #8A5410 / --color-warnsoft #F8ECD7
           --color-dangerink #A32D2D / --color-dangersoft #FBEAEA
```

## Typography (loaded via `next/font` in the root layout)

Fraunces (display — headings, card titles, banner headlines; `font-display`), Onest (body; default on `body`), Spline Sans Mono (KPI values, money, policy/claim references; `font-mono`). Never Arial, Inter, Roboto, or system defaults.

## Component rules

Sidebar is ink-dark with a seal small-caps eyebrow and a seal left-rule on the active item. KPI cards carry a seal tick rule, small-caps label, and a mono figure. Tables use small-caps hairline headers and paper hover rows. Badges are soft-tinted small caps (neutral/success/warning/danger only). Buttons: primary ink→seal on hover; secondary hairline outline. Marketing banners live on sealsoft with a Fraunces headline. Page content enters with one `animate-rise` reveal (reduced-motion honoured) — one orchestrated moment, no scattered micro-motion.

## Voice pairing

The system pairs with the CRM content voice: merits stated as engineered facts ("Claims paid in hours, not weeks"), reasons always attached, sentence case, no exclamation marks.
