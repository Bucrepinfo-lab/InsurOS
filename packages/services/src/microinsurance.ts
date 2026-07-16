import type {
  MicroPayment,
  MicroPolicy,
  MicroProduct,
  MobileMoneyProvider
} from "@insuros/domain";
import { resolvePolicyStatus } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface EnrollInput {
  productId: string;
  holderName: string;
  msisdn: string;
  channel: MicroPolicy["channel"];
  providerId: string;
}

export interface EnrollResult {
  ok: boolean;
  error?: string;
  policy?: MicroPolicy;
}

export class MicroinsuranceService {
  private get db() {
    return getPersistence();
  }

  async getProducts(): Promise<MicroProduct[]> {
    return this.db.microProducts.findAll();
  }

  async getProviders(): Promise<MobileMoneyProvider[]> {
    return this.db.mobileMoneyProviders.findAll();
  }

  async getPolicies(): Promise<MicroPolicy[]> {
    return this.db.microPolicies.findAll();
  }

  async getPayments(): Promise<MicroPayment[]> {
    return this.db.microPayments.findAll();
  }

  /** Enrol via mobile money: number = identity + payment instrument. */
  async enroll(input: EnrollInput): Promise<EnrollResult> {
    const product = await this.db.microProducts.findById(input.productId);
    const provider = await this.db.mobileMoneyProviders.findById(
      input.providerId
    );

    if (!product || product.status !== "Active") {
      return { ok: false, error: "Product not available." };
    }

    if (!provider || provider.countryCode !== product.countryCode) {
      return {
        ok: false,
        error: "Mobile money provider not available in the product's country."
      };
    }

    if (!product.activationChannels.includes(input.channel)) {
      return {
        ok: false,
        error: `Product not sold via ${input.channel}.`
      };
    }

    const policy = await this.db.microPolicies.insert({
      id: `mpol-${Date.now()}`,
      productId: product.id,
      holderName: input.holderName,
      msisdn: input.msisdn,
      channel: input.channel,
      providerId: provider.id,
      enrolledAt: new Date().toISOString(),
      status: "Grace"
    });

    return { ok: true, policy };
  }

  /** Record a mobile-money premium payment and refresh policy status. */
  async recordPayment(
    policyId: string,
    amount: number,
    providerReference: string
  ): Promise<MicroPayment> {
    const policy = await this.db.microPolicies.findById(policyId);

    if (!policy) {
      throw new Error(`Unknown policy: ${policyId}`);
    }

    const product = await this.db.microProducts.findById(policy.productId);
    const paidAt = new Date().toISOString();

    const payment = await this.db.microPayments.insert({
      id: `mpay-${Date.now()}`,
      policyId,
      amount,
      currency: product?.currency ?? "KES",
      providerId: policy.providerId,
      providerReference,
      paidAt
    });

    await this.db.microPolicies.update(policyId, {
      lastPaymentAt: paidAt,
      status: product
        ? resolvePolicyStatus(product.premiumFrequency, paidAt, paidAt)
        : policy.status
    });

    return payment;
  }

  /** Recompute Active/Grace/Lapsed for every policy (daily job in prod). */
  async refreshPolicyStatuses(): Promise<MicroPolicy[]> {
    const now = new Date().toISOString();
    const policies = await this.db.microPolicies.findAll();
    const refreshed: MicroPolicy[] = [];

    for (const policy of policies) {
      if (policy.status === "Cancelled") {
        continue;
      }

      const product = await this.db.microProducts.findById(policy.productId);

      if (!product) {
        continue;
      }

      const status = resolvePolicyStatus(
        product.premiumFrequency,
        policy.lastPaymentAt,
        now
      );

      const updated = await this.db.microPolicies.update(policy.id, { status });

      if (updated) {
        refreshed.push(updated);
      }
    }

    return refreshed;
  }
}
