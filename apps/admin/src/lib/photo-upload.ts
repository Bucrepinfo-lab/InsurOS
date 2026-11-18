import type { AddPhotoInput } from '@insuros/services';

/** Read the shared fields of a photo upload form. Files are read as bytes; nothing from the browser is trusted beyond that. */
export async function readPhotoForm(form: FormData): Promise<Omit<AddPhotoInput, 'claimReference' | 'uploadedBy' | 'conversationId'> | null> {
  const original = form.get('original');
  const view = form.get('view');
  if (!(original instanceof Blob) || !(view instanceof Blob)) return null;
  const lat = Number(form.get('latitude'));
  const lon = Number(form.get('longitude'));
  const acc = Number(form.get('accuracy'));
  const takenAt = String(form.get('takenAt') ?? '');
  return {
    kind: form.get('kind'),
    slot: form.get('slot'),
    original: new Uint8Array(await original.arrayBuffer()),
    view: new Uint8Array(await view.arrayBuffer()),
    ...(takenAt ? { takenAt } : {}),
    ...(Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(acc) && form.get('latitude') !== null
      ? { location: { latitude: lat, longitude: lon, accuracy: acc } }
      : {})
  };
}

export const tooBig = (request: Request) => Number(request.headers.get('content-length') ?? '0') > 16 * 1024 * 1024;
