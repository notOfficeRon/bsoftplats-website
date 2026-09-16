import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import gdprBadge from "@/images/gdpr.png";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

const REASONS = [
  { id: "business", label: "Business inquiry", hint: "Partnerships, delivery, or product work." },
  { id: "apply", label: "Apply for an opening", hint: "Join the BSoftPlats team." },
] as const;

type ContactReason = (typeof REASONS)[number]["id"];
type FormModalStep = "reason" | "details" | "questions" | "resume" | "submit";
type YesNo = "yes" | "no";
type RequiredFieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "company"
  | "jobRole"
  | "hearAbout"
  | "phone"
  | "country"
  | "message"
  | "agreed"
  | "workEu"
  | "urgent"
  | "hoursOverlap"
  | "roleExperience"
  | "englishClients"
  | "resume";

const RESUME_MAX_BYTES = 2 * 1024 * 1024;
const RESUME_STORAGE_PREFIX = "bsoftplats-resume-";

type StoredResume = { name: string; type: string; content: string };

function resumeStorageKey(jti: string) {
  return `${RESUME_STORAGE_PREFIX}${jti}`;
}

function fileToStoredResume(file: File) {
  return new Promise<StoredResume>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve({
        name: file.name,
        type: file.type || "application/pdf",
        content: comma >= 0 ? result.slice(comma + 1) : result,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function YesNoRow({
  label,
  value,
  onChange,
  pulse,
}: {
  label: string;
  value: YesNo | "";
  onChange: (next: YesNo) => void;
  pulse?: boolean;
}) {
  return (
    <div className={`border p-4 ${pulse ? "border-red-400" : "border-white/15"}`}>
      <p className="mb-3 text-sm font-medium text-white">{label}</p>
      <div className="flex gap-2">
        {(["yes", "no"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              value === option ? "bg-white text-black" : "border border-white/20 text-zinc-200 hover:border-white/50"
            }`}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

function reasonLabel(reason: ContactReason | "") {
  return REASONS.find((item) => item.id === reason)?.label ?? "";
}

const HEAR_ABOUT = ["LinkedIn", "Google", "Referral", "Event / conference", "Other"] as const;
const JOB_ROLES = [
  "Founder / CEO",
  "CTO / VP Engineering",
  "Engineering Manager",
  "Software Engineer",
  "Product Manager",
  "Recruiter / HR",
  "Consultant",
  "Student",
  "Other",
] as const;
const COUNTRIES = [
  "Israel",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Spain",
  "Italy",
  "Portugal",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Ireland",
  "Switzerland",
  "Austria",
  "Belgium",
  "Poland",
  "Czech Republic",
  "Romania",
  "Ukraine",
  "Canada",
  "Mexico",
  "Brazil",
  "Argentina",
  "India",
  "Singapore",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "United Arab Emirates",
  "South Africa",
  "Other",
] as const;

const fieldClass =
  "h-11 w-full rounded-lg border border-white/[0.12] bg-surface-deep px-3 text-sm text-white outline-none placeholder:text-white/50";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

function turnstileLog(event: string, detail?: Record<string, unknown>) {
  if (detail) {
    console.log(`[turnstile] ${event}`, detail);
    return;
  }
  console.log(`[turnstile] ${event}`);
}

function BotCheck({
  onPassed,
}: {
  onPassed: (token: string) => void;
}) {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      turnstileLog("skip: VITE_TURNSTILE_SITE_KEY is empty. Restart vite after editing .env");
      return;
    }

    turnstileLog("init", {
      siteKeyLength: TURNSTILE_SITE_KEY.length,
      siteKeyPrefix: TURNSTILE_SITE_KEY.slice(0, 6),
    });

    const scriptId = "cf-turnstile";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (!widgetRef.current) {
        turnstileLog("render skipped: widget container not mounted");
        return;
      }
      if (!window.turnstile) {
        turnstileLog("render skipped: window.turnstile missing");
        return;
      }
      if (widgetIdRef.current) {
        turnstileLog("render skipped: already rendered", { widgetId: widgetIdRef.current });
        return;
      }

      turnstileLog("rendering widget");
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: (token) => {
          turnstileLog("passed", { tokenLength: token.length });
          setError("");
          onPassed(token);
        },
        "error-callback": () => {
          turnstileLog("error-callback (hostname mismatch? network? bad site key?)");
          setError("Bot check failed to load. Refresh and try again.");
        },
        "expired-callback": () => {
          turnstileLog("expired-callback: token died, complete it again");
          setError("Bot check expired. Complete it again.");
        },
        "timeout-callback": () => {
          turnstileLog("timeout-callback: challenge timed out");
          setError("Bot check timed out. Refresh and try again.");
        },
      });
      turnstileLog("rendered", { widgetId: widgetIdRef.current });
    };

    if (existing && window.turnstile) {
      turnstileLog("script already loaded, rendering");
      renderWidget();
      return () => {
        widgetIdRef.current = null;
      };
    }

    const script = existing ?? document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      turnstileLog("script loaded");
      renderWidget();
    };
    script.onerror = () => {
      turnstileLog("script failed to load (blocked? adblock? offline?)");
      setError("Could not load Cloudflare Turnstile.");
    };
    if (!existing) {
      turnstileLog("injecting script");
      document.head.appendChild(script);
    } else {
      turnstileLog("waiting for existing script onload");
    }

    return () => {
      widgetIdRef.current = null;
    };
  }, [onPassed]);

  if (!TURNSTILE_SITE_KEY) {
    return (
      <p className="text-sm text-zinc-400">
        Contact is not configured yet. Add a Turnstile site key to enable this step.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <div ref={widgetRef} />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="Close privacy policy"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
        className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden border border-white/[0.12] bg-surface-elevated"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <h2 id="privacy-policy-title" className="text-xl font-semibold text-white sm:text-2xl">
            BSoftPlats’s Privacy
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-6 text-sm leading-relaxed text-zinc-300 sm:px-8">
          <p className="mb-6">
            This notice explains how BSoftPlats handles personal data submitted through the contact
            and job-application form on this website. “We,” “our,” and “us” mean BSoftPlats. “You”
            means the person filling in the form.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">What we collect</h3>
          <p className="mb-3">
            For a business inquiry we collect: first name, last name, email address, phone number
            (if you provide it), company, job role, country (if you provide it), how you heard about
            us (if you provide it), your message, and whether you chose inquiry or application.
          </p>
          <p className="mb-3">
            For a job application we also collect your answers to the screening questions (EU
            citizenship, whether you can start urgently, overlapping hours with Israel and EU
            clients, at least four years in the role, and working in English with clients) and a
            resume file (PDF or Word, maximum 2MB).
          </p>
          <p className="mb-6">
            To stop bots we run Cloudflare Turnstile. That sends a short-lived token and your
            request IP address to Cloudflare so they can tell us whether the submitter looks human.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">What we use it for</h3>
          <p className="mb-3">
            We use this data only to confirm it is you, then to send your inquiry or application to
            BSoftPlats so we can reply. We do not sell it. We do not use it for surveys, employee
            questionnaires, or advertising profiles.
          </p>
          <p className="mb-6">
            If you apply, we treat the submission as a job application, not a general inquiry. That
            includes your resume and the screening answers (including whether you are an EU
            citizen). We use those answers to understand work-eligibility and how you would work
            with Israel and EU clients. We do not ask for health, religion, politics, or similar
            data. If your resume contains extra information you chose to include, we still only use
            the file to evaluate the application.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">How it moves (the pipeline)</h3>
          <p className="mb-3">
            Your browser sends the form to a BSoftPlats function hosted on Vercel. That function
            checks the fields, checks Turnstile, and builds a short-lived signed link (valid for 5
            minutes). We do not keep a BSoftPlats database on Vercel. The form is not stored there
            as a record. After the request finishes, that copy is gone from the application. Vercel
            may still keep operational logs (for example request metadata, and in some failed checks
            an email address) for a limited time on their platform. That is not our inbox and we do
            not use it as a filing system.
          </p>
          <p className="mb-3">
            For applications, the resume stays in your browser until you confirm. It is uploaded
            only on the confirmation request, then attached to the collection email.
          </p>
          <p className="mb-3">
            The function then calls Resend to send email. First, Resend delivers a confirmation
            email to the address you typed. That email contains your first name and a Confirm
            button. The link in that email carries your form fields (not the resume) so we can
            rebuild the inquiry when you click. That message sits in your inbox. If you never
            confirm, we never send the inquiry to BSoftPlats. The confirmation email can remain in
            your inbox until you delete it.
          </p>
          <p className="mb-3">
            After you confirm, Resend delivers a second email to a BSoftPlats collection inbox. That
            email is the full inquiry (and the resume, if you applied). Reply-To is set to your
            email so we can answer you. We do not keep a BSoftPlats mailbox inside Resend. Resend is
            the delivery hop. Resend may keep its own send logs (such as recipient, subject, and
            timestamps) on their side under their retention rules. We do not use Resend as our
            store of inquiries.
          </p>
          <p className="mb-6">
            The copies we treat as stored are: the BSoftPlats collection inbox (only if you
            confirm), and your inbox (the confirmation email). Processors who see data in transit
            are Vercel (the function), Cloudflare (the bot check), and Resend (email delivery).
            Those companies may process data outside the EEA.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Which data goes where</h3>
          <ul className="mb-6 list-disc space-y-2 pl-5">
            <li>
              Name, email, company, role, message, and contact reason: processed in memory on
              Vercel, encoded in the confirmation link in your inbox, and (if you confirm) written
              into the collection email.
            </li>
            <li>
              Phone, country, and how you heard about us: same path, when you provided them.
            </li>
            <li>Application screening answers: same path, for applications only.</li>
            <li>
              Resume: stays in your browser until confirm, then attached to the collection email.
              It is not put in the confirmation email.
            </li>
            <li>
              Turnstile token and IP: sent to Cloudflare, used for the bot check, not put in either
              email.
            </li>
          </ul>

          <h3 className="mb-2 text-base font-semibold text-white">Cookies and local storage</h3>
          <p className="mb-6">
            We do not use analytics cookies on this form to remember your preferences or which pages
            you like. Cloudflare Turnstile may set storage in your browser to run the bot check.
            For applications we keep the resume in your browser so you can confirm from the same
            device. You can clear that by clearing site data.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Legal basis</h3>
          <p className="mb-3">
            We process the form on the basis of your consent, which you give by ticking the box
            before submit. You can withdraw consent by not confirming the email, or by emailing us
            as below. Withdrawal does not undo processing already completed (for example a
            confirmation email already sitting in your inbox).
          </p>
          <p className="mb-6">
            The bot check is necessary so the form is not abused. Confirmation exists so we do not
            send an inquiry or application until you prove you control the email address.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Safety of Minors</h3>
          <p className="mb-6">
            Our services are not intended for and may not be used by minors. “Minors” are
            individuals under the age of majority in their place of residence. BSoftPlats does not
            knowingly collect personal data from minors. If you have reason to believe that this has
            occurred, please contact us at{" "}
            <a className="underline underline-offset-2 hover:text-white" href="mailto:privacy@bsoftplats.com">
              privacy@bsoftplats.com
            </a>
            .
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">
            Other sharing
          </h3>
          <p className="mb-3">
            Besides the processors above, we may share personal data if the law requires it, or to
            defend our rights, or if you ask us to.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Security and storage</h3>
          <p className="mb-6">
            Traffic to the form uses HTTPS. We do not store inquiries in a BSoftPlats database. The
            durable copies are email: yours, and the collection inbox after you confirm. No method
            of sending or storing email is completely secure.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Retention</h3>
          <p className="mb-6">
            The signed confirmation link expires after 5 minutes. If you never confirm, we do not
            send the collection email. Email, once delivered, lives in mailboxes. We cannot delete
            the confirmation message from your inbox. The BSoftPlats collection inbox is ordinary
            email; we do not promise to delete messages from it. Processor logs (Vercel, Cloudflare,
            Resend) follow those companies’ own retention.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Data Subjects Rights</h3>
          <p className="mb-4">
            Under the GDPR you can ask us what personal data we hold about a submission, and you can
            object or ask us to restrict how we use it going forward. We cannot remove a copy that
            already sits in your inbox. We also do not promise to delete a copy that already sits in
            the BSoftPlats collection inbox.
          </p>
          <p className="mb-6">
            You can also complain to a data-protection authority in your country if you think we
            have not handled your data lawfully.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Changes to our Privacy Policy</h3>
          <p className="mb-6">
            We may change this notice. The version in this form is the one that applies to a
            submission you make while it is shown.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">For Data Subjects in the EU</h3>
          <p className="mb-4">
            We appointed GDPR-Rep.eu as representative according to Art 27 GDPR. If you want to make
            use of your GDPR data privacy rights, please visit:{" "}
            <a
              className="underline underline-offset-2 hover:text-white"
              href="https://gdpr-rep.eu/q/19197882"
              target="_blank"
              rel="noreferrer"
            >
              https://gdpr-rep.eu/q/19197882
            </a>
          </p>
          <p className="mb-2">Contact GDPR-Rep.eu:</p>
          <p className="mb-4">
            GDPR-Rep.eu
            <br />
            Maetzler Rechtsanwalts GmbH &amp; Co KG
            <br />
            Attorneys at Law
            <br />
            c/o Valinor L.T.D
            <br />
            Schellinggasse 3/10, 1010 Vienna, Austria
          </p>
          <p className="mb-5">Please add the following subject to all correspondence: GDPR-REP ID: 19197882</p>
          <a
            href="https://gdpr-rep.eu/q/19197882"
            target="_blank"
            rel="noreferrer"
            className="mb-8 block w-full max-w-md"
          >
            <img src={gdprBadge} alt="GDPR Representation certified badge" className="h-auto w-full" />
          </a>

          <h3 className="mb-2 text-base font-semibold text-white">Questions or Comments</h3>
          <p>
            If you have any questions or comments concerning our Privacy Policy, please contact us at{" "}
            <a className="underline underline-offset-2 hover:text-white" href="mailto:privacy@bsoftplats.com">
              privacy@bsoftplats.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ContactFlow({
  showTrigger = true,
  applyOpeningTitle,
}: {
  showTrigger?: boolean;
  applyOpeningTitle?: string;
} = {}) {
  const [formOpen, setFormOpen] = useState(false);
  const [formModalStep, setFormModalStep] = useState<FormModalStep>("reason");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [reason, setReason] = useState<ContactReason | "">("");
  const [hearAbout, setHearAbout] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [workEu, setWorkEu] = useState<YesNo | "">("");
  const [urgent, setUrgent] = useState<YesNo | "">("");
  const [hoursOverlap, setHoursOverlap] = useState<YesNo | "">("");
  const [roleExperience, setRoleExperience] = useState<YesNo | "">("");
  const [englishClients, setEnglishClients] = useState<YesNo | "">("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendOk, setSendOk] = useState(false);
  const [missingPulse, setMissingPulse] = useState<Partial<Record<RequiredFieldKey, boolean>>>({});
  const missingPulseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!applyOpeningTitle) return;
    setReason("apply");
    setJobRole(applyOpeningTitle);
    setFormModalStep("details");
    setFormOpen(true);
  }, [applyOpeningTitle]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setShowTerms(false);
    setSendOk(false);
    setSendError("");
    setTurnstileToken("");
    document.body.style.overflow = "";
  }, []);

  const goBack = useCallback(() => {
    if (formModalStep === "details") {
      setFormModalStep("reason");
      return;
    }
    if (formModalStep === "questions") {
      setFormModalStep("details");
      return;
    }
    if (formModalStep === "resume") {
      setFormModalStep("questions");
      return;
    }
    if (formModalStep === "submit") {
      setTurnstileToken("");
      setFormModalStep(reason === "apply" ? "resume" : "details");
    }
  }, [formModalStep, reason]);

  useEffect(() => {
    if (!formOpen && !showTerms) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !showTerms) closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [formOpen, showTerms, closeForm]);

  const detailsReady =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    company.trim() !== "" &&
    jobRole.trim() !== "" &&
    (reason !== "apply" ||
      (hearAbout.trim() !== "" && phone.trim() !== "" && country.trim() !== "" && message.trim() !== ""));

  const questionsReady =
    workEu !== "" &&
    urgent !== "" &&
    hoursOverlap !== "" &&
    roleExperience !== "" &&
    englishClients !== "";

  const canSend =
    agreed &&
    Boolean(reason) &&
    Boolean(turnstileToken) &&
    detailsReady &&
    (reason !== "apply" || (questionsReady && resumeFile !== null));

  const getMissingRequiredFields = useCallback((): RequiredFieldKey[] => {
    const missing: RequiredFieldKey[] = [];
    if (formModalStep === "details" || formModalStep === "submit") {
      if (firstName.trim() === "") missing.push("firstName");
      if (lastName.trim() === "") missing.push("lastName");
      if (email.trim() === "") missing.push("email");
      if (company.trim() === "") missing.push("company");
      if (jobRole.trim() === "") missing.push("jobRole");
      if (reason === "apply") {
        if (hearAbout.trim() === "") missing.push("hearAbout");
        if (phone.trim() === "") missing.push("phone");
        if (country.trim() === "") missing.push("country");
        if (message.trim() === "") missing.push("message");
      }
    }
    if (formModalStep === "questions") {
      if (workEu === "") missing.push("workEu");
      if (urgent === "") missing.push("urgent");
      if (hoursOverlap === "") missing.push("hoursOverlap");
      if (roleExperience === "") missing.push("roleExperience");
      if (englishClients === "") missing.push("englishClients");
    }
    if (formModalStep === "resume" && !resumeFile) missing.push("resume");
    if (formModalStep === "submit" && !agreed) missing.push("agreed");
    return missing;
  }, [
    formModalStep,
    reason,
    firstName,
    lastName,
    email,
    company,
    jobRole,
    hearAbout,
    phone,
    country,
    message,
    workEu,
    urgent,
    hoursOverlap,
    roleExperience,
    englishClients,
    resumeFile,
    agreed,
  ]);

  const flashMissingFields = useCallback(() => {
    const missing = getMissingRequiredFields();
    if (missing.length === 0) return;

    if (missingPulseTimerRef.current) {
      window.clearTimeout(missingPulseTimerRef.current);
    }

    const nextPulse: Partial<Record<RequiredFieldKey, boolean>> = {};
    missing.forEach((field) => {
      nextPulse[field] = true;
    });
    setMissingPulse(nextPulse);

    missingPulseTimerRef.current = window.setTimeout(() => {
      setMissingPulse({});
      missingPulseTimerRef.current = null;
    }, 850);
  }, [getMissingRequiredFields]);

  const handleBotPassed = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const pickResume = (file: File | null) => {
    setResumeError("");
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.size > RESUME_MAX_BYTES) {
      setResumeFile(null);
      setResumeError("Resume must be 2MB or smaller.");
      return;
    }
    const okType =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf") ||
      file.name.toLowerCase().endsWith(".doc") ||
      file.name.toLowerCase().endsWith(".docx");
    if (!okType) {
      setResumeFile(null);
      setResumeError("Please upload a PDF resume.");
      return;
    }
    setResumeFile(file);
  };

  const submitContact = async () => {
    if (sending || sendOk) return;
    if (!canSend) {
      flashMissingFields();
      return;
    }
    setSendError("");
    setSending(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          reason,
          hearAbout,
          firstName,
          lastName,
          email,
          phone,
          company,
          jobRole,
          country,
          message,
          token: turnstileToken,
          agreed,
          website: honeypot,
          ...(reason === "apply"
            ? { workEu, urgent, hoursOverlap, roleExperience, englishClients }
            : {}),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; jti?: string };
      if (!response.ok || !data.ok) {
        setSendError(data.message || "Could not send. Try again.");
        return;
      }
      if (reason === "apply" && resumeFile && data.jti) {
        try {
          const stored = await fileToStoredResume(resumeFile);
          window.localStorage.setItem(resumeStorageKey(data.jti), JSON.stringify(stored));
        } catch {
          setSendError("Saved your application, but the resume could not be stored on this device. Re-upload it when you open the email link here.");
          setSendOk(true);
          return;
        }
      }
      setSendOk(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setSendError("Send timed out. Please retry in a few seconds.");
        return;
      }
      setSendError("Could not send. Try again later.");
    } finally {
      window.clearTimeout(timeoutId);
      setSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (missingPulseTimerRef.current) {
        window.clearTimeout(missingPulseTimerRef.current);
      }
    };
  }, []);

  const modalTitle =
    formModalStep === "reason"
      ? "What brings you here?"
      : formModalStep === "questions"
        ? "A few questions"
        : formModalStep === "resume"
          ? "Resume"
          : formModalStep === "submit"
            ? "Confirm and send"
            : "Contact form";

  return (
    <>
      {showTrigger ? (
    <div className="relative flex min-h-[280px] items-center justify-center sm:min-h-[300px]">
      <button
        type="button"
        onClick={() => {
          setFormModalStep("reason");
          setFormOpen(true);
        }}
        className="lift-hover flex w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl bg-white px-10 py-12 text-black hover:bg-zinc-200"
      >
        <Mail className="h-8 w-8" />
        <span className="text-3xl font-semibold tracking-tight">Get started</span>
        <span className="text-sm text-zinc-600">Contact form</span>
      </button>
    </div>
      ) : null}

      {formOpen
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
              <button
                type="button"
                className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
                aria-label="Close contact form"
                onClick={closeForm}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="contact-form-title"
                className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-surface-elevated"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-2">
                    {formModalStep !== "reason" && !sendOk ? (
                      <button
                        type="button"
                        onClick={goBack}
                        className="mr-1 inline-flex shrink-0 items-center text-sm text-zinc-400 hover:text-white"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </button>
                    ) : null}
                    <h2 id="contact-form-title" className="truncate text-xl font-semibold text-white">
                      {modalTitle}
                    </h2>
                  </div>
                  <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-white" aria-label="Close">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {sendOk ? (
                  <div className="px-5 py-16 text-center sm:px-6">
                    <p className="mb-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Almost done</p>
                    <p className="text-2xl font-semibold text-white">
                      {reason === "apply"
                        ? "Check your email to confirm your application."
                        : "Check your email to confirm your inquiry."}
                    </p>
                    <p className="mt-3 text-sm text-zinc-400">The link expires in 5 minutes.</p>
                    {reason === "apply" ? (
                      <p className="mt-3 text-sm text-zinc-400">
                        Open it on this same device and browser so your resume can be attached.
                      </p>
                    ) : null}
                    <p className="mt-5 text-sm font-semibold text-red-400">
                      If you don't confirm, your {reason === "apply" ? "application" : "inquiry"} won't send.
                    </p>
                  </div>
                ) : formModalStep === "reason" ? (
                  <div className="overflow-y-auto bg-surface-deep/80 px-5 py-5 sm:px-6">
                    <p className="mb-6 text-sm text-zinc-400">Choose one to continue.</p>
                    <div className="grid gap-3">
                      {REASONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setReason(item.id);
                            setFormModalStep("details");
                          }}
                          className={`border px-4 py-4 text-left transition-colors ${
                            reason === item.id
                              ? "border-white bg-white/10 text-white"
                              : "border-white/15 text-zinc-200 hover:border-white/40"
                          }`}
                        >
                          <span className="block font-semibold">{item.label}</span>
                          <span className="mt-1 block text-sm text-zinc-400">{item.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : formModalStep === "questions" ? (
                  <div className="overflow-y-auto bg-surface-deep/80 px-5 py-5 sm:px-6">
                    <div className="grid gap-3">
                      <YesNoRow
                        label="Are you an EU citizen?"
                        value={workEu}
                        onChange={setWorkEu}
                        pulse={missingPulse.workEu}
                      />
                      <YesNoRow
                        label="Are you able to fill a position urgently?"
                        value={urgent}
                        onChange={setUrgent}
                        pulse={missingPulse.urgent}
                      />
                      <YesNoRow
                        label="Can you work overlapping hours with Israel and EU clients?"
                        value={hoursOverlap}
                        onChange={setHoursOverlap}
                        pulse={missingPulse.hoursOverlap}
                      />
                      <YesNoRow
                        label="Do you have at least 4 years of experience in this role?"
                        value={roleExperience}
                        onChange={setRoleExperience}
                        pulse={missingPulse.roleExperience}
                      />
                      <YesNoRow
                        label="Are you comfortable working in English with clients?"
                        value={englishClients}
                        onChange={setEnglishClients}
                        pulse={missingPulse.englishClients}
                      />
                    </div>
                    <Button
                      size="lg"
                      className="mt-6 rounded-full px-6"
                      onClick={() => {
                        if (!questionsReady) {
                          flashMissingFields();
                          return;
                        }
                        setFormModalStep("resume");
                      }}
                    >
                      Next
                    </Button>
                  </div>
                ) : formModalStep === "resume" ? (
                  <div className="overflow-y-auto bg-surface-deep/80 px-5 py-5 sm:px-6">
                    <label className={labelClass} htmlFor="resume-upload">
                      Resume (PDF, max 2MB)
                    </label>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      onChange={(event) => pickResume(event.target.files?.[0] ?? null)}
                      className={`block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black ${
                        missingPulse.resume ? "rounded-lg ring-2 ring-red-400" : ""
                      }`}
                    />
                    {resumeFile ? <p className="mt-3 text-sm text-zinc-300">{resumeFile.name}</p> : null}
                    {resumeError ? <p className="mt-3 text-sm text-red-400">{resumeError}</p> : null}
                    <p className="mt-4 text-sm text-zinc-500">
                      You will need to confirm from this same device. If you open the email elsewhere, you can re-upload.
                    </p>
                    <Button
                      size="lg"
                      className="mt-6 rounded-full px-6"
                      onClick={() => {
                        if (!resumeFile) {
                          flashMissingFields();
                          return;
                        }
                        setFormModalStep("submit");
                      }}
                    >
                      Next
                    </Button>
                  </div>
                ) : formModalStep === "submit" ? (
                  <div className="overflow-y-auto bg-surface-deep/80 px-5 py-5 sm:px-6">
                    <p className="mb-4 text-xs uppercase tracking-[0.14em] text-zinc-500">{reasonLabel(reason)}</p>
                    <div
                      className={`mb-5 rounded-lg border p-3 text-sm text-white/90 ${
                        missingPulse.agreed
                          ? "border-red-400/70 bg-red-500/10"
                          : "border-white/[0.12] bg-surface-elevated"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          id="gdpr-agree"
                          type="checkbox"
                          checked={agreed}
                          onChange={(event) => setAgreed(event.target.checked)}
                          className="mt-1 h-4 w-4 shrink-0 accent-brand-primary"
                        />
                        <span>
                          <label htmlFor="gdpr-agree" className="cursor-pointer">
                            I have read and agree to BSoftPlats’s Privacy Policy. I consent to a
                            confirmation email being sent to me and, after I confirm, to my inquiry
                            or application being sent to a BSoftPlats collection inbox, as described
                            in that policy.
                          </label>{" "}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-brand-primary underline underline-offset-4 hover:text-brand-primary-bright"
                          >
                            More information
                          </button>
                        </span>
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-zinc-400">Verify you are human, then send.</p>
                    {turnstileToken ? (
                      <p className="mb-4 text-sm text-zinc-300">You're verified.</p>
                    ) : (
                      <div className="mb-4">
                        <BotCheck onPassed={handleBotPassed} />
                      </div>
                    )}
                    {sendError ? <p className="mb-4 text-sm text-red-400">{sendError}</p> : null}
                    <p className="mb-3 text-sm font-bold text-white">
                      We will send you an email for confirmation. Only after you verify that email will we send
                      your {reason === "apply" ? "application" : "inquiry"}.
                    </p>
                    <div
                      onMouseEnter={() => {
                        if (!canSend && !sending) flashMissingFields();
                      }}
                      onFocusCapture={() => {
                        if (!canSend && !sending) flashMissingFields();
                      }}
                    >
                      <Button
                        type="button"
                        size="lg"
                        className={`rounded-full px-6 ${!canSend && !sending ? "cursor-not-allowed opacity-65" : ""}`}
                        disabled={sending}
                        aria-disabled={!canSend || sending}
                        onClick={() => void submitContact()}
                      >
                        {sending ? "Sending…" : "Confirm email"}
                        <Mail className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form
                    className="overflow-y-auto bg-surface-deep/80 px-5 py-5 sm:px-6"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!detailsReady) {
                        flashMissingFields();
                        return;
                      }
                      setFormModalStep(reason === "apply" ? "questions" : "submit");
                    }}
                  >
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(event) => setHoneypot(event.target.value)}
                      className="absolute -left-[9999px] h-0 w-0 opacity-0"
                      aria-hidden="true"
                    />

                    <p className="mb-5 text-xs uppercase tracking-[0.14em] text-zinc-500">{reasonLabel(reason)}</p>

                    <div className="mb-4">
                      <label className={labelClass} htmlFor="hear-about">
                        How did you hear about us?{reason === "apply" ? " *" : ""}
                      </label>
                      {reason === "apply" ? (
                        <input
                          id="hear-about"
                          required
                          value={hearAbout}
                          onChange={(event) => setHearAbout(event.target.value)}
                          className={`${fieldClass} ${
                            missingPulse.hearAbout ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                          }`}
                        />
                      ) : (
                        <select
                          id="hear-about"
                          value={hearAbout}
                          onChange={(event) => setHearAbout(event.target.value)}
                          className={fieldClass}
                        >
                          <option value="">Please Select</option>
                          {HEAR_ABOUT.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="first-name">
                          First name *
                        </label>
                        <input
                          id="first-name"
                          required
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className={`${fieldClass} ${
                            missingPulse.firstName ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="last-name">
                          Last name *
                        </label>
                        <input
                          id="last-name"
                          required
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          className={`${fieldClass} ${
                            missingPulse.lastName ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="email">
                          Email address *
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className={`${fieldClass} ${
                            missingPulse.email ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="phone">
                          Phone number{reason === "apply" ? " *" : ""}
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required={reason === "apply"}
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className={`${fieldClass} ${
                            missingPulse.phone ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mb-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="company">
                          Company *
                        </label>
                        <input
                          id="company"
                          required
                          value={company}
                          onChange={(event) => setCompany(event.target.value)}
                          className={`${fieldClass} ${
                            missingPulse.company ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                          }`}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="job-role">
                          Job Role *
                        </label>
                        {reason === "apply" ? (
                          <input
                            id="job-role"
                            required
                            value={jobRole}
                            onChange={(event) => setJobRole(event.target.value)}
                            className={`${fieldClass} ${
                              missingPulse.jobRole ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                            }`}
                          />
                        ) : (
                          <select
                            id="job-role"
                            required
                            value={jobRole}
                            onChange={(event) => setJobRole(event.target.value)}
                            className={`${fieldClass} ${
                              missingPulse.jobRole ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                            }`}
                          >
                            <option value="">Please Select</option>
                            {JOB_ROLES.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className={labelClass} htmlFor="country">
                        Country{reason === "apply" ? " *" : ""}
                      </label>
                      {reason === "apply" ? (
                        <input
                          id="country"
                          required
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                          className={`${fieldClass} ${
                            missingPulse.country ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                          }`}
                        />
                      ) : (
                        <select
                          id="country"
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                          className={fieldClass}
                        >
                          <option value="">Please Select</option>
                          {COUNTRIES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="mb-6">
                      <label className={labelClass} htmlFor="message">
                        Message{reason === "apply" ? " *" : ""}
                      </label>
                      <textarea
                        id="message"
                        required={reason === "apply"}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={5}
                        className={`w-full rounded-lg border border-white/[0.12] bg-surface-deep px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 ${
                          missingPulse.message ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.30)]" : ""
                        }`}
                      />
                    </div>

                    <Button type="submit" size="lg" className="rounded-full px-6">
                      Next
                    </Button>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}

      {showTerms ? <PrivacyPolicyModal onClose={() => setShowTerms(false)} /> : null}
    </>
  );
}
