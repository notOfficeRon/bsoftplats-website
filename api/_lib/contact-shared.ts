/**
 * Server env vars for contact API (Vercel + local):
 * - TURNSTILE_SECRET_KEY
 * - RESEND_API_KEY
 * - CONTACT_FROM_EMAIL
 * - CONTACT_TO_EMAIL
 * - CONTACT_VERIFY_SECRET (long random string for JWT signing)
 * - SITE_URL (e.g. https://bsoftplats.com — used in magic links)
 */
import { createHmac, randomBytes } from "node:crypto";
import { resolveMx } from "node:dns/promises";

export type ContactReason = "business" | "apply";

export type InquiryPayload = {
  reason: ContactReason;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobRole: string;
  country: string;
  hearAbout: string;
  message: string;
};

export type SignedInquiryToken = InquiryPayload & {
  iat: number;
  exp: number;
  jti: string;
};

export const SUBJECT: Record<ContactReason, string> = {
  business: "Business inquiry",
  apply: "Job application",
};

const TOKEN_TTL_SECONDS = 5 * 60;

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "fastmail.com",
  "tutanota.com",
  "hey.com",
]);

const JUNK_LOCAL_PARTS = new Set([
  "test",
  "testing",
  "asdf",
  "qwerty",
  "fake",
  "spam",
  "noreply",
  "no-reply",
  "admin",
  "info",
  "hello",
  "abc",
  "123",
  "1234",
  "12345",
]);

export function str(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function isReason(value: unknown): value is ContactReason {
  return value === "business" || value === "apply";
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function base64url(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

export function signInquiryToken(payload: InquiryPayload, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SignedInquiryToken = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    jti: randomBytes(16).toString("hex"),
  };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyInquiryToken(token: string, secret: string): SignedInquiryToken | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const expected = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  if (signature !== expected) return null;

  let payload: SignedInquiryToken;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SignedInquiryToken;
  } catch {
    return null;
  }

  if (!isReason(payload.reason)) return null;
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (!payload.email || !payload.firstName || !payload.lastName) return null;

  return payload;
}

function emailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function localPart(email: string) {
  return email.split("@")[0]?.toLowerCase() ?? "";
}

function isRepeatedChars(value: string) {
  return /^(.)\1{4,}$/.test(value);
}

export function validateBusinessEmail(email: string): { ok: true } | { ok: false; message: string } {
  const local = localPart(email);
  const domain = emailDomain(email);

  if (local.length < 2 || local.length > 64) {
    return { ok: false, message: "Please use a valid business email address." };
  }
  if (JUNK_LOCAL_PARTS.has(local) || isRepeatedChars(local)) {
    return { ok: false, message: "Please use a serious business email address." };
  }
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) {
    return {
      ok: false,
      message: "Business inquiries require a company email address (not Gmail, Yahoo, etc.).",
    };
  }

  return { ok: true };
}

export async function domainHasMx(domain: string) {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function validateBusinessEmailWithMx(email: string) {
  const basic = validateBusinessEmail(email);
  if (!basic.ok) return basic;

  const domain = emailDomain(email);
  const hasMx = await domainHasMx(domain);
  if (!hasMx) {
    return { ok: false as const, message: "That email domain does not look like a valid business domain." };
  }

  return { ok: true as const };
}

export async function verifyTurnstile(token: string, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const payload = new URLSearchParams();
  payload.set("secret", secret);
  payload.set("response", token);
  if (ip) payload.set("remoteip", ip);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: payload,
      signal: controller.signal,
    });
    const data = (await result.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.error("[contact] turnstile verification failed", error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:5173";
}

export function formatInquiryText(payload: InquiryPayload) {
  const name = `${payload.firstName} ${payload.lastName}`.trim();
  const subject = SUBJECT[payload.reason];
  return [
    `Reason: ${subject}`,
    `Name: ${name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    `Company: ${payload.company}`,
    `Job role: ${payload.jobRole}`,
    `Country: ${payload.country || "—"}`,
    `How they heard: ${payload.hearAbout || "—"}`,
    "",
    payload.message || "(no message)",
  ].join("\n");
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    return { ok: false as const, status: 500, body: "missing resend config" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [input.to],
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
      }),
      signal: controller.signal,
    });

    if (!send.ok) {
      const body = await send.text();
      return { ok: false as const, status: send.status, body };
    }

    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, status: 504, body: String(error) };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    toEmail: process.env.CONTACT_TO_EMAIL,
    fromEmail: process.env.CONTACT_FROM_EMAIL,
    verifySecret: process.env.CONTACT_VERIFY_SECRET,
  };
}
