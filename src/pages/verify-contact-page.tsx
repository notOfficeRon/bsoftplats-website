import { useEffect, useState } from "react";

type VerifyState = "loading" | "success" | "error" | "missing" | "need-resume";

const RESUME_STORAGE_PREFIX = "bsoftplats-resume-";
const RESUME_MAX_BYTES = 2 * 1024 * 1024;

function peekJwtPayload(token: string): { reason?: string; jti?: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    return JSON.parse(atob(padded + pad)) as { reason?: string; jti?: string };
  } catch {
    return null;
  }
}

function readStoredResume(jti: string) {
  try {
    const raw = window.localStorage.getItem(`${RESUME_STORAGE_PREFIX}${jti}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: string; type?: string; content?: string };
    if (!parsed.content) return null;
    return {
      name: parsed.name || "resume.pdf",
      type: parsed.type || "application/pdf",
      content: parsed.content,
    };
  } catch {
    return null;
  }
}

export function VerifyContactPage() {
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [jti, setJti] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.body.classList.add("brand-atmosphere", "dev-blue-theme");
    document.body.style.overflow = "";
    return () => {
      document.body.classList.remove("brand-atmosphere", "dev-blue-theme");
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextToken = params.get("token")?.trim();
    if (!nextToken) {
      setState("missing");
      setMessage("No verification token was provided.");
      return;
    }
    setToken(nextToken);

    const peeked = peekJwtPayload(nextToken);
    if (peeked?.reason === "apply") {
      const nextJti = peeked.jti ?? "";
      setJti(nextJti);
      const stored = nextJti ? readStoredResume(nextJti) : null;
      if (!stored) {
        setState("need-resume");
        setMessage("Resume appears to be missing, please reupload it.");
        return;
      }
      void confirmApply(nextToken, stored);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    void (async () => {
      try {
        const response = await fetch(`/api/contact/verify?token=${encodeURIComponent(nextToken)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { ok?: boolean; message?: string };
        if (response.ok && data.ok) {
          setState("success");
          setMessage(data.message || "Your inquiry has been confirmed and sent.");
          return;
        }
        setState("error");
        setMessage(data.message || "This verification link is invalid or has expired.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setState("error");
          setMessage("Verification timed out. Please try again from the contact form.");
          return;
        }
        setState("error");
        setMessage("Could not verify your inquiry. Please try again.");
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  async function confirmApply(
    nextToken: string,
    resume: { name: string; type: string; content: string },
  ) {
    setUploading(true);
    setResumeError("");
    try {
      const response = await fetch("/api/contact/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: nextToken,
          filename: resume.name,
          type: resume.type,
          content: resume.content,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (response.ok && data.ok) {
        if (jti || peekJwtPayload(nextToken)?.jti) {
          const key = peekJwtPayload(nextToken)?.jti;
          if (key) window.localStorage.removeItem(`${RESUME_STORAGE_PREFIX}${key}`);
        }
        setState("success");
        setMessage(data.message || "Your application has been confirmed and sent.");
        return;
      }
      if (response.status === 400 && (data.message ?? "").toLowerCase().includes("resume")) {
        setState("need-resume");
        setMessage(data.message || "Resume appears to be missing, please reupload it.");
        return;
      }
      setState("error");
      setMessage(data.message || "This verification link is invalid or has expired.");
    } catch {
      setState("error");
      setMessage("Could not verify your application. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const onReupload = async (file: File | null) => {
    if (!file || !token) return;
    if (file.size > RESUME_MAX_BYTES) {
      setResumeError("Resume must be 2MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      const content = comma >= 0 ? result.slice(comma + 1) : result;
      const stored = { name: file.name, type: file.type || "application/pdf", content };
      if (jti) {
        try {
          window.localStorage.setItem(`${RESUME_STORAGE_PREFIX}${jti}`, JSON.stringify(stored));
        } catch {
          // still send it now
        }
      }
      void confirmApply(token, stored);
    };
    reader.onerror = () => setResumeError("Could not read that file.");
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-transparent px-6 pt-16 pb-24">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/[0.12] bg-surface-elevated p-8 text-center">
        {state === "loading" || uploading ? (
          <>
            <p className="mb-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Verifying</p>
            <h1 className="text-2xl font-semibold text-white">Confirming your request…</h1>
          </>
        ) : null}

        {state === "success" ? (
          <>
            <p className="mb-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Confirmed</p>
            <h1 className="text-2xl font-semibold text-white">{message}</h1>
            <p className="mt-3 text-sm text-zinc-400">We will get back to you soon.</p>
          </>
        ) : null}

        {state === "error" || state === "missing" ? (
          <>
            <p className="mb-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Verification failed</p>
            <h1 className="text-2xl font-semibold text-white">{message}</h1>
          </>
        ) : null}

        {state === "need-resume" && !uploading ? (
          <>
            <p className="mb-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Resume needed</p>
            <h1 className="text-2xl font-semibold text-white">{message}</h1>
            <p className="mt-3 text-sm text-zinc-400">
              Open this page on the same device you applied from, or upload the file again below.
            </p>
            <input
              className="mt-6 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              onChange={(event) => void onReupload(event.target.files?.[0] ?? null)}
            />
            {resumeError ? <p className="mt-3 text-sm text-red-400">{resumeError}</p> : null}
          </>
        ) : null}

        <a
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-brand-primary underline underline-offset-4 hover:text-brand-primary-bright"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
