# OCR / note-import tools (dropped in by Claude)

Photo-or-file → structured, editable data. Self-contained; wire into this project's
forms when ready. Nothing else in the repo was modified.

## Production note (keep in your docs)
> In production the photo/file OCR should upload to DigitalOcean Spaces with a
> server-side OCR / text-extraction step. The client gracefully falls back to
> manual typing when offline, so a user is never blocked.

## Files
- `intake.ts` — pure parser `parseImportedNotes(text)` + `validateUpload` (type + 15 MB).
- `NotesImport.web.tsx` — React panel (Tesseract.js OCR from CDN + file + review box).
- `NotesImport.native.tsx` — Expo panel (expo-image-picker + expo-document-picker).

## Wire it (per this project's domain)
1. Move `intake.ts` into your shared/core/lib package; import `NotesImport` in the
   relevant capture form; map the parsed result to this project's fields in `onApply`.
2. Restyle `NotesImport` to this project's design system.
3. Mobile: add deps `expo-image-picker`, `expo-document-picker`.
4. Add the DigitalOcean Spaces upload + server OCR step for production.

## Lock checklist
- [ ] Tools wired with domain field mapping (web + mobile).
- [ ] Production OCR/Spaces note in README/PRD.
- [ ] Phone inputs use per-country limits (reuse Stawi's PHONE_RULES) if applicable.
- [ ] Tests/typecheck/build green on this repo's toolchain.
- [ ] Status set to "LOCKED — ready for DigitalOcean deployment"; commit + push.
