type ContactReason = "business" | "apply" | "partnership" | "other";

type ContactRequest = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobRole?: string;
  country?: string;
  hearAbout?: string;
  message?: string;
  reason?: string;
  token?: string;
  agreed?: boolean;
  website?: string;
};

const SUBJECT: Record<ContactReason, string> = {
  business: "Business inquiry",
  apply: "Job application",
  partnership: "Partnership",
  other: "General inquiry",
};

function isReason(value: unknown): value is ContactReason {
  return value === "business" || value === "apply" || value === "partnership" || value === "other";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function str(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

async function verifyTurnstile(token: string, ip: string | null) {
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

export async function POST(request: Request) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.info("[contact] request received", { requestId });
  let body: ContactRequest;
  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    console.warn("[contact] invalid json body", { requestId });
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    console.warn("[contact] honeypot tripped", { requestId });
    return Response.json({ ok: true });
  }

  const firstName = str(body.firstName, 80);
  const lastName = str(body.lastName, 80);
  const name =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : str(body.name, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const company = str(body.company, 120);
  const jobRole = str(body.jobRole, 80);
  const country = str(body.country, 80);
  const hearAbout = str(body.hearAbout, 80);
  const message = str(body.message, 4000);
  const token = str(body.token, 2048);
  const reason = body.reason;
  const agreed = body.agreed === true;

  if (!agreed) {
    console.warn("[contact] missing gdpr agreement", { requestId });
    return Response.json({ ok: false, message: "Please agree to the privacy terms." }, { status: 400 });
  }
  if (!isReason(reason)) {
    console.warn("[contact] invalid reason", { requestId, reason });
    return Response.json({ ok: false, message: "Please choose a contact reason." }, { status: 400 });
  }
  if (firstName.length < 1) {
    console.warn("[contact] missing first name", { requestId });
    return Response.json({ ok: false, message: "Please enter your first name." }, { status: 400 });
  }
  if (lastName.length < 1) {
    console.warn("[contact] missing last name", { requestId });
    return Response.json({ ok: false, message: "Please enter your last name." }, { status: 400 });
  }
  if (!isEmail(email)) {
    console.warn("[contact] invalid email", { requestId });
    return Response.json({ ok: false, message: "Please enter a valid email." }, { status: 400 });
  }
  if (company.length < 1) {
    console.warn("[contact] missing company", { requestId });
    return Response.json({ ok: false, message: "Please enter your company." }, { status: 400 });
  }
  if (jobRole.length < 1) {
    console.warn("[contact] missing job role", { requestId });
    return Response.json({ ok: false, message: "Please select your job role." }, { status: 400 });
  }
  if (!token) {
    console.warn("[contact] missing turnstile token", { requestId });
    return Response.json({ ok: false, message: "Bot check expired. Go back and try again." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    console.warn("[contact] turnstile verification failed", { requestId, hasIp: Boolean(ip) });
    return Response.json({ ok: false, message: "Bot check failed. Go back and try again." }, { status: 403 });
  }
  console.info("[contact] turnstile verification passed", { requestId });

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) {
    console.error("[contact] missing env configuration", {
      requestId,
      hasApiKey: Boolean(apiKey),
      hasToEmail: Boolean(toEmail),
      hasFromEmail: Boolean(fromEmail),
    });
    return Response.json({ ok: false, message: "Contact is not configured yet." }, { status: 500 });
  }

  const subject = SUBJECT[reason];
  const text = [
    `Reason: ${subject}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `Company: ${company}`,
    `Job role: ${jobRole}`,
    `Country: ${country || "—"}`,
    `How they heard: ${hearAbout || "—"}`,
    "",
    message || "(no message)",
  ].join("\n");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    console.info("[contact] sending with resend", { requestId });
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[B-SoftPlats] ${subject} — ${name}`,
        text,
      }),
      signal: controller.signal,
    });

    if (!send.ok) {
      const resendBody = await send.text();
      console.error("[contact] resend send failed", { requestId, status: send.status, resendBody });
      return Response.json({ ok: false, message: "Could not send the message. Try again later." }, { status: 502 });
    }
  } catch (error) {
    console.error("[contact] resend request failed", { requestId, error });
    return Response.json({ ok: false, message: "Send timed out. Please try again." }, { status: 504 });
  } finally {
    clearTimeout(timeoutId);
  }

  console.info("[contact] send succeeded", { requestId });
  return Response.json({ ok: true, message: "Message sent. We'll get back to you." });
}

export async function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
