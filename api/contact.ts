type ContactReason = "business" | "apply" | "other";

type ContactRequest = {
  name?: string;
  email?: string;
  message?: string;
  reason?: string;
  token?: string;
  agreed?: boolean;
  website?: string;
};

const SUBJECT: Record<ContactReason, string> = {
  business: "Business inquiry",
  apply: "Job application",
  other: "General inquiry",
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const reason = body.reason;
  const agreed = body.agreed === true;

  if (!agreed) {
    return Response.json({ ok: false, message: "Please agree to the privacy terms." }, { status: 400 });
  }
  if (name.length < 1 || name.length > 120) {
    return Response.json({ ok: false, message: "Please enter your name." }, { status: 400 });
  }
  if (!isEmail(email) || email.length > 200) {
    return Response.json({ ok: false, message: "Please enter a valid email." }, { status: 400 });
  }
  if (message.length < 1 || message.length > 4000) {
    return Response.json({ ok: false, message: "Please enter a message." }, { status: 400 });
  }
  if (reason !== "business" && reason !== "apply" && reason !== "other") {
    return Response.json({ ok: false, message: "Please choose a contact reason." }, { status: 400 });
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
    "",
    message,
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
