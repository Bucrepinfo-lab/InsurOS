import type { TermsAcceptance, TermsDocument } from "@insuros/domain";

export const mockTermsDocuments: TermsDocument[] = [
  {
    id: "terms-global-v1",
    version: "1.0.0",
    title: "InsurOS Platform Terms & Conditions",
    audience: "All",
    jurisdiction: "GLOBAL",
    effectiveDate: "2026-07-01T00:00:00Z",
    status: "Active",
    sections: [
      {
        id: "terms-s1",
        order: 1,
        heading: "Acceptance of Terms",
        body: "By accessing or using the InsurOS platform, you agree to be bound by these Terms & Conditions. Continued use after any revision constitutes acceptance of the revised terms. If you do not agree, you must discontinue use immediately."
      },
      {
        id: "terms-s2",
        order: 2,
        heading: "Licence and Permitted Use",
        body: "InsurOS grants you a limited, non-exclusive, non-transferable, revocable licence to use the platform for lawful insurance operations within your assigned jurisdiction. You may not sublicense, resell, reverse-engineer, or misuse the platform."
      },
      {
        id: "terms-s3",
        order: 3,
        heading: "Administrative Hierarchy and Authority",
        body: "Platform authority follows the administrative hierarchy: Super Admin, Continental, National, County, and Constituency. Each administrator's authority is limited to their appointed jurisdiction. Appointments, suspensions, and revocations may only be made by an administrator at a strictly higher level."
      },
      {
        id: "terms-s4",
        order: 4,
        heading: "Regulatory and Tax Compliance",
        body: "You are responsible for compliance with all insurance regulations and statutory tax obligations in each jurisdiction where you operate. Tax computations provided by the platform are informational aids; final statutory liability rests with the filing entity, and rates must be verified with the relevant revenue authority before remittance."
      },
      {
        id: "terms-s5",
        order: 5,
        heading: "Data Protection and Privacy",
        body: "Personal data is processed in accordance with applicable data protection laws, including the Kenya Data Protection Act 2019, GDPR (EU/UK), and equivalent regimes in each operating jurisdiction. You must handle policyholder data only for legitimate insurance purposes."
      },
      {
        id: "terms-s6",
        order: 6,
        heading: "Sales Conduct",
        body: "Sales personnel must hold valid appointments from their superior in the sales hierarchy, comply with local market-conduct rules, and never misrepresent policy terms, premiums, or coverage. Commission entitlements are conditional on compliant conduct."
      },
      {
        id: "terms-s7",
        order: 7,
        heading: "Suspension and Termination",
        body: "InsurOS may suspend or terminate access for breach of these terms, regulatory non-compliance, fraud, or non-payment. Administrators may suspend subordinate accounts within their jurisdiction subject to due process and audit logging."
      },
      {
        id: "terms-s8",
        order: 8,
        heading: "Limitation of Liability",
        body: "To the maximum extent permitted by law, InsurOS is not liable for indirect, incidental, or consequential damages, including losses arising from reliance on informational tax computations, third-party payment portals, or service interruptions."
      },
      {
        id: "terms-s9",
        order: 9,
        heading: "Governing Law and Disputes",
        body: "These terms are governed by the law of the operating national jurisdiction for local disputes, and by the platform's seat of incorporation for cross-border disputes. Disputes shall first be referred to mediation before litigation or arbitration."
      },
      {
        id: "terms-s10",
        order: 10,
        heading: "Amendments",
        body: "InsurOS may amend these terms with at least 30 days' notice for material changes. Version history and acceptance records are retained in the platform's audit trail."
      }
    ]
  },
  {
    id: "terms-agent-v1",
    version: "1.0.0",
    title: "Sales Agent Agreement",
    audience: "Agent",
    jurisdiction: "GLOBAL",
    effectiveDate: "2026-07-01T00:00:00Z",
    status: "Active",
    sections: [
      {
        id: "terms-agent-s1",
        order: 1,
        heading: "Appointment",
        body: "Agents act only under a valid appointment issued by their superior in the sales hierarchy and within the geographic jurisdiction assigned to them."
      },
      {
        id: "terms-agent-s2",
        order: 2,
        heading: "Duties",
        body: "Agents must present products accurately, remit collected premiums promptly, maintain required licences, and meet assigned targets subject to fair review."
      },
      {
        id: "terms-agent-s3",
        order: 3,
        heading: "Commission",
        body: "Commissions accrue per the published schedule and are payable after premium reconciliation. Clawbacks apply to lapsed or fraudulent business."
      }
    ]
  }
];

export const mockTermsAcceptances: TermsAcceptance[] = [
  {
    id: "acceptance-1",
    termsId: "terms-global-v1",
    termsVersion: "1.0.0",
    userId: "user-super-admin",
    userName: "Jacob Bucrep",
    acceptedAt: "2026-07-01T08:00:00Z",
    method: "ClickWrap",
    ipAddress: "197.232.0.1"
  },
  {
    id: "acceptance-2",
    termsId: "terms-global-v1",
    termsVersion: "1.0.0",
    userId: "user-af-director",
    userName: "Amina Okonkwo",
    acceptedAt: "2026-07-01T09:15:00Z",
    method: "ClickWrap"
  },
  {
    id: "acceptance-3",
    termsId: "terms-agent-v1",
    termsVersion: "1.0.0",
    userId: "sales-agent-westlands-1",
    userName: "Peter Otieno",
    acceptedAt: "2026-07-02T10:30:00Z",
    method: "ClickWrap"
  }
];
