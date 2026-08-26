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
type RequiredFieldKey = "firstName" | "lastName" | "email" | "company" | "jobRole" | "agreed";

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
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
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
          <p className="mb-4">
            This privacy policy explains how BSoftPlats handles your personal information and data.
            The policy is structured so you can quickly find answers to the questions that interest
            you the most.
          </p>
          <p className="mb-4">
            Your privacy is important to us. This privacy policy applies to all the services offered
            by BSoftPlats and any affiliated entity (collectively “BSoftPlats”) except where
            otherwise noted. We refer to those services collectively as the “services” in this
            policy. This privacy policy describes how we collect, share, use, and protect the
            information we collect when you use our services.
          </p>
          <p className="mb-6">
            The terms “we,” “our” and “us” in this Privacy Policy mean BSoftPlats. The terms “you”
            and “your” refer to all users of the services. “Computer” means any personal computer,
            client computer, server computer, mobile device, communication device or any other
            device or system capable of accessing, communicating with, and/or using the services.
            By using the services through a computer you are consenting to our collection of your
            information as set forth in this privacy policy and as amended by us.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Your Consent</h3>
          <p className="mb-4">
            By accessing, viewing and/or otherwise using the Site, you consent to (i) the
            collection, transfer, manipulation, storage, disclosure and other uses of your
            Information as described in the Terms and Conditions of Use and in this Privacy Policy,
            and (ii) to the transfer of such Information outside of the country where you reside
            and outside the European Economic Area (“EEA”), to other countries for storage,
            processing and use by us, and to the transmission of data on an international basis.
          </p>
          <p className="mb-6">
            Where we are processing data based on your consent, you have the right to withdraw that
            consent at any time which will not affect the lawfulness of the processing before your
            consent was withdrawn.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Information We Collect</h3>
          <p className="mb-6">
            When you open and/or use our services, we receive and collect certain information,
            including information about you. The information that we receive and collect depends in
            part on what you do when you use our services, and falls generally into one of two
            categories. Some of this information is information you submit, and other information is
            collected automatically when you access, e.g., when you open and/or use our Services.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Information You Submit</h3>
          <p className="mb-6">
            Some of the information you may submit to use the services is personal information.
            Personal information means all data and/or information that identifies you. Examples of
            personal information we may collect include your internet protocol (IP) address. We use
            personal information to allow you to use services. By using the services and submitting
            personal information to us, you consent to our receiving and collecting this
            information.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">
            “Cookies” – Automatically collected Information
          </h3>
          <p className="mb-6">
            When you view one of our Web sites, we may store some information on your computer in
            the form of a “Cookie” to automatically recognize you the next time you visit. Cookies
            allow web applications to respond to you as an individual. The web application can
            tailor its operations to your needs, likes and dislikes by gathering and remembering
            information about your preferences. Overall, cookies help us provide you with a better
            website experience for our users, by enabling us to monitor which pages you find useful
            and which you do not. You can choose to accept or decline cookies. For more information
            about our cookies policy please refer to our cookies policy in our website.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">
            Information Collected During Your E-Mail Communications with Us
          </h3>
          <p className="mb-6">
            During or related to your accessing the services, you may send an e-mail or other
            electronic communication to us. When you send an e-mail or other electronic
            communication to us, you are communicating with us electronically and consent to receive
            reply communications from us electronically. We may retain the content of the e-mail or
            other electronic communication, your e-mail address or other identifier, and our
            response in order to better service your needs or for legal and regulatory reasons.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">
            Information Collected During Your Employment
          </h3>
          <p className="mb-4">
            During your employment timeframe, we collect personal information about users, based on
            the information that is being collected by the company, such as: Full Name; eMail
            address; Phone number; Experience; Education; Skills and Objectives. Other than that, we
            collect information based on Survey responses. When you log in the platform and interact
            with the questionnaire, any information that you post, display, or submit on or through
            the surveys hosted by us, we also collect and store.
          </p>
          <p className="mb-4">
            Do You Administer the Surveys? Surveys are administered by us. We host the surveys on
            our services and collect the responses submitted. If you have any questions about a
            survey you are taking, please contact BSoftPlats at{" "}
            <a className="underline underline-offset-2 hover:text-white" href="mailto:privacy@bsoftplats.com">
              privacy@bsoftplats.com
            </a>{" "}
            or your organization’s manager who signed you up for this service.
          </p>
          <p className="mb-4">
            Are your survey responses anonymous? Yes. If you respond to a survey, your email address
            is not automatically associated with the response, nor is it transmitted by us to your
            employer. However, there are rare circumstances whereby your employer may be able to
            associate responses with a person. For example, if one or a very small amount of people
            respond to a survey, your employer may be able to intuit who provided what responses.
          </p>
          <p className="mb-4">
            How do we use the information we collect? We use the information we collect from you in
            order to provide you with feedback. Furthermore, we may make aggregate, anonymized, or
            anonymous data available to your employer for organizational effectiveness purposes. In
            all such instances, we will not disclose any identifiable information about you or your
            respondents.
          </p>
          <p className="mb-6">
            Do you sell your responses? We do not sell, trade, or otherwise transfer your personal
            information or your survey responses, but we may make aggregate, anonymized, or
            anonymous data available to third parties for research or other purposes. We do not
            disclose your survey responses to your employer or to third parties.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">
            “Cookies” – Information Placed Automatically on Your Computer
          </h3>
          <p className="mb-6">
            When you view one of our Web sites, we may store some information on your computer in
            the form of a “Cookie” to automatically recognize you the next time you visit. Cookies
            allow web applications to respond to you as an individual. The web application can
            tailor its operations to your needs, likes and dislikes by gathering and remembering
            information about your preferences. We use traffic log cookies to identify which pages
            are being used. This helps us analyze data about web page traffic and improve our
            website in order to tailor it to customer needs. We only use this information for
            statistical analysis purposes and then the data is removed from the system. Overall,
            cookies help us provide you with a better website, by enabling us to monitor which pages
            you find useful and which you do not. A cookie in no way gives us access to your
            computer or any information about you, other than the data you choose to share with us.
            You can choose to accept or decline cookies. Most web browsers automatically accept
            cookies, but you can usually modify your browser setting to decline cookies if you
            prefer. This may prevent you from taking full advantage of the website.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Safety of Minors</h3>
          <p className="mb-6">
            Our services are not intended for and may not be used by minors. “Minors” are
            individuals under the age of majority in their place of residence. BSoftPlats does not
            knowingly collect personal data from minors or allow them to register. If it comes to
            our attention that we have collected personal data from a minor, we may delete this
            information without notice. If you have reason to believe that this has occurred, please
            contact us at{" "}
            <a className="underline underline-offset-2 hover:text-white" href="mailto:privacy@bsoftplats.com">
              privacy@bsoftplats.com
            </a>
            .
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">
            Other Uses or Sharing of Your Information
          </h3>
          <p className="mb-3">
            In addition to those discussed in this privacy policy, we may use and share your
            information, including personal information, without limitation, in the following
            manner:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-5">
            <li>
              In response to judicial or other governmental subpoenas, warrants and court orders
              served on us in accordance with their terms, or as otherwise required by applicable
              law;
            </li>
            <li>
              To comply with legal, regulatory or administrative requirements of governmental
              authorities;
            </li>
            <li>
              To protect our rights or property, protect our legitimate business interests, to
              enforce the provisions of our terms or policies, in cases of customer fraud/disputes,
              and/or to prevent harm to you or others;
            </li>
            <li>
              To protect or defend us, our subsidiaries, affiliates, or parent company and any of
              their officers, directors, employees, agents, contractors and partners, in connection
              with any legal action, claim or dispute;
            </li>
            <li>As disclosed in other applicable policies, terms of use, or other agreements; or</li>
            <li>As permitted or required by law or as authorized by you.</li>
          </ul>

          <h3 className="mb-2 text-base font-semibold text-white">Security and Storage</h3>
          <p className="mb-4">
            We are concerned about safeguarding the confidentiality of your information. We adhere
            to accepted industry security standards that are designed to protect any nonpublic
            personal information collected by our services against accidental use, access, or
            disclosure. We provide physical, electronic, and procedural safeguards to protect
            information we collect, process, and maintain.
          </p>
          <p className="mb-6">
            The technology we use is specifically designed for web servers. All of your personal
            information resides in a secure database behind a firewall where it cannot be accessed
            without proper authentication. Information collected by our Services is protected by
            Secure Socket Layer (“SSL”) technology, a leading security protocol for data transfer on
            the Internet. Secure Socket Layer (“SSL”) technology encrypts your personal information.
            Please remember that no method of transmission, or method of electronic storage, is 100%
            secure. While we strive to use commercially acceptable means to protect your personal
            information, we cannot guarantee its absolute security. We also do not guarantee the
            confidentiality or security of electronic transmissions via the Internet due to
            potentially unsafe computers or links. This could result in data becoming lost or
            intercepted during transmission. Please use good judgment before deciding to send
            information via the Internet.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Retention Period</h3>
          <p className="mb-6">
            The Information will be stored either for a period of one year or for as long as needed
            for business usage. If in the future, we intend to process the Information for a purpose
            other than that which it was collected, we will provide you with information on that
            purpose and any other relevant information.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Data Subjects Rights</h3>
          <p className="mb-4">
            Under the General Data Protection Regulation (GDPR) and The Data Protection Act 2018
            (DPA) you have a number of rights with regard to your personal data. You have the right
            to request from us access to and rectification or erasure of the Information, the right
            to restrict processing, object to processing as well as in certain circumstances the
            right to data portability.
          </p>
          <p className="mb-6">
            You have the right to lodge a complaint to us if you believe that we have not complied
            with the requirements of the GDPR or DPA by contacting as specified below.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Stopping Collection of Information</h3>
          <p className="mb-6">
            If you would like us to delete information that you submit, please contact us at{" "}
            <a className="underline underline-offset-2 hover:text-white" href="mailto:privacy@bsoftplats.com">
              privacy@bsoftplats.com
            </a>
            , and we will respond in a reasonable time.
          </p>

          <h3 className="mb-2 text-base font-semibold text-white">Changes to our Privacy Policy</h3>
          <p className="mb-6">
            We may make changes to our privacy policy from time to time. When we change the privacy
            policy in a material way, a notice will be placed at our services along with the changed
            privacy policy. It is your responsibility to review this privacy policy frequently and
            remain informed about any changes to it, so we encourage you to visit this page often.
            Your continued use of our services constitutes your acceptance of any amendments to and
            the most recent versions of this privacy policy.
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

export function ContactFlow() {
  const [step, setStep] = useState<"start" | "reason" | "bot">("start");
  const [formOpen, setFormOpen] = useState(false);
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
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendOk, setSendOk] = useState(false);
  const [missingPulse, setMissingPulse] = useState<Partial<Record<RequiredFieldKey, boolean>>>({});
  const missingPulseTimerRef = useRef<number | null>(null);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setSendOk(false);
    setSendError("");
  }, []);

  useEffect(() => {
    if (!formOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !showTerms) closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [formOpen, showTerms, closeForm]);

  const canSend =
    agreed &&
    Boolean(reason) &&
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    company.trim() !== "" &&
    jobRole !== "";

  const getMissingRequiredFields = useCallback((): RequiredFieldKey[] => {
    const missing: RequiredFieldKey[] = [];
    if (firstName.trim() === "") missing.push("firstName");
    if (lastName.trim() === "") missing.push("lastName");
    if (email.trim() === "") missing.push("email");
    if (company.trim() === "") missing.push("company");
    if (jobRole === "") missing.push("jobRole");
    if (!agreed) missing.push("agreed");
    return missing;
  }, [firstName, lastName, email, company, jobRole, agreed]);

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
    console.log("[turnstile] passed, waiting for Open contact form");
    setTurnstileToken(token);
  }, []);

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
        }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setSendError(data.message || "Could not send. Try again.");
        return;
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

  return (
    <div className="relative flex h-[440px] flex-col overflow-hidden border border-white/12 bg-white/[0.02] p-6 sm:h-[460px] sm:p-8">
      <div className="mb-4 flex h-6 shrink-0 items-center">
        {step === "reason" || step === "bot" ? (
          <button
            type="button"
            onClick={() => {
              if (step === "bot") {
                setTurnstileToken("");
                setStep("reason");
                return;
              }
              setStep("start");
            }}
            className="inline-flex items-center text-sm text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </button>
        ) : null}
      </div>

      <div className={`min-h-0 flex-1 ${step === "start" ? "flex overflow-hidden" : "overflow-y-auto"}`}>
        {step === "start" ? (
          <button
            type="button"
            onClick={() => setStep("reason")}
            className="flex h-full w-full flex-col items-center justify-center gap-3 border border-white/20 bg-white text-black transition-colors hover:bg-zinc-200"
          >
            <Mail className="h-8 w-8" />
            <span className="text-3xl font-semibold tracking-tight">Get started</span>
            <span className="text-sm text-zinc-600">Contact form</span>
          </button>
        ) : null}

        {step === "reason" ? (
          <div>
            <h3 className="mb-2 text-2xl font-semibold text-white">What brings you here?</h3>
            <p className="mb-6 text-sm text-zinc-400">Choose one before continuing.</p>
            <div className="grid gap-3">
              {REASONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setReason(item.id);
                    setStep("bot");
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
        ) : null}

        {step === "bot" ? (
          <div>
            <h3 className="mb-2 text-2xl font-semibold text-white">Quick bot check</h3>
            <p className="mb-6 text-sm text-zinc-400">Verify you're human to open the contact form.</p>
            {turnstileToken ? (
              <div className="grid gap-4">
                <p className="text-sm text-zinc-300">You're verified.</p>
                <Button
                  size="lg"
                  className="w-fit rounded-full px-6"
                  onClick={() => {
                    console.log("[turnstile] opening contact overlay");
                    setFormOpen(true);
                  }}
                >
                  Open contact form
                </Button>
              </div>
            ) : (
              <BotCheck onPassed={handleBotPassed} />
            )}
          </div>
        ) : null}
      </div>

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
                  <h2 id="contact-form-title" className="text-xl font-semibold text-white">
                    Contact form
                  </h2>
                  <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-white" aria-label="Close">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {sendOk ? (
                  <div className="px-5 py-16 text-center sm:px-6">
                    <p className="mb-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Almost done</p>
                    <p className="text-2xl font-semibold text-white">Check your email to confirm your inquiry.</p>
                    <p className="mt-3 text-sm text-zinc-400">The link expires in 5 minutes.</p>
                  </div>
                ) : (
                  <form
                    className="overflow-y-auto bg-surface-deep/80 px-5 py-5 sm:px-6"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submitContact();
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

                    <p className="mb-5 text-xs uppercase tracking-[0.14em] text-zinc-500">
                      {reasonLabel(reason)}
                    </p>

                    <div className="mb-4">
                      <label className={labelClass} htmlFor="hear-about">
                        How did you hear about us?
                      </label>
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
                          Phone number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className={fieldClass}
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
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className={labelClass} htmlFor="country">
                        Country
                      </label>
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
                    </div>

                    <div className="mb-6">
                      <label className={labelClass} htmlFor="message">
                        Message
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-white/[0.12] bg-surface-deep px-3 py-2 text-sm text-white outline-none placeholder:text-white/50"
                      />
                    </div>

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
                            I have read and agree to BSoftPlats’s Privacy Policy. I consent to BSoftPlats
                            storing and using my submitted information to respond to my enquiry.
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

                    {sendError ? <p className="mb-4 text-sm text-red-400">{sendError}</p> : null}

                    <div
                      onMouseEnter={() => {
                        if (!canSend && !sending) flashMissingFields();
                      }}
                      onFocusCapture={() => {
                        if (!canSend && !sending) flashMissingFields();
                      }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        className={`rounded-full px-6 ${!canSend && !sending ? "cursor-not-allowed opacity-65" : ""}`}
                        disabled={sending}
                        aria-disabled={!canSend || sending}
                      >
                        {sending ? "Sending…" : "Send"}
                        <Mail className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}

      {showTerms ? <PrivacyPolicyModal onClose={() => setShowTerms(false)} /> : null}
    </div>
  );
}
