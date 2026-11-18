'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PHOTO_GUIDES, clarify, type ClaimKind } from '@insuros/domain';

const VIEW_MAX_SIDE = 1600;

/** Make the clear viewing copy on this device: resize, brighten and sharpen. The original is not touched. */
async function makeClearCopy(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, VIEW_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('no canvas');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const image = context.getImageData(0, 0, width, height);
  image.data.set(clarify(image.data, width, height));
  context.putImageData(image, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('no blob'))), 'image/jpeg', 0.85));
}

type Where = { latitude: number; longitude: number; accuracy: number } | null;

export interface ExistingPhoto {
  slot: string;
  viewUrl: string | null;
  onTheSpot: boolean;
}

/**
 * Guided claim photos: up to ten shots, each taken with the phone's camera or
 * picked from the gallery. Each is sent as the untouched original (the
 * evidence) plus a clear copy made on this device for easy viewing.
 */
export function ClaimPhotoCapture({
  endpoint,
  fields,
  initialKind = 'motor',
  existing
}: {
  endpoint: string;
  fields: Record<string, string>;
  initialKind?: ClaimKind;
  existing: ExistingPhoto[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<ClaimKind>(initialKind);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, { clear: string; original: string }>>({});
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({});
  const [where, setWhere] = useState<Where>(null);
  const [whereNote, setWhereNote] = useState<string | null>(null);

  const done = new Map(existing.map((photo) => [photo.slot, photo]));

  function addLocation() {
    if (!('geolocation' in navigator)) return setWhereNote('This phone cannot share its location here.');
    setWhereNote('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setWhere({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
        setWhereNote(`Location added (within about ${Math.round(position.coords.accuracy)} m). It is attached to the photos you send next.`);
      },
      () => setWhereNote('Location was not shared. The photos still go; they are just a little weaker as evidence.'),
      { enableHighAccuracy: true, timeout: 15_000 }
    );
  }

  async function send(slot: string, file: File | undefined) {
    if (!file) return;
    setBusy(slot);
    setNotes((current) => ({ ...current, [slot]: 'Making the clear copy…' }));
    try {
      const clear = await makeClearCopy(file);
      setPreviews((current) => ({ ...current, [slot]: { clear: URL.createObjectURL(clear), original: URL.createObjectURL(file) } }));
      setNotes((current) => ({ ...current, [slot]: 'Sending…' }));
      const form = new FormData();
      for (const [key, value] of Object.entries(fields)) form.set(key, value);
      form.set('kind', kind);
      form.set('slot', slot);
      form.set('original', file, file.name || 'photo');
      form.set('view', clear, 'clear.jpg');
      form.set('takenAt', new Date(file.lastModified || Date.now()).toISOString());
      if (where) {
        form.set('latitude', String(where.latitude));
        form.set('longitude', String(where.longitude));
        form.set('accuracy', String(where.accuracy));
      }
      const response = await fetch(endpoint, { method: 'POST', body: form });
      const data = (await response.json().catch(() => ({}))) as { error?: string; onTheSpot?: boolean };
      if (!response.ok) throw new Error(data.error ?? 'The photo was not sent. Try again.');
      setNotes((current) => ({ ...current, [slot]: data.onTheSpot ? 'Sent. Recorded as taken on the spot.' : 'Sent.' }));
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error && error.message !== 'no canvas' && error.message !== 'no blob'
          ? error.message
          : 'This photo could not be prepared on this phone. Try taking it again with the camera.';
      setNotes((current) => ({ ...current, [slot]: message }));
    } finally {
      setBusy(null);
    }
  }

  const guide = PHOTO_GUIDES[kind];
  const count = guide.slots.filter((slot) => done.has(slot.id) || previews[slot.id]).length;

  return (
    <section aria-labelledby='photos' className='grid gap-4 rounded-2xl border border-line bg-sheet p-4 sm:p-5'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 id='photos' className='font-display text-[20px] text-ink'>Photos for the claim</h2>
          <p className='text-sm text-dim'>
            {count} of {guide.slots.length} taken. Take them now, at the scene if it is safe. Each photo is kept exactly as your phone took it, and a clearer copy is made for easy viewing.
          </p>
        </div>
        <label className='text-sm font-medium text-ink'>
          What happened to
          <select value={kind} onChange={(event) => setKind(event.target.value as ClaimKind)} className='ml-2 rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-sm'>
            <option value='motor'>a vehicle</option>
            <option value='property'>a home or property</option>
            <option value='other'>something else</option>
          </select>
        </label>
      </div>

      <div className='flex flex-wrap items-center gap-3 text-sm'>
        <button type='button' onClick={addLocation} className='rounded-lg border border-ink/15 bg-white px-3 py-2 font-medium text-ink hover:border-seal/50 hover:text-seal'>
          Add my location
        </button>
        <span role='status' className='text-dim'>{whereNote ?? 'Optional. Photos with a location are stronger evidence.'}</span>
      </div>

      <ol className='grid gap-3 sm:grid-cols-2'>
        {guide.slots.map((slot, index) => {
          const preview = previews[slot.id];
          const stored = done.get(slot.id);
          const src = preview ? (showOriginal[slot.id] ? preview.original : preview.clear) : stored?.viewUrl ?? null;
          return (
            <li key={slot.id} className='grid gap-2 rounded-xl border border-line bg-white p-3'>
              <p className='text-sm font-medium text-ink'>
                <span className='mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sealsoft font-mono text-[11px] text-seal'>{index + 1}</span>
                {slot.label}
              </p>
              <p className='text-xs text-dim'>{slot.tip}</p>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={slot.label} className='aspect-[4/3] w-full rounded-lg bg-paper object-cover' />
              ) : (
                <div className='flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-paper text-xs text-dim'>No photo yet</div>
              )}
              <div className='flex flex-wrap items-center gap-2'>
                <label className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold ${busy === slot.id ? 'bg-seal/60 text-white' : 'bg-seal text-white hover:bg-sealdark'}`}>
                  {stored || preview ? 'Take again' : 'Take photo'}
                  <input
                    type='file'
                    accept='image/*'
                    capture='environment'
                    disabled={busy !== null}
                    className='sr-only'
                    onChange={(event) => {
                      void send(slot.id, event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </label>
                <label className='cursor-pointer rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-ink hover:border-seal/50'>
                  From gallery
                  <input
                    type='file'
                    accept='image/*'
                    disabled={busy !== null}
                    className='sr-only'
                    onChange={(event) => {
                      void send(slot.id, event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </label>
                {preview ? (
                  <button type='button' onClick={() => setShowOriginal((s) => ({ ...s, [slot.id]: !s[slot.id] }))} className='text-xs font-medium text-seal underline underline-offset-2'>
                    {showOriginal[slot.id] ? 'Show the clear copy' : 'Show the original'}
                  </button>
                ) : null}
                {stored?.onTheSpot ? <span className='text-xs text-seal'>Taken on the spot</span> : null}
              </div>
              {notes[slot.id] ? <p role='status' className='text-xs text-dim'>{notes[slot.id]}</p> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
