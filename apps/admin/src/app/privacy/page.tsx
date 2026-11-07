import Link from "next/link";
import type { ReactNode } from "react";
import { PublicPage } from "@/components/public-page";

export const metadata = {
  title: "Privacy policy",
  description: "How Telpen Systems Ltd handles personal data in InsurOS (Kenya Data Protection Act, 2019)."
};

function H({ children }: { children: ReactNode }) {
  return <h2 className="pt-4 text-lg font-semibold text-slate-900">{children}</h2>;
}

/** Public privacy policy (Google Play "Privacy policy URL"). No sign-in needed. */
export default function PrivacyPage() {
  return (
    <PublicPage title="InsurOS privacy policy" updated="07/11/26">
      <p>
        InsurOS is an insurance operations app for insurance companies, agencies and their staff
        and agents. It is not a public insurance shop: you cannot buy insurance or make payments
        through it. This policy explains what personal data InsurOS processes, why, and your rights
        under the <strong>Kenya Data Protection Act, 2019</strong> (the “Act”).
      </p>

      <H>1. Who we are</H>
      <p>
        InsurOS is provided by <strong>Telpen Systems Ltd</strong>, a company registered in Kenya,
        which is the <strong>data controller</strong> for InsurOS accounts. Contact:{" "}
        <a className="underline" href="mailto:telpeninfo@gmail.com">telpeninfo@gmail.com</a>.
      </p>
      <p>
        Insurance records that an organisation (insurer or agency) enters into its InsurOS
        workspace — such as its customers, policies and claims — are that organisation’s records.
        For those records we process data on the organisation’s instructions, and the
        organisation is responsible for its own lawful basis and notices to its customers.
      </p>

      <H>2. What we collect</H>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Account data (staff and agents):</strong> mobile phone number (your sign-in), the
          one-time SMS code used to sign in, your name, your role and the region you are assigned
          to, who granted that access and when, and a session cookie that keeps you signed in.
        </li>
        <li>
          <strong>Work records you create or view:</strong> customer details (such as name and phone
          number), policy records (cover, premium amounts, dates) and claim records (incident
          description, date, amount claimed, supporting documents and decisions).
        </li>
        <li>
          <strong>Claim evidence photos:</strong> where a claim includes scene photos, InsurOS stores
          the photo, the time it was taken, its <strong>GPS location</strong> and accuracy, the
          device model and a tamper-check fingerprint (hash), so the insurer can verify the
          evidence. Location is only collected as part of claim evidence, never in the background.
        </li>
        <li>
          <strong>Audit trail:</strong> which account performed which action and when, so
          organisations can account for decisions.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> collect payment card or mobile-money details (payments are
        switched off in this version), contacts, or advertising identifiers, and we do not use
        advertising or third-party analytics.
      </p>

      <H>3. Why we use it (purpose and lawful basis)</H>
      <ul className="list-disc space-y-1 pl-6">
        <li>To sign you in securely and keep each person to the areas their role allows — performance of the contract with your organisation and our legitimate interest in security.</li>
        <li>To let organisations run policy and claim operations — on the organisation’s instructions and for the insurance contracts concerned.</li>
        <li>To keep audit records and meet legal duties of insurers and agencies — legal obligation and legitimate interest.</li>
      </ul>
      <p>We do not sell personal data and do not use it for automated decisions that legally affect you: claim decisions are made by people.</p>

      <H>4. Who we share it with</H>
      <ul className="list-disc space-y-1 pl-6">
        <li><strong>Your organisation</strong> — administrators of the insurer/agency you work for.</li>
        <li><strong>Supabase</strong> — sign-in and account service.</li>
        <li><strong>Africa’s Talking</strong> — to send the SMS sign-in code to your phone.</li>
        <li><strong>Fly.io</strong> — application hosting.</li>
        <li>
          <strong>Anthropic</strong> — only if an organisation switches on optional wording help
          for claim-decision notices; it receives the claim reference and standard decision
          wording, not names, phone numbers, photos or fraud details. Off by default.
        </li>
        <li>Authorities, where the law requires it.</li>
      </ul>

      <H>5. Where it is stored (transfers outside Kenya)</H>
      <p>
        Our servers are hosted in the European Union (Frankfurt, Germany) and our service
        providers may process data outside Kenya. We transfer data only with the safeguards the
        Act requires (sections 48–50), such as contractual protections and providers with
        appropriate security.
      </p>

      <H>6. How long we keep it</H>
      <ul className="list-disc space-y-1 pl-6">
        <li>Account data: while your account is active. When you delete your account it is erased straight away (see below).</li>
        <li>Organisation records (customers, policies, claims, evidence): for as long as the organisation instructs and insurance and tax law require; then deleted.</li>
        <li>Payment-ledger entries (if payments are ever enabled): kept as financial records, with personal details removed when you delete your account.</li>
        <li>Deleted data may remain in encrypted backups until they rotate out.</li>
      </ul>

      <H>7. Deleting your account</H>
      <p>
        You can delete your account in the app (<strong>Delete account</strong>) or by email — see{" "}
        <Link className="underline" href="/delete-account">the account-deletion page</Link>. This
        deletes your sign-in account and erases your staff profile (name, phone and role grants).
      </p>

      <H>8. Your rights</H>
      <p>
        Under section 26 of the Act you may ask to be informed of how your data is used, to access
        it, to correct or delete it, and to object to its processing. Email{" "}
        <a className="underline" href="mailto:telpeninfo@gmail.com">telpeninfo@gmail.com</a>; we
        respond within the time the Act allows. For records held by an insurer or agency, we will
        pass your request to them. You may also complain to the{" "}
        <strong>Office of the Data Protection Commissioner</strong> (odpc.go.ke).
      </p>

      <H>9. Security</H>
      <p>
        Data is encrypted in transit (HTTPS). Access is role-based and enforced on our servers:
        each person sees only their own department’s work; administrators have the overall view.
        Sign-in uses one-time SMS codes.
      </p>

      <H>10. Children</H>
      <p>InsurOS is a workplace tool for adults (18+). It is not directed at children.</p>

      <H>11. Changes</H>
      <p>
        We will post changes here and update the date above; material changes will be notified in
        the app.
      </p>
    </PublicPage>
  );
}
