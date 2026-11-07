import { PublicPage } from "@/components/public-page";
import { TERMS_META, TERMS_SECTIONS } from "@/content/terms";

export const metadata = {
  title: "Terms & conditions",
  description: "InsurOS platform terms and conditions — Telpen Systems Ltd."
};

/** Public terms page (generated from docs/TERMS_AND_CONDITIONS.md). No sign-in needed. */
export default function TermsPage() {
  return (
    <PublicPage title="InsurOS terms & conditions" updated={TERMS_META.effective}>
      <p className="text-sm text-slate-500">
        Version {TERMS_META.version} · Provider: {TERMS_META.provider} · {TERMS_META.jurisdiction}
      </p>
      {TERMS_SECTIONS.map((section) => (
        <section key={section.heading} className="space-y-2">
          <h2 className="pt-4 text-lg font-semibold text-slate-900">{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      ))}
      <p className="pt-4">
        Questions: <a className="underline" href="mailto:telpeninfo@gmail.com">telpeninfo@gmail.com</a>
      </p>
    </PublicPage>
  );
}
