/**
 * Read when and where a photo was taken from the phone's own photo data
 * (EXIF) — PURE. Only the two facts that matter as evidence: the original
 * date and time, and the GPS position. Anything unreadable gives nothing.
 */
export interface PhotoFacts {
  /** As written by the camera, "yyyy-mm-ddThh:mm:ss", with its offset when the phone wrote one. */
  takenAt?: string;
  latitude?: number;
  longitude?: number;
}

export function readExif(bytes: Uint8Array): PhotoFacts {
  try {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return {};
    let i = 2;
    while (i + 4 < bytes.length && bytes[i] === 0xff) {
      const marker = bytes[i + 1]!;
      const size = (bytes[i + 2]! << 8) | bytes[i + 3]!;
      if (marker === 0xe1 && String.fromCharCode(...bytes.slice(i + 4, i + 8)) === "Exif") return parseTiff(bytes, i + 10);
      if (marker === 0xda) break;
      i += 2 + size;
    }
  } catch {
    // A damaged header is simply not used.
  }
  return {};
}

function parseTiff(b: Uint8Array, start: number): PhotoFacts {
  const little = b[start] === 0x49;
  const u16 = (o: number) => (little ? b[start + o]! | (b[start + o + 1]! << 8) : (b[start + o]! << 8) | b[start + o + 1]!);
  const u32 = (o: number) => (little ? (u16(o) | (u16(o + 2) << 16)) >>> 0 : ((u16(o) << 16) | u16(o + 2)) >>> 0);
  const ascii = (o: number, n: number) => String.fromCharCode(...b.slice(start + o, start + o + n)).replace(/\0+$/, "");
  const entries = (ifd: number) => {
    const count = u16(ifd);
    if (count > 500) return [];
    return Array.from({ length: count }, (_, k) => {
      const e = ifd + 2 + k * 12;
      return { tag: u16(e), type: u16(e + 2), count: u32(e + 4), value: e + 8 };
    });
  };
  const offsetOf = (entry: { count: number; type: number; value: number }, size: number) => (entry.count * size > 4 ? u32(entry.value) : entry.value);
  const rational = (o: number) => {
    const d = u32(o + 4);
    return d === 0 ? NaN : u32(o) / d;
  };

  const facts: PhotoFacts = {};
  const ifd0 = entries(u32(4));
  const exifPointer = ifd0.find((e) => e.tag === 0x8769);
  const gpsPointer = ifd0.find((e) => e.tag === 0x8825);
  if (exifPointer) {
    const exif = entries(u32(exifPointer.value));
    const original = exif.find((e) => e.tag === 0x9003);
    const offset = exif.find((e) => e.tag === 0x9011);
    if (original) {
      const raw = ascii(offsetOf(original, 1), 19); // "yyyy:mm:dd hh:mm:ss"
      const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(raw);
      if (m) {
        const tz = offset ? ascii(offsetOf(offset, 1), 6) : "";
        facts.takenAt = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${/^[+-]\d{2}:\d{2}$/.test(tz) ? tz : ""}`;
      }
    }
  }
  if (gpsPointer) {
    const gps = entries(u32(gpsPointer.value));
    const ref = (tag: number) => {
      const e = gps.find((x) => x.tag === tag);
      return e ? String.fromCharCode(b[start + e.value]!) : "";
    };
    const coord = (tag: number) => {
      const e = gps.find((x) => x.tag === tag);
      if (!e || e.count !== 3) return NaN;
      const o = u32(e.value);
      return rational(o) + rational(o + 8) / 60 + rational(o + 16) / 3600;
    };
    const lat = coord(0x0002);
    const lon = coord(0x0004);
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(lat === 0 && lon === 0)) {
      facts.latitude = Math.round((ref(0x0001) === "S" ? -lat : lat) * 1e6) / 1e6;
      facts.longitude = Math.round((ref(0x0003) === "W" ? -lon : lon) * 1e6) / 1e6;
    }
  }
  return facts;
}

/** EXIF time to an instant: its own offset if written, else the country's zone offset (hours). */
export function exifInstant(takenAt: string, fallbackOffsetHours: number): string | null {
  const withOffset = /[+-]\d{2}:\d{2}$/.test(takenAt);
  const sign = fallbackOffsetHours < 0 ? "-" : "+";
  const abs = Math.abs(fallbackOffsetHours);
  const offset = `${sign}${String(Math.floor(abs)).padStart(2, "0")}:${String(Math.round((abs % 1) * 60)).padStart(2, "0")}`;
  const parsed = Date.parse(withOffset ? takenAt : `${takenAt}${offset}`);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

/** A map pin anyone can open, with no account or key. */
export function mapPinUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;
}

/** The words stamped on the clear copy: when, where and which claim. */
export function stampText(input: { when: Date; timeZone: string; latitude?: number; longitude?: number; accuracy?: number; reference?: string }): string {
  const when = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: input.timeZone,
    timeZoneName: "short"
  }).format(input.when).replace(",", "");
  const where =
    input.latitude !== undefined && input.longitude !== undefined
      ? `${input.latitude.toFixed(5)}, ${input.longitude.toFixed(5)}${input.accuracy ? ` ±${Math.round(input.accuracy)} m` : ""}`
      : "no location";
  return [when, where, input.reference].filter(Boolean).join("  ·  ");
}
