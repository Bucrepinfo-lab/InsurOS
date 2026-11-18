/**
 * Signing on screen — PURE.
 *
 * A customer signs the claim declaration with a finger on their own phone.
 * What is kept: the exact words they agreed to, the name they typed, the
 * signature picture with its fingerprint, and when. Kenyan law accepts
 * electronic signatures for most documents (Kenya Information and
 * Communications Act; Business Laws (Amendment) Act 2020); an insurer may
 * still ask for a wet signature on some forms.
 */
export const CLAIM_DECLARATION_VERSION = "2026-11-18";

export const CLAIM_DECLARATION =
  "I declare that what I have written and the photos I have sent about this claim are true and complete to the best of my knowledge. " +
  "I have not left out anything I know about the loss. I agree that the insurer may check the details, contact the people involved and ask me for more information. " +
  "I understand that a false or exaggerated claim may be refused and may be reported.";

export interface SignatureRecord {
  id: string;
  conversationId: string;
  reference: string;
  signerName: string;
  statement: string;
  statementVersion: string;
  signedAt: string;
  /** Stored signature picture (JPEG). */
  imagePath: string;
  /** SHA-256 of the signature picture. */
  sha256: string;
}

export const MAX_SIGNATURE_BYTES = 400 * 1024;

export type SignatureCheck = { ok: true; name: string } | { ok: false; error: string };

export function checkSignature(input: { name: unknown; agreed: unknown; image: Uint8Array }): SignatureCheck {
  const name = typeof input.name === "string" ? input.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 3 || name.length > 120 || !/^[\p{L} .'-]+$/u.test(name)) return { ok: false, error: "Type your full name as it appears on your ID." };
  if (input.agreed !== "yes") return { ok: false, error: "Tick the box to agree to the declaration." };
  if (input.image.byteLength < 200 || input.image.byteLength > MAX_SIGNATURE_BYTES) return { ok: false, error: "Sign in the box with your finger, then try again." };
  if (input.image[0] !== 0xff || input.image[1] !== 0xd8) return { ok: false, error: "The signature could not be read. Try again." };
  return { ok: true, name };
}
