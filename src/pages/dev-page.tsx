import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";

export function DevPage() {
  const [envValue, setEnvValue] = useState("loading…");
  const [envOk, setEnvOk] = useState(false);

  useEffect(() => {
    document.body.classList.add("brand-atmosphere", "dev-blue-theme");
    return () => {
      document.body.classList.remove("brand-atmosphere", "dev-blue-theme");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/test-env")
      .then(async (response) => {
        const body = (await response.json()) as { value?: string };
        if (!cancelled) {
          setEnvValue(typeof body.value === "string" ? body.value : "(bad response)");
          setEnvOk(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEnvValue("(could not reach /api/test-env)");
          setEnvOk(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SiteHeader deepBlueThemeEnabled showPageOrbs />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Dev</p>
        <h1 className="mb-10 text-center text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          ron wrote this
        </h1>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">TEST_ENV_VAR</p>
        <p className={`text-center text-xl text-zinc-200 ${envOk ? "" : "text-zinc-500"}`}>{envValue}</p>
      </main>
    </>
  );
}
