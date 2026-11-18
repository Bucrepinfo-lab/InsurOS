import type { ScenePhoto } from "./scene-capture";

/**
 * Claim photos — PURE.
 *
 * Guided shots so a claim arrives with what an assessor needs, taken from the
 * phone at the scene. The shot lists follow what insurers ask for: all four
 * sides with the number plate, wide and close views of the damage, the
 * odometer and warning lights, the chassis (VIN) number, the scene and the
 * other vehicle (ICBC, Youi, Pineapple claim guides; Kenyan claim forms ask for
 * photographs of the damaged vehicle with the police abstract).
 *
 * Two copies of every photo are kept: the ORIGINAL exactly as the phone took
 * it (the evidence, with its fingerprint), and a CLEAR copy brightened and
 * sharpened on the device for easy viewing. The clear copy is never the
 * evidence.
 */
export type ClaimKind = "motor" | "property" | "other";

export interface PhotoSlot {
  id: string;
  label: string;
  tip: string;
}

export const PHOTO_GUIDES: Record<ClaimKind, { title: string; slots: PhotoSlot[] }> = {
  motor: {
    title: "Vehicle",
    slots: [
      { id: "front", label: "Front, with the number plate", tip: "Stand back so the whole front and the plate are in the picture." },
      { id: "rear", label: "Back, with the number plate", tip: "The whole back of the vehicle and the plate." },
      { id: "left", label: "Left side", tip: "From a corner, so the side and the front or back show." },
      { id: "right", label: "Right side", tip: "From the other corner." },
      { id: "damage-wide", label: "The damage, from a step back", tip: "Show where on the vehicle the damage is." },
      { id: "damage-close", label: "The damage, close up", tip: "Fill the picture with the damage. Hold steady." },
      { id: "dashboard", label: "Dashboard: mileage and warning lights", tip: "Switch the ignition on so the lights show." },
      { id: "chassis", label: "Chassis (VIN) number", tip: "On the windscreen corner, the door pillar or the logbook." },
      { id: "scene", label: "The scene", tip: "The road, signs and where the vehicles stopped. Only if it is safe." },
      { id: "other-vehicle", label: "The other vehicle and its plate", tip: "If another vehicle was involved." }
    ]
  },
  property: {
    title: "Home or business property",
    slots: [
      { id: "outside", label: "The building from outside", tip: "So the place can be recognised." },
      { id: "room", label: "The room or area affected", tip: "From the doorway, showing the whole space." },
      { id: "damage-wide", label: "The damage, from a step back", tip: "Show where the damage is." },
      { id: "damage-close", label: "The damage, close up", tip: "Fill the picture with the damage." },
      { id: "item", label: "A damaged or stolen item", tip: "One item per photo, with anything that shows its make." },
      { id: "serial", label: "Serial number or label", tip: "The plate or sticker with the model and serial number." },
      { id: "cause", label: "The cause", tip: "A burst pipe, a broken window, the point of entry." },
      { id: "proof", label: "Receipt or proof of ownership", tip: "A receipt, warranty card or an earlier photo." },
      { id: "extra-1", label: "Anything else", tip: "Another view that helps." },
      { id: "extra-2", label: "Anything else", tip: "Another view that helps." }
    ]
  },
  other: {
    title: "Other claims",
    slots: Array.from({ length: 10 }, (_, index) => ({
      id: `photo-${index + 1}`,
      label: `Photo ${index + 1}`,
      tip: index === 0 ? "Start with a wide view, then close ups." : "Another view that helps."
    }))
  }
};

/** At most this many photos on one claim, counting replacements. */
export const MAX_PHOTOS_PER_CLAIM = 30;
/** The original as the phone took it. Most phone photos are 2 to 6 MB. */
export const MAX_ORIGINAL_BYTES = 12 * 1024 * 1024;
/** The clear viewing copy made on the device. */
export const MAX_VIEW_BYTES = 3 * 1024 * 1024;

export type ImageType = "image/jpeg" | "image/png" | "image/webp" | "image/heic";

/** The real type of an image from its first bytes; the name and the browser's word are not trusted. */
export function sniffImage(bytes: Uint8Array): ImageType | null {
  const at = (i: number) => bytes[i] ?? -1;
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "image/jpeg";
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return "image/png";
  if (at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 && at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50) return "image/webp";
  const brand = String.fromCharCode(at(4), at(5), at(6), at(7), at(8), at(9), at(10), at(11));
  if (brand.startsWith("ftyp") && /heic|heix|mif1|msf1|hevc/.test(brand.slice(4))) return "image/heic";
  return null;
}

export type UploadCheck = { ok: true; originalType: ImageType } | { ok: false; error: string };

export function checkUpload(input: {
  kind: unknown;
  slot: unknown;
  original: Uint8Array;
  view: Uint8Array;
  existing: number;
}): UploadCheck {
  const kind = typeof input.kind === "string" && input.kind in PHOTO_GUIDES ? (input.kind as ClaimKind) : null;
  if (!kind) return { ok: false, error: "Choose what kind of claim this is." };
  if (!PHOTO_GUIDES[kind].slots.some((slot) => slot.id === input.slot)) return { ok: false, error: "Choose which photo this is." };
  if (input.existing >= MAX_PHOTOS_PER_CLAIM) return { ok: false, error: "This claim already has as many photos as it can hold. Ask your agent if more are needed." };
  if (input.original.byteLength === 0 || input.original.byteLength > MAX_ORIGINAL_BYTES) return { ok: false, error: "The photo is too large. Take it again at normal size." };
  if (input.view.byteLength === 0 || input.view.byteLength > MAX_VIEW_BYTES) return { ok: false, error: "The clear copy could not be made. Try again." };
  const originalType = sniffImage(input.original);
  if (!originalType) return { ok: false, error: "That file is not a photo." };
  if (sniffImage(input.view) !== "image/jpeg") return { ok: false, error: "The clear copy could not be made. Try again." };
  return { ok: true, originalType };
}

/** Taken within this many minutes before upload counts as taken on the spot. */
export const ON_THE_SPOT_MINUTES = 15;

/** Whether the phone's own timestamp says the photo was just taken. */
export function takenOnTheSpot(takenAt: string | undefined, receivedAt: string): boolean {
  if (!takenAt) return false;
  const lag = new Date(receivedAt).getTime() - new Date(takenAt).getTime();
  return lag >= -60_000 && lag <= ON_THE_SPOT_MINUTES * 60_000;
}

/** The newest photo for each slot, in the guide's order, then any slots not in the guide. */
export function latestBySlot(photos: readonly ScenePhoto[], kind: ClaimKind): { slot: PhotoSlot; photo?: ScenePhoto }[] {
  const newest = new Map<string, ScenePhoto>();
  for (const photo of photos) {
    if (!photo.slot) continue;
    const current = newest.get(photo.slot);
    if (!current || current.receivedAt < photo.receivedAt) newest.set(photo.slot, photo);
  }
  return PHOTO_GUIDES[kind].slots.map((slot) => ({ slot, photo: newest.get(slot.id) }));
}

/**
 * Make a photo clearer to look at — PURE pixel maths, run in the browser on
 * the viewing copy only. Stretches brightness so the darkest 0.5% become black
 * and the brightest 0.5% white (the same stretch on red, green and blue, so
 * colours do not shift), then sharpens edges with a light unsharp mask.
 * Returns new pixels; the input is not changed.
 */
export function clarify(pixels: Uint8ClampedArray, width: number, height: number, sharpen = 0.6): Uint8ClampedArray {
  const count = width * height;
  const lum = new Float32Array(count);
  const histogram = new Uint32Array(256);
  for (let i = 0; i < count; i += 1) {
    const r = pixels[i * 4]!, g = pixels[i * 4 + 1]!, b = pixels[i * 4 + 2]!;
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    lum[i] = y;
    histogram[Math.min(255, Math.round(y))]! += 1;
  }
  const cut = count * 0.005;
  let lo = 0, hi = 255, seen = 0;
  for (let v = 0; v < 256; v += 1) { seen += histogram[v]!; if (seen > cut) { lo = v; break; } }
  seen = 0;
  for (let v = 255; v >= 0; v -= 1) { seen += histogram[v]!; if (seen > cut) { hi = v; break; } }
  // A nearly flat picture (fog, a blank wall) is left alone rather than blown up.
  const span = hi - lo;
  const scale = span >= 24 ? 255 / span : 1;
  const shift = span >= 24 ? lo : 0;

  const out = new Uint8ClampedArray(pixels.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      // 3 x 3 box blur of brightness, for the unsharp mask (edges reuse the nearest pixel).
      let sum = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        const yy = Math.min(height - 1, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx += 1) {
          const xx = Math.min(width - 1, Math.max(0, x + dx));
          sum += lum[yy * width + xx]!;
        }
      }
      const detail = sharpen * (lum[i]! - sum / 9);
      for (let c = 0; c < 3; c += 1) {
        out[i * 4 + c] = (pixels[i * 4 + c]! - shift) * scale + detail * scale;
      }
      out[i * 4 + 3] = pixels[i * 4 + 3]!;
    }
  }
  return out;
}
