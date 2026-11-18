/**
 * Where claim photos are kept. Private: nothing is public, and a photo is
 * shown through a link that expires.
 *
 * Supabase Storage when the server has NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY (already set for sign-in), in a private bucket
 * the app creates on first use; in memory otherwise (development and tests).
 */
export interface PhotoStorage {
  kind: "supabase" | "memory";
  put(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  /** A link that works for `seconds`, or null if the file is missing. */
  link(path: string, seconds: number): Promise<string | null>;
}

function env(): Record<string, string | undefined> {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
}

export const PHOTO_BUCKET = "claim-photos";

export class SupabasePhotoStorage implements PhotoStorage {
  kind = "supabase" as const;
  private bucketReady: Promise<void> | null = null;
  constructor(
    private readonly baseUrl: string,
    private readonly serviceKey: string,
    private readonly bucket = PHOTO_BUCKET,
    private readonly fetcher: typeof fetch = fetch
  ) {}

  private headers(extra: Record<string, string> = {}) {
    return { authorization: `Bearer ${this.serviceKey}`, apikey: this.serviceKey, ...extra };
  }

  private ensureBucket(): Promise<void> {
    this.bucketReady ??= (async () => {
      const response = await this.fetcher(`${this.baseUrl}/storage/v1/bucket`, {
        method: "POST",
        headers: this.headers({ "content-type": "application/json" }),
        body: JSON.stringify({ id: this.bucket, name: this.bucket, public: false, file_size_limit: 12 * 1024 * 1024 })
      });
      // 200 = made now; 400/409 = it already exists. Anything else is a real problem.
      if (!response.ok && response.status !== 400 && response.status !== 409) {
        this.bucketReady = null;
        throw new Error(`Photo storage is not available (${response.status}).`);
      }
    })();
    return this.bucketReady;
  }

  async put(path: string, bytes: Uint8Array, contentType: string): Promise<void> {
    await this.ensureBucket();
    const response = await this.fetcher(`${this.baseUrl}/storage/v1/object/${this.bucket}/${path}`, {
      method: "POST",
      headers: this.headers({ "content-type": contentType, "x-upsert": "false", "cache-control": "31536000" }),
      body: new Blob([new Uint8Array(bytes)], { type: contentType })
    });
    if (!response.ok) throw new Error(`The photo could not be stored (${response.status}).`);
  }

  async link(path: string, seconds: number): Promise<string | null> {
    const response = await this.fetcher(`${this.baseUrl}/storage/v1/object/sign/${this.bucket}/${path}`, {
      method: "POST",
      headers: this.headers({ "content-type": "application/json" }),
      body: JSON.stringify({ expiresIn: seconds })
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { signedURL?: string };
    return data.signedURL ? `${this.baseUrl}/storage/v1${data.signedURL}` : null;
  }
}

export class MemoryPhotoStorage implements PhotoStorage {
  kind = "memory" as const;
  private readonly files = new Map<string, { bytes: Uint8Array; contentType: string }>();
  async put(path: string, bytes: Uint8Array, contentType: string): Promise<void> {
    if (this.files.has(path)) throw new Error("A photo is already stored there.");
    this.files.set(path, { bytes, contentType });
  }
  async link(path: string): Promise<string | null> {
    const file = this.files.get(path);
    return file ? `data:${file.contentType};base64,${Buffer.from(file.bytes).toString("base64")}` : null;
  }
}

const KEY = Symbol.for("insuros.photoStorage");
type Holder = { [KEY]?: PhotoStorage };

export function photoStorage(): PhotoStorage {
  const holder = globalThis as Holder;
  if (!holder[KEY]) {
    const e = env();
    holder[KEY] =
      e.NEXT_PUBLIC_SUPABASE_URL && e.SUPABASE_SERVICE_ROLE_KEY
        ? new SupabasePhotoStorage(e.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, ""), e.SUPABASE_SERVICE_ROLE_KEY)
        : new MemoryPhotoStorage();
  }
  return holder[KEY]!;
}
