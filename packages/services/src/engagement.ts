import type {
  EngagementItem,
  NewsletterIssue,
  SubscriberDashboardPrefs
} from "@insuros/domain";
import { getPersistence } from "./persistence";

export class EngagementService {
  private get db() {
    return getPersistence();
  }

  /** Published feed, newest first, optionally scoped to a country. */
  async getFeed(countryCode?: string): Promise<EngagementItem[]> {
    const items = await this.db.engagementItems.findWhere(
      (item) =>
        item.status === "Published" &&
        (!countryCode || !item.countryCode || item.countryCode === countryCode)
    );

    return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  /** Word-of-mouth ammunition: everything with a ready share text. */
  async getShareables(): Promise<EngagementItem[]> {
    return this.db.engagementItems.findWhere(
      (item) => item.status === "Published" && item.shareable
    );
  }

  async getNewsletterThread(threadId: string): Promise<NewsletterIssue[]> {
    const issues = await this.db.newsletterIssues.findWhere(
      (issue) => issue.threadId === threadId
    );

    return issues.sort((a, b) => b.issueNumber - a.issueNumber);
  }

  async getNewsletterIssues(): Promise<NewsletterIssue[]> {
    return this.db.newsletterIssues.findAll();
  }

  async getPrefs(subscriptionId: string): Promise<SubscriberDashboardPrefs | undefined> {
    const [prefs] = await this.db.subscriberPrefs.findWhere(
      (item) => item.subscriptionId === subscriptionId
    );

    return prefs;
  }
}
