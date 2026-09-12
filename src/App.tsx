import { type CSSProperties, type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { SiteHeader } from "@/components/site-header";
import { ContactFlow } from "@/components/contact-flow";
import { Globe } from "@/components/ui/globe";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { StoriesErrorBoundary, StoryCover, getFeaturedStories } from "@/lib/stories";
import { SERVICES, servicePath } from "@/lib/services";
import { SOLUTIONS, SOLUTIONS_INTRO, solutionPath } from "@/lib/solutions";

const WHAT_WE_DO_CARDS = [
  {
    title: "People-first",
    description:
      "We invest in talent growth and long-term careers. That’s the foundation of the work: stronger delivery, loyalty, and lasting value.",
  },
  {
    title: "Client partnerships",
    description:
      "When the team thrives, clients get better results. Full project transparency, with independent maintenance or ongoing support.",
  },
  {
    title: "How we work today",
    description:
      "We currently serve four companies, with two strategic partnerships: one in banking, one in Generative AI.",
  },
];

const SUCCESS_STORIES = (() => {
  try {
    return getFeaturedStories();
  } catch {
    return [];
  }
})();
const STORY_DURATION_MS = 6000;
const STORY_PART_KEYS = ["image", "title", "summary", "link"] as const;
type StoryPartKey = (typeof STORY_PART_KEYS)[number];

const BUSINESS_PARTNERS = [
  "Skipper Soft",
  "Atalef",
  "Flametree AI",
  "Plumery",
  "Banking Partner",
  "GenAI Partner",
];

function HoverCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setGlowPosition({ x, y });
  };

  return (
    <article
      className="lift-hover group relative overflow-hidden border border-white/12 bg-white/[0.02] p-8 hover:bg-white/[0.04]"
      onMouseMove={handleMouseMove}
      style={
        {
          "--glow-x": `${glowPosition.x}%`,
          "--glow-y": `${glowPosition.y}%`,
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="hover-grain-glow absolute inset-0" />
        <div className="hover-grain-noise absolute inset-0" />
      </div>
      <h3 className="relative mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="relative text-sm leading-relaxed text-zinc-400">{description}</p>
    </article>
  );
}

export default function App() {
  const [showDevThemeToggle, setShowDevThemeToggle] = useState(false);
  const [deepBlueThemeEnabled, setDeepBlueThemeEnabled] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isStoryTransitioning, setIsStoryTransitioning] = useState(false);
  const [storyPartVisible, setStoryPartVisible] = useState<Record<StoryPartKey, boolean>>({
    image: true,
    title: true,
    summary: true,
    link: true,
  });
  const [storyPartTiming, setStoryPartTiming] = useState<
    Record<StoryPartKey, { delay: number; duration: number }>
  >({
    image: { delay: 0, duration: 280 },
    title: { delay: 0, duration: 280 },
    summary: { delay: 0, duration: 280 },
    link: { delay: 0, duration: 280 },
  });
  const [activeArrow, setActiveArrow] = useState<"prev" | "next" | null>(null);
  const [storiesInView, setStoriesInView] = useState(false);
  const storiesSectionRef = useRef<HTMLElement | null>(null);
  const arrowTimerRef = useRef<number | null>(null);
  const storyTimersRef = useRef<number[]>([]);
  const isStoryTransitioningRef = useRef(false);
  const activeStory = SUCCESS_STORIES[activeStoryIndex];

  const clearStoryTimers = useCallback(() => {
    storyTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    storyTimersRef.current = [];
  }, []);

  const scheduleStoryTimer = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(callback, delay);
    storyTimersRef.current.push(timerId);
    return timerId;
  }, []);

  const randomPartTimings = useCallback(
    (phase: "out" | "in") => {
      const minDelay = phase === "out" ? 0 : 40;
      const maxDelay = phase === "out" ? 170 : 260;
      const minDuration = phase === "out" ? 170 : 220;
      const maxDuration = phase === "out" ? 320 : 420;

      const timings = STORY_PART_KEYS.reduce((acc, key) => {
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        const duration =
          Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
        acc[key] = { delay, duration };
        return acc;
      }, {} as Record<StoryPartKey, { delay: number; duration: number }>);

      const maxTime = Math.max(
        ...Object.values(timings).map((timing) => timing.delay + timing.duration),
      );

      return { timings, maxTime };
    },
    [],
  );

  const runStoryTransition = useCallback(
    (direction: "prev" | "next") => {
      if (SUCCESS_STORIES.length === 0 || isStoryTransitioningRef.current) return;

      setIsStoryTransitioning(true);
      isStoryTransitioningRef.current = true;
      setActiveArrow(direction);
      clearStoryTimers();

      const outPhase = randomPartTimings("out");
      setStoryPartTiming(outPhase.timings);
      requestAnimationFrame(() => {
        setStoryPartVisible({
          image: false,
          title: false,
          summary: false,
          link: false,
        });
      });

      scheduleStoryTimer(() => {
        setActiveStoryIndex((current) => {
          if (direction === "prev") {
            return current === 0 ? SUCCESS_STORIES.length - 1 : current - 1;
          }
          return current === SUCCESS_STORIES.length - 1 ? 0 : current + 1;
        });

        const inPhase = randomPartTimings("in");
        setStoryPartTiming(inPhase.timings);

        requestAnimationFrame(() => {
          setStoryPartVisible({
            image: true,
            title: true,
            summary: true,
            link: true,
          });
        });

        scheduleStoryTimer(() => {
          setIsStoryTransitioning(false);
          isStoryTransitioningRef.current = false;
        }, inPhase.maxTime + 40);
      }, outPhase.maxTime + 40);

      // Failsafe: never stay stuck in transitioning state.
      scheduleStoryTimer(() => {
        setIsStoryTransitioning(false);
        isStoryTransitioningRef.current = false;
        setStoryPartVisible({
          image: true,
          title: true,
          summary: true,
          link: true,
        });
      }, 2200);

      arrowTimerRef.current = window.setTimeout(() => {
        setActiveArrow(null);
      }, 170);
    },
    [clearStoryTimers, randomPartTimings, scheduleStoryTimer],
  );

  const showPreviousStory = useCallback(() => {
    runStoryTransition("prev");
  }, [runStoryTransition]);

  const showNextStory = useCallback(() => {
    runStoryTransition("next");
  }, [runStoryTransition]);

  useEffect(() => {
    return () => {
      if (arrowTimerRef.current) window.clearTimeout(arrowTimerRef.current);
      clearStoryTimers();
    };
  }, [clearStoryTimers]);

  useEffect(() => {
    const el = storiesSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStoriesInView(entry.isIntersecting);
      },
      { threshold: 0.35, rootMargin: "-15% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (SUCCESS_STORIES.length === 0 || isStoryTransitioning || !storiesInView) return;
    const autoTimer = window.setTimeout(() => {
      showNextStory();
    }, STORY_DURATION_MS);
    return () => window.clearTimeout(autoTimer);
  }, [activeStoryIndex, isStoryTransitioning, showNextStory, storiesInView]);

  const partStyle = useCallback(
    (part: StoryPartKey): CSSProperties => ({
      opacity: storyPartVisible[part] ? 1 : 0,
      transitionProperty: "opacity",
      transitionDuration: `${storyPartTiming[part].duration}ms`,
      transitionTimingFunction: "ease",
      transitionDelay: `${storyPartTiming[part].delay}ms`,
    }),
    [storyPartTiming, storyPartVisible],
  );

  useEffect(() => {
    setShowDevThemeToggle(window.location.pathname.startsWith("/dev"));
  }, []);

  useEffect(() => {
    try {
      const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (entry?.type === "reload") return;
    } catch {
      // keep hash scroll
    }
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
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
      />

      <main className="bg-transparent">
        <HeroSection />

        <section id="overview" className="border-y border-white/10 py-10 md:hidden">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-5 text-2xl font-semibold tracking-tight text-white">Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="#about"
                className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
              >
                About
              </a>
              <a
                href="#services"
                className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
              >
                Services
              </a>
              <a
                href="#solutions"
                className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
              >
                Solutions
              </a>
              <a
                href="#success-stories"
                className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
              >
                Success Stories
              </a>
              <a
                href="#careers"
                className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
              >
                Careers
              </a>
              <a
                href="#contact"
                className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.08]"
              >
                Apply or Contact
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="border-t border-white/10 py-40 sm:py-44 lg:py-48">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-14 text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              About us
            </h2>
            <div className="grid gap-5 lg:grid-cols-3">
              {WHAT_WE_DO_CARDS.map((card) => (
                <HoverCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Companies we worked with" className="border-y border-white/10 bg-transparent py-5">
          <div className="mx-auto mb-3 max-w-6xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Our Partners
            </p>
          </div>
          <div className="bg-white py-4">
            <div className="partner-marquee">
              <div className="partner-marquee-track">
                {BUSINESS_PARTNERS.map((partner, index) => (
                  <span key={`track-a-${partner}-${index}`} className="partner-marquee-item">
                    {partner}
                  </span>
                ))}
              </div>
              <div className="partner-marquee-track" aria-hidden="true">
                {BUSINESS_PARTNERS.map((partner, index) => (
                  <span key={`${partner}-${index}`} className="partner-marquee-item">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-[72px] border-t border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <h3 className="mb-6 text-center text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Our Services
            </h3>
            <p className="mb-10 text-center text-sm text-zinc-400">
              Six lines of work. Click through if you want the detail.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SERVICES.map((service) => (
                <article
                  key={service.slug}
                  className="lift-hover group flex flex-col border border-white/12 bg-white/[0.03] p-6 transition-colors hover:border-white hover:bg-white sm:p-8"
                >
                  <h4 className="mb-3 text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-black">
                    {service.title}
                  </h4>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-300 transition-colors group-hover:text-zinc-700">
                    {service.blurb}
                  </p>
                  <a
                    href={servicePath(service.slug)}
                    className="text-sm font-semibold text-white underline underline-offset-4 transition-colors group-hover:text-black hover:text-zinc-700"
                  >
                    Read more
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="solutions" className="scroll-mt-[72px] border-t border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-[1400px] px-6">
            <h3 className="mb-6 text-center text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Solutions
            </h3>
            <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-zinc-400 sm:text-lg">
              {SOLUTIONS_INTRO}
            </p>
            <div className="mx-auto max-w-6xl space-y-4">
              {SOLUTIONS.map((solution) => (
                <a
                  key={solution.slug}
                  href={solutionPath(solution.slug)}
                  className="group flex items-center gap-4 rounded-full border border-white/12 bg-white/[0.03] px-6 py-5 transition-colors hover:bg-white sm:px-8"
                >
                  <div className="min-w-0 flex-1 text-left">
                    <h4 className="text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-black sm:text-3xl">
                      {solution.title}
                    </h4>
                    <p className="text-sm text-zinc-500 transition-colors group-hover:text-zinc-600">
                      {solution.subtitle}
                    </p>
                  </div>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-zinc-300 transition-colors group-hover:border-black/20 group-hover:text-black"
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <StoriesErrorBoundary>
        <section
          id="success-stories"
          ref={storiesSectionRef}
          className="border-t border-white/10 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white sm:mb-6 sm:text-4xl">
              Success Stories
            </h2>
            {activeStory ? (
            <div className="mx-auto w-full max-w-5xl overflow-hidden border border-zinc-300 bg-white">
              <div className="sm:hidden p-4">
                <article className="grid w-full gap-5 text-black">
                  <div
                    className="flex aspect-square w-full items-center justify-center overflow-hidden border border-zinc-300 bg-zinc-100"
                    style={partStyle("image")}
                  >
                    <StoryCover
                      story={activeStory}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="mb-3 text-2xl font-semibold text-black" style={partStyle("title")}>
                      {activeStory.title}
                    </h3>
                    <p className="mb-4 text-base leading-relaxed text-zinc-700" style={partStyle("summary")}>
                      {activeStory.description}
                    </p>
                    <a
                      href={activeStory.link}
                      className="w-fit text-sm font-semibold text-black underline underline-offset-4 hover:text-zinc-700"
                      style={partStyle("link")}
                    >
                      Link here
                    </a>
                  </div>
                </article>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={showPreviousStory}
                    aria-label="Previous success story"
                    className={`text-black transition-transform duration-200 hover:scale-110 hover:[filter:drop-shadow(0_0_8px_rgba(0,0,0,0.35))] ${
                      activeArrow === "prev" ? "scale-125" : "scale-100"
                    }`}
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextStory}
                    aria-label="Next success story"
                    className={`text-black transition-transform duration-200 hover:scale-110 hover:[filter:drop-shadow(0_0_8px_rgba(0,0,0,0.35))] ${
                      activeArrow === "next" ? "scale-125" : "scale-100"
                    }`}
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </div>
              </div>

              <div className="mx-auto hidden min-h-[340px] w-full grid-cols-[120px_1fr_120px] items-stretch px-6 md:px-8 sm:grid">
                <button
                  type="button"
                  onClick={showPreviousStory}
                  aria-label="Previous success story"
                  className={`text-black transition-transform duration-200 hover:scale-110 hover:[filter:drop-shadow(0_0_8px_rgba(0,0,0,0.35))] ${
                    activeArrow === "prev" ? "scale-125" : "scale-100"
                  }`}
                >
                  <ChevronLeft className="mx-auto h-6 w-6 sm:h-8 sm:w-8" />
                </button>

                <article className="mx-auto grid w-full max-w-6xl gap-5 p-4 text-black sm:gap-8 sm:p-8 md:grid-cols-[380px_minmax(0,1fr)]">
                  <div
                    className="flex aspect-square w-full items-center justify-center overflow-hidden border border-zinc-300 bg-zinc-100"
                    style={partStyle("image")}
                  >
                    <StoryCover
                      story={activeStory}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="mb-3 text-xl font-semibold text-black sm:text-2xl" style={partStyle("title")}>
                      {activeStory.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-zinc-700" style={partStyle("summary")}>
                      {activeStory.description}
                    </p>
                    <a
                      href={activeStory.link}
                      className="w-fit text-sm font-semibold text-black underline underline-offset-4 hover:text-zinc-700"
                      style={partStyle("link")}
                    >
                      Link here
                    </a>
                  </div>
                </article>

                <button
                  type="button"
                  onClick={showNextStory}
                  aria-label="Next success story"
                  className={`text-black transition-transform duration-200 hover:scale-110 hover:[filter:drop-shadow(0_0_8px_rgba(0,0,0,0.35))] ${
                    activeArrow === "next" ? "scale-125" : "scale-100"
                  }`}
                >
                  <ChevronRight className="mx-auto h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              </div>
              <div className="mx-auto grid w-full grid-cols-1 gap-3 border-t border-zinc-300 px-4 py-3 sm:grid-cols-3 sm:gap-4 sm:px-8">
                {SUCCESS_STORIES.map((story, index) => {
                  const isActive = index === activeStoryIndex;
                  return (
                    <div key={story.title} className="flex flex-col">
                      <div className="mb-1 hidden h-10 sm:block">
                        <span className="line-clamp-2 text-[11px] uppercase leading-5 tracking-[0.14em] text-zinc-600">
                          {story.title}
                        </span>
                      </div>
                      <div className="mb-1 sm:hidden">
                        <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-600">Story {index + 1}</span>
                      </div>
                      <div className="mt-auto h-[2px] w-full bg-zinc-300">
                        <div
                          className="h-full bg-brand-primary"
                          style={{
                            width: isActive ? "100%" : "0%",
                            animation:
                              isActive && !isStoryTransitioning && storiesInView
                                ? `story-progress ${STORY_DURATION_MS}ms linear forwards`
                                : "none",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            ) : null}
            <div className="mt-6 text-center">
              <a
                href="/stories"
                className="lift-hover inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                Check out more
              </a>
            </div>
          </div>
        </section>
        </StoriesErrorBoundary>

        <section
          id="careers"
          className="relative scroll-mt-[72px] overflow-hidden border-t border-white/10 py-32 sm:py-40 lg:min-h-[80vh] lg:py-0"
        >
          <BackgroundPaths className="min-h-0" reverse />
          <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-6xl flex-col items-center justify-center px-6 text-center lg:min-h-[80vh]">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Careers</p>
            <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Follow your passion. Find your place.
            </h2>
            <a
              href="/careers"
              className="lift-hover mt-10 inline-flex items-center justify-center rounded-2xl bg-white px-10 py-4 text-base font-semibold text-black hover:bg-zinc-200"
            >
              Explore open positions
            </a>
          </div>
        </section>

        <section id="contact" className="border-y border-white/10 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Get in contact
              </h2>
              <p className="max-w-lg text-base text-zinc-400">
                Let’s talk about your roadmap, your bottlenecks, and what we can ship together.
              </p>
            </div>

            <ContactFlow />
          </div>
        </section>
      </main>

      <footer className="relative min-h-[430px] overflow-clip bg-transparent">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[330px] overflow-clip sm:h-[380px] md:h-[430px]">
          <Globe className="absolute left-1/2 top-full w-[min(88vw,720px)] max-w-none -translate-x-1/2 -translate-y-[58%] overflow-hidden rounded-full opacity-90" />
          <div
            className={
              deepBlueThemeEnabled
                ? "absolute inset-0 bg-[radial-gradient(circle_at_50%_92%,rgba(111,125,246,0.16),rgba(11,16,32,0.9)_55%,rgba(11,16,32,1)_80%)]"
                : "absolute inset-0 bg-[radial-gradient(circle_at_50%_92%,rgba(255,255,255,0.1),rgba(5,5,5,0.88)_55%,rgba(0,0,0,1)_80%)]"
            }
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 py-6 text-center text-sm text-zinc-500">
          &copy; BSoftPlats
        </div>
      </footer>
    </>
  );
}
