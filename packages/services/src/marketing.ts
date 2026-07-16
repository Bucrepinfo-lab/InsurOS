import type {
  InsuranceLine,
  MarketingContent,
  MarketingPlacement
} from "@insuros/domain";
import { selectContent } from "@insuros/domain";
import { getPersistence } from "./persistence";

export class MarketingService {
  private get db() {
    return getPersistence();
  }

  async getAllContent(): Promise<MarketingContent[]> {
    return this.db.marketingContent.findAll();
  }

  /** Active content for a placement, most specific first. */
  async getContentFor(
    placement: MarketingPlacement,
    insuranceLine?: InsuranceLine
  ): Promise<MarketingContent[]> {
    const contents = await this.db.marketingContent.findAll();

    return selectContent(contents, placement, insuranceLine);
  }
}
