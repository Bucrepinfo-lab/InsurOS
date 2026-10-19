import type { AffordabilityBand, CompetitorBenchmark, RiskFactor } from "@insuros/domain";

export const mockRiskFactors: RiskFactor[] = [
  { id: "risk-urban", name: "Urban operation", insuranceLine: "Motor", multiplier: 1.15, description: "Dense-traffic urban exposure." },
  { id: "risk-young-driver", name: "Driver under 25", insuranceLine: "Motor", multiplier: 1.25, description: "Age-band frequency loading." },
  { id: "risk-commercial-use", name: "Commercial use", insuranceLine: "Motor", multiplier: 1.3, description: "PSV / commercial mileage." },
  { id: "risk-telematics-good", name: "Telematics: safe driver", insuranceLine: "Motor", multiplier: 0.85, description: "Usage-based discount from driving data." },
  { id: "risk-flood-zone", name: "Flood-prone location", insuranceLine: "Property", multiplier: 1.4, description: "Catastrophe exposure loading." },
  { id: "risk-sprinklers", name: "Fire suppression installed", insuranceLine: "Property", multiplier: 0.9, description: "Mitigation discount." },
  { id: "risk-chronic", name: "Chronic condition", insuranceLine: "Health", multiplier: 1.35, description: "Expected utilisation loading." },
  { id: "risk-wellness", name: "Wellness program member", insuranceLine: "Health", multiplier: 0.92, description: "Engagement discount." }
];

export const mockAffordabilityBands: AffordabilityBand[] = [
  { id: "band-jua-kali", name: "Jua Kali / informal sector", targetSegment: "Informal daily earners", discountPercent: 30, minMonthlyPremium: 100, currency: "KES" },
  { id: "band-sme", name: "SME", targetSegment: "Small businesses", discountPercent: 15, minMonthlyPremium: 500, currency: "KES" },
  { id: "band-standard", name: "Standard retail", targetSegment: "Salaried households", discountPercent: 0, minMonthlyPremium: 1000, currency: "KES" }
];

export const mockCompetitorBenchmarks: CompetitorBenchmark[] = [
  { id: "bench-ke-motor-1", competitor: "Incumbent A", insuranceLine: "Motor", countryCode: "KE", monthlyPremium: 4_500, currency: "KES", capturedAt: "2026-07-01T00:00:00Z" },
  { id: "bench-ke-motor-2", competitor: "Incumbent B", insuranceLine: "Motor", countryCode: "KE", monthlyPremium: 4_200, currency: "KES", capturedAt: "2026-07-01T00:00:00Z" },
  { id: "bench-ke-motor-3", competitor: "Insurtech C", insuranceLine: "Motor", countryCode: "KE", monthlyPremium: 3_900, currency: "KES", capturedAt: "2026-07-01T00:00:00Z" },
  { id: "bench-ke-health-1", competitor: "Incumbent A", insuranceLine: "Health", countryCode: "KE", monthlyPremium: 2_800, currency: "KES", capturedAt: "2026-07-01T00:00:00Z" },
  { id: "bench-ke-health-2", competitor: "Incumbent D", insuranceLine: "Health", countryCode: "KE", monthlyPremium: 3_100, currency: "KES", capturedAt: "2026-07-01T00:00:00Z" },
  { id: "bench-ng-motor-1", competitor: "Incumbent E", insuranceLine: "Motor", countryCode: "NG", monthlyPremium: 9_000, currency: "NGN", capturedAt: "2026-07-01T00:00:00Z" }
];
