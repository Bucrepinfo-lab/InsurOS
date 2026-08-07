'use client';
/**
 * Portable "import written notes" panel (web/React). Drop into any project.
 * - Photo → best-effort OCR (Tesseract.js from CDN), falls back to manual typing.
 * - File → text read inline; PDF/Word attach for server-side extraction in prod.
 * onApply(parsed) receives the structured guess from parseImportedNotes().
 *
 * Depends only on ./intake. Style via the `className`/`style` props or restyle inline.
 */
import { useState } from 'react';
import { parseImportedNotes, validateUpload, type ParsedNotes } from './intake';

function loadTesseract(): Promise<any> {
  const w = window as any;
  if (w.Tesseract) return Promise.resolve(w.Tesseract);
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js';
    el.onload = () => resolve((window as any).Tesseract);
    el.onerror = () => reject(new Error('offline'));
    document.head.appendChild(el);
  });
}

export function NotesImport({ onApply }: { onApply: (p: ParsedNotes) => void }) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>();

  async function onPick(file: File | undefined, kind: 'photo' | 'file') {
    if (!file) return;
    const v = validateUpload({ mime: file.type || 'application/octet-stream', size: file.size });
    if (!v.ok) { setMsg(v.error); return; }
    setFileName(file.name); setMsg(undefined);
    if (file.type === 'text/plain') { setText(await file.text()); return; }
    if (kind === 'photo' || file.type.startsWith('image/')) {
      setBusy(true);
      try {
        const T = await loadTesseract();
        const res = await T.recognize(file, 'eng');
        setText(((res?.data?.text as string) ?? '').trim());
        setMsg('Read from photo — please check the words.');
      } catch { setMsg('Could not read the photo automatically. Type the key points below.'); }
      finally { setBusy(false); }
      return;
    }
    setMsg('File attached. Type the key points below (PDF/Word text extraction runs server-side in production).');
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <label style={{ cursor: 'pointer', padding: '8px 14px', border: '1px solid #333', borderRadius: 8 }}>Take / choose photo
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0], 'photo')} />
        </label>
        <label style={{ cursor: 'pointer', padding: '8px 14px', border: '1px solid #999', borderRadius: 8 }}>Upload file (PDF/Word/text)
          <input type="file" accept=".pdf,.doc,.docx,.txt,image/*" style={{ display: 'none' }} onChange={(e) => onPick(e.target.files?.[0], 'file')} />
        </label>
        {fileName && <span style={{ alignSelf: 'center', fontSize: 12, color: '#666' }}>{fileName}</span>}
      </div>
      {busy && <p style={{ fontSize: 13, color: '#666' }}>Reading your notes… (first run downloads the reader)</p>}
      {msg && <p style={{ fontSize: 13, color: '#666' }}>{msg}</p>}
      <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', minHeight: 130, marginTop: 12, boxSizing: 'border-box' }}
        placeholder={'Present: Amina, Grace\nAgenda 1: Purchase of chairs\nResolved that we buy 20 chairs'} />
      <button onClick={() => onApply(parseImportedNotes(text))} style={{ marginTop: 10, padding: '10px 18px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer' }}>Use these notes</button>
    </div>
  );
}
