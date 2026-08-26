import {
  formatInquiryText,
  getResendConfig,
  sendResendEmail,
  SUBJECT,
  verifyInquiryToken,
} from "../../lib/contact-shared.js";

export async function GET(request: Request) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return Response.json({ ok: false, message: "Missing verification token." }, { status: 400 });
  }

  const { verifySecret, toEmail } = getResendConfig();
  if (!verifySecret || !toEmail || !process.env.RESEND_API_KEY || !process.env.CONTACT_FROM_EMAIL) {
    console.error("[contact] verify missing env", { requestId });
    return Response.json({ ok: false, message: "Contact is not configured yet." }, { status: 500 });
  }

  const payload = verifyInquiryToken(token, verifySecret);
  if (!payload) {
    console.warn("[contact] verify token invalid or expired", { requestId });
    return Response.json(
      { ok: false, message: "This verification link is invalid or has expired." },
      { status: 400 },
    );
  }

  const name = `${payload.firstName} ${payload.lastName}`.trim();
  const subject = SUBJECT[payload.reason];
  const text = formatInquiryText(payload);

  const forward = await sendResendEmail({
    to: toEmail,
    replyTo: payload.email,
    subject: `[BSoftPlats] ${subject} — ${name}`,
    text,
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
