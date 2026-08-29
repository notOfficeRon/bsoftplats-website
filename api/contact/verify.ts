import {
  formatInquiryText,
  getResendConfig,
  sendResendEmail,
  SUBJECT,
  verifyInquiryToken,
} from "../../lib/contact-shared.js";

const RESUME_MAX_BYTES = 2 * 1024 * 1024;
const RESUME_TYPES = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

async function forwardInquiry(
  payload: NonNullable<ReturnType<typeof verifyInquiryToken>>,
  requestId: string,
  attachment?: { filename: string; content: string },
) {
  const { toEmail } = getResendConfig();
  if (!toEmail) {
    return Response.json({ ok: false, message: "Contact is not configured yet." }, { status: 500 });
  }

  const name = `${payload.firstName} ${payload.lastName}`.trim();
  const subject = SUBJECT[payload.reason];
  const text = formatInquiryText(payload);

  const forward = await sendResendEmail({
    to: toEmail,
    replyTo: payload.email,
    subject: `[BSoftPlats] ${subject} — ${name}`,
    text,
    attachments: attachment ? [attachment] : undefined,
  });

  if (!forward.ok) {
    console.error("[contact] forward failed", {
      requestId,
      status: forward.status,
      body: forward.body,
    });
    return Response.json({ ok: false, message: "Could not send your inquiry. Try again later." }, { status: 502 });
  }

  console.info("[contact] inquiry forwarded", { requestId, reason: payload.reason });
  return Response.json({ ok: true, message: "Your inquiry has been confirmed and sent." });
}

function envReady() {
  const { verifySecret, toEmail } = getResendConfig();
  return Boolean(verifySecret && toEmail && process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL);
}

export async function GET(request: Request) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return Response.json({ ok: false, message: "Missing verification token." }, { status: 400 });
  }

  if (!envReady()) {
    console.error("[contact] verify missing env", { requestId });
    return Response.json({ ok: false, message: "Contact is not configured yet." }, { status: 500 });
  }

  const payload = verifyInquiryToken(token, getResendConfig().verifySecret!);
  if (!payload) {
    console.warn("[contact] verify token invalid or expired", { requestId });
    return Response.json(
      { ok: false, message: "This verification link is invalid or has expired." },
      { status: 400 },
    );
  }

  if (payload.reason === "apply") {
    return Response.json(
      { ok: false, message: "This application needs a resume upload on the confirmation page." },
      { status: 400 },
    );
  }

  return forwardInquiry(payload, requestId);
}

export async function POST(request: Request) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (!envReady()) {
    console.error("[contact] verify missing env", { requestId });
    return Response.json({ ok: false, message: "Contact is not configured yet." }, { status: 500 });
  }

  let token = "";
  let filename = "resume.pdf";
  let contentType = "";
  let bytes: Uint8Array | null = null;

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  if (contentTypeHeader.includes("multipart/form-data")) {
    const form = await request.formData();
    token = strForm(form.get("token"));
    const file = form.get("resume");
    if (file instanceof File) {
      filename = file.name || filename;
      contentType = file.type;
      if (file.size > RESUME_MAX_BYTES) {
        return Response.json({ ok: false, message: "Resume must be 2MB or smaller." }, { status: 400 });
      }
      bytes = new Uint8Array(await file.arrayBuffer());
    }
  } else {
    try {
      const body = (await request.json()) as { token?: string; filename?: string; content?: string; type?: string };
      token = typeof body.token === "string" ? body.token.trim() : "";
      if (typeof body.content === "string" && body.content.length > 0) {
        filename = typeof body.filename === "string" && body.filename.trim() ? body.filename.trim() : filename;
        contentType = typeof body.type === "string" ? body.type : "application/pdf";
        const raw = Buffer.from(body.content, "base64");
        if (raw.byteLength > RESUME_MAX_BYTES) {
          return Response.json({ ok: false, message: "Resume must be 2MB or smaller." }, { status: 400 });
        }
        bytes = raw;
      }
    } catch {
      return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
    }
  }

  if (!token) {
    return Response.json({ ok: false, message: "Missing verification token." }, { status: 400 });
  }

  const payload = verifyInquiryToken(token, getResendConfig().verifySecret!);
  if (!payload) {
    console.warn("[contact] verify token invalid or expired", { requestId });
    return Response.json(
      { ok: false, message: "This verification link is invalid or has expired." },
      { status: 400 },
    );
  }

  if (payload.reason !== "apply") {
    return forwardInquiry(payload, requestId);
  }

  if (!bytes || bytes.byteLength < 1) {
    return Response.json({ ok: false, message: "Resume appears to be missing, please reupload it." }, { status: 400 });
  }

  if (contentType && !RESUME_TYPES.has(contentType) && !filename.toLowerCase().endsWith(".pdf")) {
    return Response.json({ ok: false, message: "Please upload a PDF resume." }, { status: 400 });
  }

  const content = Buffer.from(bytes).toString("base64");
  return forwardInquiry(payload, requestId, { filename, content });
}

function strForm(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
