import {
  getResendConfig,
  getSiteUrl,
  isEmail,
  isReason,
  signInquiryToken,
  sendResendEmail,
  str,
  SUBJECT,
  validateBusinessEmailWithMx,
  verifyTurnstile,
  type InquiryPayload,
} from "../lib/contact-shared.js";

type ContactRequest = {
  firstName?: string;
  lastName?: string;
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

export async function POST(request: Request) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.info("[contact] submit received", { requestId });

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
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const company = str(body.company, 120);
  const jobRole = str(body.jobRole, 80);
  const country = str(body.country, 80);
  const hearAbout = str(body.hearAbout, 80);
  const message = str(body.message, 4000);
  const turnstileToken = str(body.token, 2048);
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
  if (!turnstileToken) {
    return Response.json({ ok: false, message: "Bot check expired. Go back and try again." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const human = await verifyTurnstile(turnstileToken, ip);
  if (!human) {
    console.warn("[contact] turnstile failed", { requestId });
    return Response.json({ ok: false, message: "Bot check failed. Go back and try again." }, { status: 403 });
  }

  if (reason === "business") {
    const businessEmail = await validateBusinessEmailWithMx(email);
    if (!businessEmail.ok) {
      console.warn("[contact] business email rejected", { requestId, email });
      return Response.json({ ok: false, message: businessEmail.message }, { status: 400 });
    }
  }

  const { verifySecret, fromEmail } = getResendConfig();
  if (!verifySecret || !fromEmail || !process.env.RESEND_API_KEY) {
    console.error("[contact] missing env configuration", {
      requestId,
      hasVerifySecret: Boolean(verifySecret),
      hasFromEmail: Boolean(fromEmail),
      hasApiKey: Boolean(process.env.RESEND_API_KEY),
    });
    return Response.json({ ok: false, message: "Contact is not configured yet." }, { status: 500 });
  }

  const inquiry: InquiryPayload = {
    reason,
    firstName,
    lastName,
    email,
    phone,
    company,
    jobRole,
    country,
    hearAbout,
    message,
  };

  const jwt = signInquiryToken(inquiry, verifySecret);
  const verifyUrl = `${getSiteUrl()}/verify-contact?token=${encodeURIComponent(jwt)}`;
  const subjectLabel = SUBJECT[reason];

  const verifyEmail = await sendResendEmail({
    to: email,
    subject: "Confirm your BSoftPlats inquiry",
    text: [
      `Hi ${firstName},`,
      "",
      `Please confirm your ${subjectLabel.toLowerCase()} by clicking the link below:`,
      "",
      verifyUrl,
      "",
      "This link expires in 5 minutes.",
      "",
      "If you did not submit this request, you can ignore this email.",
    ].join("\n"),
  });

  if (!verifyEmail.ok) {
    console.error("[contact] verification email failed", {
      requestId,
      status: verifyEmail.status,
      body: verifyEmail.body,
    });
    return Response.json({ ok: false, message: "Could not send verification email. Try again later." }, { status: 502 });
  }

  console.info("[contact] verification email sent", { requestId });
  return Response.json({
    ok: true,
    message: "Check your email to confirm your inquiry (link expires in 5 minutes).",
  });
}

export async function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
