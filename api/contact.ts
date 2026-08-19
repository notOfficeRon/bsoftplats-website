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

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: payload,
  });
  const data = (await result.json()) as { success?: boolean };
  return Boolean(data.success);
}

export async function POST(request: Request) {
  let body: ContactRequest;
  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
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
    return Response.json({ ok: false, message: "Please agree to the privacy terms." }, { status: 400 });
  }
  if (!isReason(reason)) {
    return Response.json({ ok: false, message: "Please choose a contact reason." }, { status: 400 });
  }
  if (firstName.length < 1) {
    return Response.json({ ok: false, message: "Please enter your first name." }, { status: 400 });
  }
  if (lastName.length < 1) {
    return Response.json({ ok: false, message: "Please enter your last name." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return Response.json({ ok: false, message: "Please enter a valid email." }, { status: 400 });
  }
  if (company.length < 1) {
    return Response.json({ ok: false, message: "Please enter your company." }, { status: 400 });
  }
  if (jobRole.length < 1) {
    return Response.json({ ok: false, message: "Please select your job role." }, { status: 400 });
  }
  if (!token) {
    return Response.json({ ok: false, message: "Bot check expired. Go back and try again." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    return Response.json({ ok: false, message: "Bot check failed. Go back and try again." }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) {
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
  });

  if (!send.ok) {
    return Response.json({ ok: false, message: "Could not send the message. Try again later." }, { status: 502 });
  }

  return Response.json({ ok: true, message: "Message sent. We'll get back to you." });
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ ok: false }, { status: 405 });
  }
  return POST(request);
}
