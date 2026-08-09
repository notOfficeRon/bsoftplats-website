import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { cn } from "@/lib/utils";
import logoWhiteNoBg from "@/images/logowhitenobg.png";

const ROTATING_WORDS = ["softplats", "reliable", "fast"];
const HERO_B_LOGO_SRC = logoWhiteNoBg;

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [heroLogoFailed, setHeroLogoFailed] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % ROTATING_WORDS.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="landing"
      className="relative min-h-screen h-screen overflow-hidden bg-black bg-gradient-to-br from-black via-zinc-950 to-black"
    >
      <BackgroundPaths />

      <div className="hero-content relative z-30 mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 items-end gap-12 px-6 pb-52 pt-32 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
        <div className="relative w-full max-w-xl lg:max-w-none lg:pr-6">
          <div className="mb-8 flex items-center gap-4 sm:gap-5 lg:-ml-8">
            <span className="relative inline-flex h-[5.7rem] w-[5.7rem] items-center justify-center overflow-hidden sm:h-[7.8rem] sm:w-[7.8rem] lg:h-[9.8rem] lg:w-[9.8rem] lg:translate-y-1">
              {heroLogoFailed ? (
                <span className="text-7xl font-semibold tracking-tighter text-white sm:text-9xl lg:text-[10rem]">
                  B
                </span>
              ) : (
                <img
                  src={HERO_B_LOGO_SRC}
                  alt="B"
                  className="h-full w-full scale-[1.6] object-cover object-center"
                  onError={() => setHeroLogoFailed(true)}
                />
              )}
            </span>
            <span
              className="relative inline-block min-w-[11ch] text-7xl font-semibold tracking-tighter text-zinc-300 sm:text-9xl lg:text-[10rem]"
              aria-live="polite"
              aria-atomic="true"
            >
              {ROTATING_WORDS.map((word, index) => (
                <span
                  key={word}
                  className={cn(
                    "absolute left-0 top-0 transition-opacity duration-700 ease-in-out",
                    index === wordIndex ? "opacity-100" : "opacity-0",
                  )}
                >
                  {word}
                </span>
              ))}
              <span className="invisible">{ROTATING_WORDS[0]}</span>
            </span>
          </div>

          <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base lg:text-base">
            Focus on quality, transparency, and long-term success.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="h-14 rounded-full px-8 text-base">
              <a href="#contact">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-14 rounded-full border border-white/20 px-8 text-base text-zinc-300 hover:bg-white hover:text-black"
            >
              <a href="#services">Our Services</a>
            </Button>
          </div>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}
