import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";

type VerifyState = "loading" | "success" | "error" | "missing";

export function VerifyContactPage() {
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("brand-atmosphere", "dev-blue-theme");
    return () => {
      document.body.classList.remove("brand-atmosphere", "dev-blue-theme");
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token")?.trim();
    if (!token) {
      setState("missing");
      setMessage("No verification token was provided.");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    void (async () => {
      try {
        const response = await fetch(`/api/contact/verify?token=${encodeURIComponent(token)}`, {
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

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-transparent px-6 pt-28 pb-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/[0.12] bg-surface-elevated p-8 text-center">
          {state === "loading" ? (
            <>
              <p className="mb-2 text-sm uppercase tracking-[0.14em] text-zinc-500">Verifying</p>
              <h1 className="text-2xl font-semibold text-white">Confirming your inquiry…</h1>
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

          <a
            href="/#contact"
            className="mt-8 inline-block text-sm font-semibold text-brand-primary underline underline-offset-4 hover:text-brand-primary-bright"
          >
            Back to contact
          </a>
        </div>
      </main>
    </>
  );
}
