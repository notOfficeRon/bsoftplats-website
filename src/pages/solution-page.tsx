import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getSolution } from "@/lib/solutions";

export function SolutionPage({ slug }: { slug: string }) {
  const [showDevThemeToggle, setShowDevThemeToggle] = useState(false);
  const [deepBlueThemeEnabled, setDeepBlueThemeEnabled] = useState(true);
  const solution = getSolution(slug);

  useEffect(() => {
    setShowDevThemeToggle(window.location.pathname.startsWith("/dev"));
  }, []);

  useEffect(() => {
    document.body.classList.add("brand-atmosphere");
    document.body.classList.toggle("dev-blue-theme", deepBlueThemeEnabled);
    return () => {
      document.body.classList.remove("brand-atmosphere");
      document.body.classList.remove("dev-blue-theme");
    };
  }, [deepBlueThemeEnabled]);

  if (!solution) return null;

  return (
    <>
      <SiteHeader
        showDevThemeToggle={showDevThemeToggle}
        deepBlueThemeEnabled={deepBlueThemeEnabled}
        onToggleDeepBlueTheme={() => setDeepBlueThemeEnabled((enabled) => !enabled)}
        showPageOrbs
      />
      <main className="relative z-10 min-h-screen bg-transparent pt-28 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <a
            href="/#solutions"
            className="mb-8 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </a>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Solutions</p>
          <div className="grid gap-10 border-t border-white/12 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14">
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-zinc-500">{solution.code}</p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">{solution.title}</h1>
              <p className="mb-5 text-sm text-zinc-500">{solution.subtitle}</p>
              <p className="mb-5 text-base leading-relaxed text-zinc-300 sm:text-lg">{solution.blurb}</p>
              <p className="mb-6 text-sm text-brand-primary-bright">{solution.tag}</p>
              <p className="text-sm leading-relaxed text-zinc-500">
                <span className="font-medium text-zinc-400">Where it stops: </span>
                {solution.stop}
              </p>
            </div>
            <div className="space-y-4">
              {solution.bullets.map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                  <span className="mt-2 h-px w-3 shrink-0 bg-zinc-500" aria-hidden="true" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
          <div className="mt-14 flex justify-center">
            <a
              href="/#contact"
              className="lift-hover inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
            >
              Get started
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
