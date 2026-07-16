import type { ScenePhoto } from "@insuros/domain";

export const mockScenePhotos: ScenePhoto[] = [
  {
    id: "scene-1",
    claimReference: "CLM-KE-2026-0801",
    url: "https://storage.insuros.example/scenes/scene-1.jpg",
    sha256: "a3f1c2e4b5d60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
    liveCapture: true,
    capturedAt: "2026-07-10T07:42:00Z",
    receivedAt: "2026-07-10T07:43:10Z",
    latitude: -1.2195,
    longitude: 36.8886,
    geoAccuracyMeters: 8,
    deviceModel: "Samsung A34"
  },
  {
    id: "scene-2",
    claimReference: "CLM-KE-2026-0801",
    url: "https://storage.insuros.example/scenes/scene-2.jpg",
    sha256: "b4a2d3f5c6e70819304b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1",
    liveCapture: true,
    capturedAt: "2026-07-10T07:43:30Z",
    receivedAt: "2026-07-10T07:44:05Z",
    latitude: -1.2196,
    longitude: 36.8884,
    geoAccuracyMeters: 6,
    deviceModel: "Samsung A34"
  },
  {
    id: "scene-3",
    claimReference: "CLM-KE-2026-0803",
    url: "https://storage.insuros.example/scenes/scene-3.jpg",
    sha256: "notahash",
    liveCapture: false,
    capturedAt: "2026-06-21T10:00:00Z",
    receivedAt: "2026-07-08T09:05:00Z",
    deviceModel: "Unknown"
  }
];
