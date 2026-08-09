import { type CSSProperties, type MouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";
import { MeshDriftShader } from "@/components/ui/mesh-drift-shader";
import logoBlackOnWhite from "@/images/bsoftplatslogo.png";

const WHAT_WE_DO_CARDS = [
  {
    title: "DevOps at scale",
    description:
      "CI/CD pipelines, infrastructure automation, and production-grade observability built to stay reliable under pressure.",
  },
  {
    title: "Fast delivery",
    description:
      "Lean execution loops and clear ownership so features ship quickly without sacrificing architecture quality.",
  },
  {
    title: "Product engineering",
    description:
      "From backend systems to polished frontend experiences, we build end-to-end software that works in real environments.",
  },
];

const SUCCESS_STORIES = [
  {
    title: "Banking Platform Modernization",
    summary: "Safer releases, improved uptime, and audit-ready infrastructure practices.",
    href: "#",
  },
  {
    title: "AI Feature Rollout",
    summary: "From prototype to production with guardrails, observability, and measured impact.",
    href: "#",
  },
  {
    title: "Growth-Stage Product Team",
    summary: "Accelerated roadmap delivery with a stable engineering foundation.",
    href: "#",
  },
];
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

const SERVICE_SCROLL_STEPS = [
  {
    title: "DevOps Systems",
    description:
      "We design resilient CI/CD flows, infrastructure-as-code, and runtime observability to keep delivery stable.",
  },
  {
    title: "Fast Execution",
    description:
      "Short planning cycles and direct ownership let us move from roadmap to production quickly.",
  },
  {
    title: "Product Impact",
    description:
      "Engineering decisions are tied to outcomes: performance, reliability, and measurable business value.",
  },
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
      className="group relative overflow-hidden border border-white/12 bg-white/[0.02] p-8 transition-colors duration-500 hover:bg-white/[0.04]"
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

function ReactiveInfoPanel({ children }: { children: ReactNode }) {
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setGlowPosition({ x, y });
  };

  return (
    <article
      className="group relative overflow-hidden border border-white/12 bg-white/[0.02] p-8 transition-colors duration-500 hover:bg-white/[0.04]"
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
      <div className="relative">{children}</div>
    </article>
  );
}

function ServicesScrollDemo() {
  const [revealProgress, setRevealProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const entryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId = 0;

    const updateProgress = () => {
      if (!entryRef.current) return;
      const bounds = entryRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

      // Fade in once the section top reaches the lower-middle viewport.
      const enterStart = viewportHeight * 0.9;
      const enterEnd = viewportHeight * 0.52;
      const entered = clamp01((enterStart - bounds.top) / (enterStart - enterEnd));

      // Fade out before reaching section end (so it disappears before next section fully takes over).
      const leaveStart = viewportHeight * 0.95;
      const leaveEnd = viewportHeight * 0.58;
      const leaving = clamp01((bounds.bottom - leaveEnd) / (leaveStart - leaveEnd));

      setRevealProgress(entered * leaving);

      const totalScrollable = Math.max(bounds.height - viewportHeight, 1);
      const traveled = clamp01((-bounds.top) / totalScrollable);
      setScrollProgress(traveled);
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  const activeStep = Math.min(
    SERVICE_SCROLL_STEPS.length - 1,
    Math.max(0, Math.round(scrollProgress * (SERVICE_SCROLL_STEPS.length - 1))),
  );
  const stackOpacity = 0.5 + revealProgress * 0.5;
  const stackTranslateY = 40 * (1 - revealProgress);
  const sideGlowOpacity = 0.08 + revealProgress * 0.28;

  return (
    <div ref={entryRef} className="relative">
      <div className="sticky top-20 z-10 min-h-[70vh] sm:top-24 sm:min-h-[72vh]">
        <div
          className="pointer-events-none absolute -inset-y-20 left-1/2 z-0 w-screen -translate-x-1/2 blur-[2px]"
          style={{ opacity: sideGlowOpacity }}
        >
          <div className="h-full w-full bg-[radial-gradient(700px_circle_at_0%_50%,rgba(255,255,255,0.28),transparent_58%),radial-gradient(700px_circle_at_100%_50%,rgba(255,255,255,0.28),transparent_58%)]" />
        </div>
        <div
          className="floating-blob pointer-events-none absolute left-[8%] top-[22%] z-0 h-52 w-52 rounded-full bg-white/30 blur-[95px]"
          style={{ opacity: 0.16 + revealProgress * 0.36 }}
        />
        <div
          className="floating-blob floating-blob-delay pointer-events-none absolute right-[8%] top-[56%] z-0 h-56 w-56 rounded-full bg-white/26 blur-[105px]"
          style={{ opacity: 0.14 + revealProgress * 0.34 }}
        />
        <div
          className="floating-blob pointer-events-none absolute left-[38%] top-[66%] z-0 h-44 w-44 rounded-full bg-white/20 blur-[90px]"
          style={{ opacity: 0.08 + revealProgress * 0.24 }}
        />
        <div
          className="relative z-20 mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center sm:min-h-[72vh]"
          style={{
            opacity: stackOpacity,
            transform: `translate3d(0, ${stackTranslateY}px, 0)`,
          }}
        >
          <div className="w-full">
            <h3 className="mb-6 text-center text-3xl font-semibold tracking-tight text-white sm:mb-7 sm:text-5xl">
              Our Services
            </h3>
            <p className="mb-8 text-center text-sm text-zinc-400">
              All service tracks are visible. Scroll to highlight each one.
            </p>
            <div className="space-y-4">
              {SERVICE_SCROLL_STEPS.map((step, index) => {
                const isActive = index === activeStep;
                return (
                  <article
                    key={step.title}
                    className={`border p-6 transition-all duration-500 sm:p-8 ${
                      isActive
                        ? "border-white/35 bg-white/10 shadow-[0_0_35px_rgba(255,255,255,0.16)]"
                        : "border-white/12 bg-white/[0.03] opacity-60 grayscale"
                    }`}
                  >
                    <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      Service {index + 1}
                    </p>
                    <h4 className="mb-3 text-2xl font-semibold tracking-tight text-white">
                      {step.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">
                      {step.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-0 min-h-[190vh] sm:min-h-[200vh]" />
    </div>
  );
}

export default function App() {
  const [showDevThemeToggle, setShowDevThemeToggle] = useState(false);
  const [deepBlueThemeEnabled, setDeepBlueThemeEnabled] = useState(false);
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
      if (isStoryTransitioningRef.current) return;

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
    if (isStoryTransitioning) return;
    const autoTimer = window.setTimeout(() => {
      showNextStory();
    }, STORY_DURATION_MS);
    return () => window.clearTimeout(autoTimer);
  }, [activeStoryIndex, isStoryTransitioning, showNextStory]);

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
    document.body.classList.toggle("dev-blue-theme", deepBlueThemeEnabled);
    return () => {
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

      <main className="bg-black">
        <HeroSection />

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

        <section aria-label="Companies we worked with" className="border-y border-white/10 bg-black py-5">
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

        <section id="services" className="border-t border-white/10 py-20 sm:py-28">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0">
              <MeshDriftShader className="h-full w-full opacity-55" />
              <div
                className={
                  deepBlueThemeEnabled
                    ? "absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(4,11,36,0.82)_100%)]"
                    : "absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(0,0,0,0.72)_100%)]"
                }
              />
            </div>
            <div className="relative mx-auto max-w-6xl px-6">
              <ServicesScrollDemo />
            </div>
          </div>
        </section>

        <section id="success-stories" className="border-t border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-4 text-center text-3xl font-semibold tracking-tight text-white sm:mb-6 sm:text-4xl">
              Success Stories
            </h2>
            <div className="mx-auto w-full max-w-5xl overflow-hidden border border-zinc-300 bg-white">
              <div className="sm:hidden p-4">
                <article className="grid w-full gap-5 text-black">
                  <div
                    className="flex aspect-square w-full items-center justify-center border border-zinc-300 bg-zinc-100 p-4"
                    style={partStyle("image")}
                  >
                    <img
                      src={logoBlackOnWhite}
                      alt="BSoftPlats logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="mb-3 text-2xl font-semibold text-black" style={partStyle("title")}>
                      {activeStory.title}
                    </h3>
                    <p className="mb-4 text-base leading-relaxed text-zinc-700" style={partStyle("summary")}>
                      {activeStory.summary}
                    </p>
                    <a
                      href={activeStory.href}
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
                    className="flex aspect-square w-full items-center justify-center border border-zinc-300 bg-zinc-100 p-4"
                    style={partStyle("image")}
                  >
                    <img
                      src={logoBlackOnWhite}
                      alt="BSoftPlats logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="mb-3 text-xl font-semibold text-black sm:text-2xl" style={partStyle("title")}>
                      {activeStory.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-zinc-700" style={partStyle("summary")}>
                      {activeStory.summary}
                    </p>
                    <a
                      href={activeStory.href}
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
                    <div key={story.title}>
                      <div className="mb-1 flex justify-between text-[11px] uppercase tracking-[0.14em] text-zinc-600">
                        <span className="hidden sm:inline">{story.title}</span>
                        <span className="sm:hidden">Story {index + 1}</span>
                      </div>
                      <div className="h-[2px] w-full bg-zinc-300">
                        <div
                          className="h-full bg-black"
                          style={{
                            width: isActive ? "100%" : "0%",
                            animation:
                              isActive && !isStoryTransitioning
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
          </div>
        </section>

        <section id="contact" className="border-y border-white/10 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Get in contact
              </h2>
              <p className="mb-8 max-w-lg text-base text-zinc-400">
                Let’s talk about your roadmap, your bottlenecks, and what we can ship together.
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                <Button size="lg" className="w-full rounded-full px-6 sm:w-auto">
                  Contact
                </Button>
                <Button
                  size="lg"
                  className="w-full rounded-full border border-white/25 bg-black px-6 text-white hover:bg-zinc-900 sm:w-auto"
                >
                  Apply
                  <Mail className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <ReactiveInfoPanel>
              <div className="grid gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Contact
                  </span>
                  <span className="mt-1 block text-white">Elia Terman</span>
                </div>
                <Button size="lg" className="w-fit rounded-full px-6">
                  <span>Apply</span>
                  <Mail className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </ReactiveInfoPanel>
          </div>
        </section>
      </main>

      <footer className="relative min-h-[430px] overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[330px] sm:h-[380px] md:h-[430px]">
          <Globe className="absolute left-1/2 top-full w-[min(88vw,720px)] max-w-none -translate-x-1/2 -translate-y-[58%] overflow-hidden rounded-full opacity-90" />
          <div
            className={
              deepBlueThemeEnabled
                ? "absolute inset-0 bg-[radial-gradient(circle_at_50%_92%,rgba(168,199,255,0.16),rgba(4,11,36,0.9)_55%,rgba(3,7,24,1)_80%)]"
                : "absolute inset-0 bg-[radial-gradient(circle_at_50%_92%,rgba(255,255,255,0.1),rgba(5,5,5,0.88)_55%,rgba(0,0,0,1)_80%)]"
            }
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 py-6 text-center text-sm text-zinc-500">
          &copy; B-SoftPlats
        </div>
      </footer>
    </>
  );
}
