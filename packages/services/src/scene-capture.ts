import type { SceneIntegrityResult, ScenePhoto } from "@insuros/domain";
import { evaluateSceneIntegrity } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface RegisterSceneInput {
  claimReference: string;
  url: string;
  sha256: string;
  liveCapture: boolean;
  capturedAt: string;
  latitude?: number;
  longitude?: number;
  geoAccuracyMeters?: number;
  deviceModel?: string;
}

export class SceneCaptureService {
  private get db() {
    return getPersistence();
  }

  async getPhotos(): Promise<ScenePhoto[]> {
    return this.db.scenePhotos.findAll();
  }

  async getPhotosForClaim(claimReference: string): Promise<ScenePhoto[]> {
    return this.db.scenePhotos.findWhere(
      (photo) => photo.claimReference === claimReference
    );
  }

  /** Register a photo captured live at the incident scene. */
  async register(input: RegisterSceneInput): Promise<ScenePhoto> {
    return this.db.scenePhotos.insert({
      id: `scene-${Date.now()}`,
      ...input,
      receivedAt: new Date().toISOString()
    });
  }

  /** Integrity verdicts for every photo on a claim. */
  async evaluateClaim(
    claimReference: string,
    incidentAt: string
  ): Promise<SceneIntegrityResult[]> {
    const photos = await this.getPhotosForClaim(claimReference);

    return photos.map((photo) => evaluateSceneIntegrity(photo, incidentAt));
  }

  /**
   * Strong scene evidence on a claim earns fast-lane treatment: it
   * substitutes for the adjuster's site visit on small claims.
   */
  async claimHasStrongEvidence(
    claimReference: string,
    incidentAt: string
  ): Promise<boolean> {
    const results = await this.evaluateClaim(claimReference, incidentAt);

    return (
      results.length > 0 &&
      results.some((result) => result.verdict === "Strong")
    );
  }
}
