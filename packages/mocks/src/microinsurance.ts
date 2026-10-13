import type {
  MicroPayment,
  MicroPolicy,
  MicroProduct,
  MobileMoneyProvider
} from "@insuros/domain";

export const mockMobileMoneyProviders: MobileMoneyProvider[] = [
  { id: "momo-mpesa", name: "M-PESA", countryCode: "KE", ussdCode: "*334#", apiStatus: "Sandbox" },
  { id: "momo-airtel-ke", name: "Airtel Money", countryCode: "KE", ussdCode: "*222#", apiStatus: "Planned" },
  { id: "momo-mtn-ng", name: "MTN MoMo", countryCode: "NG", ussdCode: "*904#", apiStatus: "Planned" }
];

export const mockMicroProducts: MicroProduct[] = [
  {
    id: "micro-boda",
    name: "Boda Boda Daily Accident Cover",
    insuranceLine: "Health",
    countryCode: "KE",
    targetSegment: "Motorcycle taxi riders",
    coverAmount: 200_000,
    premiumAmount: 20,
    premiumFrequency: "Daily",
    currency: "KES",
    activationChannels: ["USSD", "MobileApp", "Agent"],
    status: "Active"
  },
  {
    id: "micro-jua-kali",
    name: "Jua Kali Tools & Injury Weekly Cover",
    insuranceLine: "General",
    countryCode: "KE",
    targetSegment: "Informal artisans",
    coverAmount: 100_000,
    premiumAmount: 100,
    premiumFrequency: "Weekly",
    currency: "KES",
    activationChannels: ["USSD", "Agent"],
    status: "Active"
  },
  {
    id: "micro-crop-index",
    name: "Crop Drought Index Cover",
    insuranceLine: "General",
    countryCode: "KE",
    targetSegment: "Smallholder farmers",
    coverAmount: 50_000,
    premiumAmount: 250,
    premiumFrequency: "Monthly",
    currency: "KES",
    activationChannels: ["USSD", "Agent", "Embedded"],
    parametricTrigger: {
      index: "County rainfall below 40mm over any rolling 30 days in season",
      payoutPercent: 60,
      dataSource: "Kenya Meteorological Department gauge feed"
    },
    status: "Active"
  },
  {
    id: "micro-device",
    name: "Embedded Phone Damage Cover",
    insuranceLine: "Property",
    countryCode: "KE",
    targetSegment: "Smartphone buyers (embedded at checkout)",
    coverAmount: 30_000,
    premiumAmount: 150,
    premiumFrequency: "Monthly",
    currency: "KES",
    activationChannels: ["Embedded"],
    status: "Active"
  }
];

export const mockMicroPolicies: MicroPolicy[] = [
  {
    id: "mpol-1",
    productId: "micro-boda",
    holderName: "Samuel Kimani",
    msisdn: "+254712000111",
    channel: "USSD",
    providerId: "momo-mpesa",
    enrolledAt: "2026-06-01T06:00:00Z",
    lastPaymentAt: "2026-07-16T05:30:00Z",
    status: "Active"
  },
  {
    id: "mpol-2",
    productId: "micro-crop-index",
    holderName: "Esther Chebet",
    msisdn: "+254722000222",
    channel: "Agent",
    providerId: "momo-mpesa",
    enrolledAt: "2026-05-15T09:00:00Z",
    lastPaymentAt: "2026-07-01T10:00:00Z",
    status: "Active"
  },
  {
    id: "mpol-3",
    productId: "micro-jua-kali",
    holderName: "David Omondi",
    msisdn: "+254733000333",
    channel: "USSD",
    providerId: "momo-airtel-ke",
    enrolledAt: "2026-06-20T08:00:00Z",
    lastPaymentAt: "2026-07-02T08:00:00Z",
    status: "Lapsed"
  }
];

export const mockMicroPayments: MicroPayment[] = [
  { id: "mpay-1", policyId: "mpol-1", amount: 20, currency: "KES", providerId: "momo-mpesa", providerReference: "SFI8K2LQ01", paidAt: "2026-07-16T05:30:00Z" },
  { id: "mpay-2", policyId: "mpol-1", amount: 20, currency: "KES", providerId: "momo-mpesa", providerReference: "SFH7J1KP99", paidAt: "2026-07-15T05:28:00Z" },
  { id: "mpay-3", policyId: "mpol-2", amount: 250, currency: "KES", providerId: "momo-mpesa", providerReference: "SFG5H0JN77", paidAt: "2026-07-01T10:00:00Z" },
  { id: "mpay-4", policyId: "mpol-3", amount: 100, currency: "KES", providerId: "momo-airtel-ke", providerReference: "AMK3F8HL55", paidAt: "2026-07-02T08:00:00Z" }
];
