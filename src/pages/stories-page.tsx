import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StoriesErrorBoundary, StoryCover, getArchiveStories } from "@/lib/stories";

const STORIES = (() => {
  try {
    return getArchiveStories();
  } catch {
    return [];
  }
})();

export function StoriesPage() {
  const [showDevThemeToggle, setShowDevThemeToggle] = useState(false);
  const [deepBlueThemeEnabled, setDeepBlueThemeEnabled] = useState(true);

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
      <StoriesErrorBoundary>
        <main className="relative z-10 min-h-screen bg-transparent pt-28 pb-24">
          <div className="mx-auto max-w-6xl px-6">
            <a
              href="/#success-stories"
              className="mb-8 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </a>
            <h1 className="mb-3 text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Success Stories
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-center text-sm text-zinc-400">
              Everything we have published so far.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {STORIES.map((story) => (
                <article key={story.slug} className="border border-white/12 bg-white/[0.03] p-5">
                  <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden border border-white/10 bg-white">
                    <StoryCover story={story} alt="" className="h-full w-full object-cover object-center" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-white">{story.title}</h2>
                  <p className="mb-4 text-sm leading-relaxed text-zinc-400">{story.description}</p>
                  <a
                    href={story.link}
                    className="text-sm font-semibold text-white underline underline-offset-4 hover:text-zinc-300"
                  >
                    Link here
                  </a>
                </article>
              ))}
            </div>
          </div>
        </main>
      </StoriesErrorBoundary>
    </>
  );
}
