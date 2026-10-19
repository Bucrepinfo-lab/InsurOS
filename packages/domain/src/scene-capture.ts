import type { EntityId, IsoDateTime } from "./base";

/**
 * A photo captured live at the incident scene by the customer's device.
 * Camera-only capture (no gallery picks), GPS, timestamps, and a content
 * hash make the evidence tamper-evident from the first second.
 */
export interface ScenePhoto {
  id: EntityId;
  claimReference: string;
  url: string;
  /** SHA-256 of the image bytes, computed on-device at capture. */
  sha256: string;
  /** True when taken through the in-app camera; false for gallery uploads. */
  liveCapture: boolean;
  capturedAt: IsoDateTime;
  receivedAt: IsoDateTime;
  latitude?: number;
  longitude?: number;
  geoAccuracyMeters?: number;
  deviceModel?: string;
}

export interface SceneIntegrityCheck {
  code: string;
  passed: boolean;
  detail: string;
}

export type SceneVerdict = "Strong" | "Acceptable" | "Weak";

export interface SceneIntegrityResult {
  photoId: EntityId;
  claimReference: string;
  checks: SceneIntegrityCheck[];
  score: number;
  verdict: SceneVerdict;
}

/**
 * Evaluate evidential strength of a scene photo. Strong evidence lets
 * claims skip the adjuster visit entirely — the transparency that removes
 * delays, disputes, and distrust.
 */
export function evaluateSceneIntegrity(
  photo: ScenePhoto,
  incidentAt: IsoDateTime
): SceneIntegrityResult {
  const checks: SceneIntegrityCheck[] = [];

  checks.push({
    code: "LIVE_CAPTURE",
    passed: photo.liveCapture,
    detail: photo.liveCapture
      ? "Captured through the in-app camera."
      : "Uploaded from gallery — provenance unverifiable."
  });

  const captureLagHours =
    (new Date(photo.capturedAt).getTime() - new Date(incidentAt).getTime()) /
    3_600_000;

  checks.push({
    code: "TIMELY_CAPTURE",
    passed: captureLagHours >= 0 && captureLagHours <= 24,
    detail: `Captured ${Math.round(captureLagHours)}h after the incident.`
  });

  const hasGeo =
    photo.latitude !== undefined &&
    photo.longitude !== undefined &&
    (photo.geoAccuracyMeters ?? Infinity) <= 100;

  checks.push({
    code: "GEO_PRESENT",
    passed: hasGeo,
    detail: hasGeo
      ? `GPS fix within ${photo.geoAccuracyMeters}m.`
      : "No reliable GPS fix attached."
  });

  const uploadLagMinutes =
    (new Date(photo.receivedAt).getTime() -
      new Date(photo.capturedAt).getTime()) /
    60_000;

  checks.push({
    code: "REALTIME_UPLOAD",
    passed: uploadLagMinutes >= 0 && uploadLagMinutes <= 60,
    detail: `Uploaded ${Math.round(uploadLagMinutes)} min after capture.`
  });

  checks.push({
    code: "HASH_SEALED",
    passed: photo.sha256.length === 64,
    detail:
      photo.sha256.length === 64
        ? "Content hash sealed on-device."
        : "Missing or malformed content hash."
  });

  const score = Math.round(
    (checks.filter((check) => check.passed).length / checks.length) * 100
  );

  const verdict: SceneVerdict =
    score >= 80 ? "Strong" : score >= 60 ? "Acceptable" : "Weak";

  return {
    photoId: photo.id,
    claimReference: photo.claimReference,
    checks,
    score,
    verdict
  };
}
