import type { KpiRatios, KpiSnapshot } from "@insuros/domain";
import { computeRatios } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface KpiReport extends KpiRatios {
  snapshot: KpiSnapshot;
}

export class AnalyticsService {
  private get db() {
    return getPersistence();
  }

  async getSnapshots(): Promise<KpiSnapshot[]> {
    return this.db.kpiSnapshots.findAll();
  }

  async getReports(): Promise<KpiReport[]> {
    const snapshots = await this.db.kpiSnapshots.findAll();

    return snapshots.map((snapshot) => ({
      snapshot,
      ...computeRatios(snapshot)
    }));
  }

  async getReportsForCountry(countryCode: string): Promise<KpiReport[]> {
    const reports = await this.getReports();
    return reports.filter(
      (report) => report.snapshot.countryCode === countryCode
    );
  }
}
