import { createHash, randomBytes } from "node:crypto";
import {
  CLAIM_DECLARATION,
  CLAIM_DECLARATION_VERSION,
  checkSignature,
  estimateVehicleValue,
  expiryStatus,
  jpegSize,
  makePdf,
  policiesOfCustomer,
  type Conversation,
  type Customer,
  type PdfBlock,
  type SignatureRecord
} from "@insuros/domain";
import { getPersistence, resolveTenantId } from "./persistence";
import { photoStorage, type PhotoStorage } from "./photo-storage";
import { MessagingService } from "./messaging";

const day = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });
const kes = (value: number) => `KES ${Math.round(value).toLocaleString("en-GB")}`;

async function fetchBytes(storage: PhotoStorage, path: string): Promise<Uint8Array | null> {
  const link = await storage.link(path, 120);
  if (!link) return null;
  try {
    const response = await fetch(link, { signal: AbortSignal.timeout(15_000) });
    return response.ok ? new Uint8Array(await response.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/**
 * Documents people fill, sign and download without printing: the signed
 * claim declaration, the claim pack (details, messages, photos with their
 * fingerprints, signature) and the customer's cover summary.
 */
export class DocumentService {
  constructor(private readonly storage: PhotoStorage = photoStorage()) {}

  private get db() {
    return getPersistence();
  }

  async signaturesFor(conversationId: string): Promise<SignatureRecord[]> {
    return (await this.db.signatures.findWhere((record) => record.conversationId === conversationId)).sort((a, b) => a.signedAt.localeCompare(b.signedAt));
  }

  /** The customer signs the claim declaration on their phone. */
  async signClaimDeclaration(
    conversation: Conversation,
    input: { name: unknown; agreed: unknown; image: Uint8Array },
    now: Date = new Date()
  ): Promise<{ ok: true; record: SignatureRecord } | { ok: false; error: string }> {
    if (conversation.kind !== "customer" || conversation.topic !== "claim") return { ok: false, error: "There is nothing to sign here." };
    const check = checkSignature(input);
    if (!check.ok) return check;
    const reference = conversation.reference ?? conversation.id;
    const imagePath = `${await resolveTenantId()}/${reference}/signature-${now.getTime().toString(36)}-${randomBytes(6).toString("hex")}.jpg`;
    try {
      await this.storage.put(imagePath, input.image, "image/jpeg");
    } catch {
      return { ok: false, error: "The signature could not be saved. Try again." };
    }
    const record: SignatureRecord = {
      id: `sig-${now.getTime().toString(36)}-${randomBytes(4).toString("hex")}`,
      conversationId: conversation.id,
      reference,
      signerName: check.name,
      statement: CLAIM_DECLARATION,
      statementVersion: CLAIM_DECLARATION_VERSION,
      signedAt: now.toISOString(),
      imagePath,
      sha256: createHash("sha256").update(input.image).digest("hex")
    };
    await this.db.signatures.insert(record);
    if (conversation.customerAccessHash) {
      await new MessagingService().customerReply(conversation.customerAccessHash, `I have signed the claim declaration as ${check.name}.`, now);
    }
    return { ok: true, record };
  }

  /** Everything on one claim, as a PDF to keep or send to the insurer. */
  async claimPack(conversation: Conversation, now: Date = new Date()): Promise<Uint8Array> {
    const reference = conversation.reference ?? conversation.id;
    const [messages, photos, signatures] = await Promise.all([
      new MessagingService().messagesOf(conversation.id),
      this.db.scenePhotos.findWhere((photo) => photo.claimReference === reference && Boolean(photo.storagePath)),
      this.signaturesFor(conversation.id)
    ]);
    const blocks: PdfBlock[] = [
      {
        kind: "pairs",
        rows: [
          ["Customer", conversation.customerName ?? "Customer"],
          ["Claim or reference", reference],
          ["Handled by", conversation.ownerName ?? "Not yet assigned"],
          ["Opened", day(conversation.createdAt)],
          ["Status", conversation.status === "open" ? "Open" : "Closed"]
        ]
      },
      { kind: "heading", text: "Messages" },
      ...messages.map((message): PdfBlock => ({
        kind: "text",
        text: `${message.author.kind === "customer" ? `${message.author.name} (customer)` : message.author.name}, ${day(message.createdAt)}: ${message.body}`
      }))
    ];
    if (photos.length > 0) {
      blocks.push(
        { kind: "heading", text: `Photos (${photos.length})` },
        {
          kind: "table",
          headers: ["Shot", "Taken", "Received", "Location", "Fingerprint (SHA-256)"],
          widths: [1.2, 1, 1, 0.8, 2.2],
          rows: photos.map((photo) => [
            photo.slot ?? "",
            day(photo.capturedAt),
            day(photo.receivedAt),
            photo.latitude !== undefined ? `within ${photo.geoAccuracyMeters} m` : "none",
            photo.sha256
          ])
        }
      );
      for (const photo of photos.slice(0, 12)) {
        const bytes = photo.viewPath ? await fetchBytes(this.storage, photo.viewPath) : null;
        const size = bytes ? jpegSize(bytes) : null;
        if (bytes && size) blocks.push({ kind: "image", jpeg: bytes, ...size, caption: `${photo.slot ?? "Photo"}: clear copy for viewing; the original is kept as evidence.` });
      }
    }
    for (const signature of signatures) {
      blocks.push(
        { kind: "heading", text: "Declaration" },
        { kind: "text", text: signature.statement },
        { kind: "pairs", rows: [["Signed by", signature.signerName], ["Signed on", day(signature.signedAt)], ["Signature fingerprint", signature.sha256]] }
      );
      const bytes = await fetchBytes(this.storage, signature.imagePath);
      const size = bytes ? jpegSize(bytes) : null;
      if (bytes && size) blocks.push({ kind: "image", jpeg: bytes, ...size, caption: "Signature drawn on screen" });
    }
    return makePdf({ title: `Claim pack: ${conversation.subject}`, subtitle: `Prepared ${day(now.toISOString())}`, footer: `InsurOS, ${reference}`, blocks });
  }

  /** A customer's cover in one PDF: what is insured, values, cover dates. */
  async coverSummary(customer: Customer, now: Date = new Date()): Promise<Uint8Array> {
    const policies = policiesOfCustomer(await this.db.policies.findAll(), customer);
    const rows = policies.map((policy) => {
      const value = estimateVehicleValue(policy, now);
      return [
        policy.insuredItem ?? policy.product,
        `${policy.product}, ${policy.policyNumber}`,
        policy.sumInsured ? kes(policy.sumInsured) : "",
        value?.estimateToday ? kes(value.estimateToday) : "",
        policy.premium,
        policy.startDate && policy.expiryDate ? `${policy.startDate} to ${policy.expiryDate}` : "",
        expiryStatus(policy.expiryDate, now).words
      ];
    });
    return makePdf({
      title: `My cover: ${customer.name}`,
      subtitle: `As recorded on ${day(now.toISOString())}. Your policy schedule decides; values today are estimates.`,
      footer: "InsurOS",
      blocks: [
        {
          kind: "table",
          headers: ["Insured", "Policy", "Value insured", "Est. value today", "Premium", "Cover", "Status"],
          widths: [1.3, 1.6, 1, 1, 0.9, 1.4, 1.1],
          rows
        }
      ]
    });
  }
}
