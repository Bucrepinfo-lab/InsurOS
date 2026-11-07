import Link from "next/link";
import { PublicPage } from "@/components/public-page";

export const metadata = {
  title: "Delete your account",
  description: "How to delete your InsurOS account and personal data."
};

const MAILTO =
  "mailto:telpeninfo@gmail.com?subject=" +
  encodeURIComponent("InsurOS account deletion request") +
  "&body=" +
  encodeURIComponent(
    "Please delete my InsurOS account and personal data.\n\nPhone number I sign in with: \nName: \nOrganisation (insurer/agency): \n"
  );

/** Public account-deletion page (Google Play "Delete account URL"). No sign-in needed. */
export default async function DeleteAccountInfoPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <PublicPage title="Delete your InsurOS account" updated="07/11/26">
      {status === "deleted" ? (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          Your account has been deleted and you have been signed out.
        </p>
      ) : null}

      <p>
        InsurOS is an operations app for insurance companies, agencies and their agents, run by
        Telpen Systems Ltd. You can delete your account at any time, in the app or by email.
      </p>

      <h2 className="text-lg font-semibold text-slate-900">Option 1 — in the app (immediate)</h2>
      <ol className="list-decimal space-y-1 pl-6">
        <li>
          <Link href="/sign-in?next=/account/delete" className="underline">
            Sign in
          </Link>{" "}
          with your phone number and the SMS code.
        </li>
        <li>
          Open <strong>Delete account</strong> (top bar, or go to{" "}
          <Link href="/account/delete" className="underline">
            /account/delete
          </Link>
          ).
        </li>
        <li>
          Type <strong>DELETE</strong> and confirm.
        </li>
      </ol>

      <h2 className="text-lg font-semibold text-slate-900">Option 2 — by email</h2>
      <p>
        If you cannot sign in,{" "}
        <a href={MAILTO} className="underline">
          email telpeninfo@gmail.com
        </a>{" "}
        with the subject “InsurOS account deletion request” and the phone number you sign in
        with. We verify the request (we may send an SMS code to that number) and complete the
        deletion within 30 days, usually much sooner, then confirm by email.
      </p>

      <h2 className="text-lg font-semibold text-slate-900">What is deleted</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Your sign-in account (phone number and login record).</li>
        <li>Your staff profile: name, phone number and role/jurisdiction grants.</li>
      </ul>

      <h2 className="text-lg font-semibold text-slate-900">What is kept, and why</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Payment-ledger entries are kept as anonymous financial records (your phone number is
          removed) because financial records must not be altered or deleted.
        </li>
        <li>
          Policy and claim records you worked on belong to the insurer or agency you worked for;
          they keep them under their own legal retention duties. Contact them for those records.
        </li>
        <li>
          Audit-trail entries of actions taken in an organisation’s workspace stay with that
          organisation’s records.
        </li>
      </ul>

      <p>
        See the <Link href="/privacy" className="underline">privacy policy</Link> for full details.
      </p>
    </PublicPage>
  );
}
