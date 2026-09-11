import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { ContactFlow } from "@/components/contact-flow";
import { SiteHeader } from "@/components/site-header";
import { getOpenings } from "@/lib/careers";

const OPENINGS = (() => {
  try {
    return getOpenings();
  } catch {
    return [];
  }
})();

export function CareersPage() {
  const [showDevThemeToggle, setShowDevThemeToggle] = useState(false);
  const [deepBlueThemeEnabled, setDeepBlueThemeEnabled] = useState(true);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [applyTitle, setApplyTitle] = useState("");
  const [applyNonce, setApplyNonce] = useState(0);

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

  return (
    <>
      <SiteHeader
        showDevThemeToggle={showDevThemeToggle}
        deepBlueThemeEnabled={deepBlueThemeEnabled}
        onToggleDeepBlueTheme={() => setDeepBlueThemeEnabled((enabled) => !enabled)}
        showPageOrbs
      />
      <main className="relative z-10 min-h-screen bg-transparent pt-28 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <a
            href="/#careers"
            className="mb-8 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </a>
          <h1 className="mb-3 text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Careers
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm text-zinc-400">
            Build your career with a company that values talent growth, innovation, and long-term success.
          </p>
          <div className="mx-auto max-w-3xl space-y-4">
            {OPENINGS.map((opening) => {
              const expanded = openSlug === opening.slug;
              return (
                <article
                  key={opening.slug}
                  className={`overflow-hidden border border-white/12 bg-white/[0.03] ${
                    expanded ? "rounded-3xl" : "rounded-full"
                  }`}
                >
                  <button
                    type="button"
                    className={`group flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white ${
                      expanded ? "rounded-t-3xl" : "rounded-full"
                    }`}
                    aria-expanded={expanded}
                    onClick={() => setOpenSlug(expanded ? null : opening.slug)}
                  >
                    <h2 className="text-xl font-semibold text-white transition-colors group-hover:text-black">
                      {opening.title}
                    </h2>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 group-hover:text-black ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-white/10 px-5 py-5">
                        {opening.description ? (
                          <p className="mb-4 text-sm leading-relaxed text-zinc-300">{opening.description}</p>
                        ) : null}
                        {opening.responsibilities.length > 0 ? (
                          <>
                            <p className="mb-2 text-sm font-semibold text-white">
                              Responsibilities
                            </p>
                            <ul className="mb-5 list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
                              {opening.responsibilities.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        {opening.requirements.length > 0 ? (
                          <>
                            <p className="mb-2 text-sm font-semibold text-white">
                              Requirements
                            </p>
                            <ul className="mb-5 list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
                              {opening.requirements.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        {opening.preferred.length > 0 ? (
                          <>
                            <p className="mb-2 text-sm font-semibold text-white">
                              Nice to have
                            </p>
                            <ul className="mb-5 list-disc space-y-1.5 pl-5 text-sm text-zinc-300">
                              {opening.preferred.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        <button
                          type="button"
                          className="lift-hover inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                          onClick={() => {
                            setApplyTitle(opening.title);
                            setApplyNonce((current) => current + 1);
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      {applyNonce > 0 ? (
        <ContactFlow key={applyNonce} showTrigger={false} applyOpeningTitle={applyTitle} />
      ) : null}
    </>
  );
}
