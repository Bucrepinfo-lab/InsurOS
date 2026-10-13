import type { EntityId, IsoDateTime } from "./base";
import type { InsuranceLine } from "./tax";

export type MarketingPlacement =
  | "Marketplace"
  | "Micro"
  | "PricingQuote"
  | "ClaimsPortal"
  | "Onboarding"
  | "All";

export type MarketingAudience = "Prospect" | "Policyholder" | "Agent" | "All";

export interface MarketingContent {
  id: EntityId;
  title: string;
  headline: string;
  body: string;
  cta: string;
  ctaHref?: string;
  insuranceLine: InsuranceLine | "All";
  placement: MarketingPlacement;
  audience: MarketingAudience;
  locale: string;
  status: "Active" | "Draft" | "Archived";
  startsAt?: IsoDateTime;
  endsAt?: IsoDateTime;
}

/** Active content for a placement + line, most specific first. */
export function selectContent(
  contents: MarketingContent[],
  placement: MarketingPlacement,
  insuranceLine?: InsuranceLine,
  now: IsoDateTime = new Date().toISOString()
): MarketingContent[] {
  return contents
    .filter((content) => {
      if (content.status !== "Active") return false;
      if (content.placement !== placement && content.placement !== "All")
        return false;
      if (
        insuranceLine &&
        content.insuranceLine !== insuranceLine &&
        content.insuranceLine !== "All"
      )
        return false;
      if (content.startsAt && content.startsAt > now) return false;
      if (content.endsAt && content.endsAt < now) return false;
      return true;
    })
    .sort((a, b) => {
      const specificity = (item: MarketingContent) =>
        (item.placement === placement ? 2 : 0) +
        (item.insuranceLine !== "All" ? 1 : 0);
      return specificity(b) - specificity(a);
    });
}
