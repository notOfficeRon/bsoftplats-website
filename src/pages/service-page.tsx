import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getService } from "@/lib/services";

export function ServicePage({ slug }: { slug: string }) {
  const [showDevThemeToggle, setShowDevThemeToggle] = useState(false);
  const [deepBlueThemeEnabled, setDeepBlueThemeEnabled] = useState(true);
  const service = getService(slug);

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

  if (!service) return null;

  return (
    <>
      <SiteHeader
        showDevThemeToggle={showDevThemeToggle}
        deepBlueThemeEnabled={deepBlueThemeEnabled}
        onToggleDeepBlueTheme={() => setDeepBlueThemeEnabled((enabled) => !enabled)}
      />
      <main className="min-h-screen bg-transparent pt-28 pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <a
            href="/#services"
            className="mb-8 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </a>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Services</p>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">{service.title}</h1>
          <p className="mb-10 text-base text-zinc-300 sm:text-lg">{service.blurb}</p>
          <div className="space-y-4">
            {service.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
          <a
            href="/#contact"
            className="lift-hover mt-12 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Get started
          </a>
        </div>
      </main>
    </>
  );
}
