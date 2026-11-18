import { createHash, randomBytes } from "node:crypto";
import {
  checkUpload,
  evaluateSceneIntegrity,
  exifInstant,
  readExif,
  takenOnTheSpot,
  type ClaimKind,
  type SceneIntegrityResult,
  type ScenePhoto
} from "@insuros/domain";
import { getPersistence, resolveTenantId } from "./persistence";
import { photoStorage, type PhotoStorage } from "./photo-storage";

export interface AddPhotoInput {
  claimReference: string;
  kind: unknown;
  slot: unknown;
  original: Uint8Array;
  view: Uint8Array;
  /** The phone's own time for the photo (the file's last-modified time). */
  takenAt?: string;
  location?: { latitude: number; longitude: number; accuracy: number };
  uploadedBy: { kind: "staff" | "customer"; id: string; name: string };
  conversationId?: string;
  /** The country's UTC offset, for a camera time written without one. Kenya: 3. */
  utcOffsetHours?: number;
}

export interface ShownPhoto {
  photo: ScenePhoto;
  viewUrl: string | null;
  originalUrl: string | null;
  integrity: SceneIntegrityResult;
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic" };

/** Claim photos: the untouched original (evidence) and a clear copy, stored privately. */
export class ClaimPhotoService {
  constructor(private readonly storage: PhotoStorage = photoStorage()) {}

  private get db() {
    return getPersistence();
  }

  async photosFor(claimReference: string): Promise<ScenePhoto[]> {
    const photos = await this.db.scenePhotos.findWhere((photo) => photo.claimReference === claimReference && Boolean(photo.storagePath));
    return photos.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
  }

  async add(input: AddPhotoInput, now: Date = new Date()): Promise<{ ok: true; photo: ScenePhoto } | { ok: false; error: string }> {
    const reference = input.claimReference.trim();
    if (!/^[A-Za-z0-9-]{3,60}$/.test(reference)) return { ok: false, error: "The claim could not be found." };
    const existing = (await this.photosFor(reference)).length;
    const check = checkUpload({ kind: input.kind, slot: input.slot, original: input.original, view: input.view, existing });
    if (!check.ok) return check;

    const receivedAt = now.toISOString();
    const sha256 = createHash("sha256").update(input.original).digest("hex");
    const tenant = await resolveTenantId();
    const base = `${tenant}/${reference}/${now.getTime().toString(36)}-${randomBytes(6).toString("hex")}`;
    const storagePath = `${base}-original.${EXT[check.originalType]}`;
    const viewPath = `${base}-clear.jpg`;
    try {
      await this.storage.put(storagePath, input.original, check.originalType);
      await this.storage.put(viewPath, input.view, "image/jpeg");
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "The photo could not be stored." };
    }

    // Time: the camera's own record first, then the phone's file time, then the moment it arrived.
    const facts = check.originalType === "image/jpeg" ? readExif(input.original) : {};
    const exifTime = facts.takenAt ? exifInstant(facts.takenAt, input.utcOffsetHours ?? 3) : null;
    const deviceTime = input.takenAt && !Number.isNaN(Date.parse(input.takenAt)) ? new Date(input.takenAt).toISOString() : null;
    const takenAt = exifTime ?? deviceTime ?? receivedAt;
    const timeSource: ScenePhoto["timeSource"] = exifTime ? "photo" : deviceTime ? "device" : "upload";
    // Place: the phone's location service at the scene first (it gives its accuracy), then the photo's own GPS.
    const device =
      input.location &&
      Math.abs(input.location.latitude) <= 90 &&
      Math.abs(input.location.longitude) <= 180 &&
      input.location.accuracy > 0
        ? input.location
        : undefined;
    const fromPhoto = !device && facts.latitude !== undefined && facts.longitude !== undefined ? { latitude: facts.latitude, longitude: facts.longitude } : undefined;
    const photo: ScenePhoto = {
      id: `photo-${now.getTime().toString(36)}-${randomBytes(4).toString("hex")}`,
      claimReference: reference,
      url: storagePath,
      sha256,
      liveCapture: takenOnTheSpot(takenAt, receivedAt),
      capturedAt: takenAt,
      receivedAt,
      timeSource,
      ...(device ? { latitude: device.latitude, longitude: device.longitude, geoAccuracyMeters: Math.round(device.accuracy), locationSource: "device" as const } : {}),
      ...(fromPhoto ? { ...fromPhoto, locationSource: "photo" as const } : {}),
      slot: String(input.slot),
      claimKind: input.kind as ClaimKind,
      storagePath,
      viewPath,
      bytes: input.original.byteLength,
      uploadedBy: input.uploadedBy,
      ...(input.conversationId ? { conversationId: input.conversationId } : {})
    };
    await this.db.scenePhotos.insert(photo);
    return { ok: true, photo };
  }

  /** Photos with short-lived links and their evidence checks, for someone already allowed to see the claim. */
  async show(claimReference: string, incidentAt?: string, seconds = 900): Promise<ShownPhoto[]> {
    const photos = await this.photosFor(claimReference);
    const firstTaken = photos.map((photo) => photo.capturedAt).sort()[0];
    return Promise.all(
      photos.map(async (photo) => ({
        photo,
        viewUrl: photo.viewPath ? await this.storage.link(photo.viewPath, seconds) : null,
        originalUrl: photo.storagePath ? await this.storage.link(photo.storagePath, seconds) : null,
        integrity: evaluateSceneIntegrity(photo, incidentAt ?? firstTaken ?? photo.capturedAt)
      }))
    );
  }
}
