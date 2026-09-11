import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICES, servicePath } from "@/lib/services";
import { SOLUTIONS, solutionPath } from "@/lib/solutions";
import logoWhiteNoBg from "@/images/logowhitenobg.png";

const LOGO_SRC = logoWhiteNoBg;
const LOGO_FALLBACK_SRC = logoWhiteNoBg;

export function PageOrbs() {
  return (
    <div className="page-orbs" aria-hidden="true">
      <span className="page-orb page-orb-a" />
      <span className="page-orb page-orb-b" />
      <span className="page-orb page-orb-c" />
    </div>
  );
}

export function SiteHeader({
  showDevThemeToggle = false,
  deepBlueThemeEnabled = false,
  onToggleDeepBlueTheme,
  showPageOrbs = false,
}: {
  showDevThemeToggle?: boolean;
  deepBlueThemeEnabled?: boolean;
  onToggleDeepBlueTheme?: () => void;
  showPageOrbs?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [linkPrefix, setLinkPrefix] = useState("");
  const servicesMenuRef = useRef<HTMLDivElement | null>(null);
  const solutionsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    setLinkPrefix(path === "/" ? "" : "/");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenus = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setSolutionsOpen(false);
  };

  useEffect(() => {
    if (!servicesOpen && !solutionsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (servicesOpen && !servicesMenuRef.current?.contains(target)) {
        setServicesOpen(false);
      }
      if (solutionsOpen && !solutionsMenuRef.current?.contains(target)) {
        setSolutionsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setSolutionsOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen, solutionsOpen]);

  return (
    <>
    {showPageOrbs ? <PageOrbs /> : null}
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[72px] transition-colors",
        scrolled &&
          (deepBlueThemeEnabled
            ? "border-b border-white/[0.12] bg-surface-deep/90 backdrop-blur-xl"
            : "border-b border-white/[0.12] bg-canvas-dark/80 backdrop-blur-xl"),
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-8 px-4 md:px-8">
        <nav
          className={cn(
            "absolute left-4 right-4 top-[calc(72px+0.5rem)] flex flex-col gap-1 border border-white/10 p-2 md:static md:left-auto md:right-auto md:top-auto md:flex-row md:items-center md:gap-10 md:border-0 md:bg-transparent md:p-0",
            deepBlueThemeEnabled ? "bg-surface-deep" : "bg-canvas-dark",
            menuOpen ? "flex" : "hidden md:flex",
          )}
          aria-label="Primary"
        >
          <a
            href={`${linkPrefix}#about`}
            className="rounded px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-white md:p-0"
            onClick={closeMenus}
          >
            About
          </a>

          <div className="relative" ref={servicesMenuRef}>
            <button
              type="button"
              className="flex items-center gap-1 rounded px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-white md:p-0"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              onClick={() => {
                setSolutionsOpen(false);
                setServicesOpen((open) => !open);
              }}
            >
              Services
              <ChevronDown className={cn("h-4 w-4 transition-transform", servicesOpen && "rotate-180")} />
            </button>
            <div
              className={cn(
                "flex-col border border-white/10 py-2 md:absolute md:left-0 md:top-full md:z-50 md:min-w-[16rem] md:border",
                deepBlueThemeEnabled ? "bg-surface-deep" : "bg-canvas-dark",
                servicesOpen ? "flex" : "hidden",
              )}
            >
              {SERVICES.map((service) => (
                <a
                  key={service.slug}
                  href={servicePath(service.slug)}
                  className="px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                  onClick={closeMenus}
                >
                  {service.title}
                </a>
              ))}
              <a
                href={`${linkPrefix}#services`}
                className="px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
                onClick={closeMenus}
              >
                All services
              </a>
            </div>
          </div>

          <div className="relative" ref={solutionsMenuRef}>
            <button
              type="button"
              className="flex items-center gap-1 rounded px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-white md:p-0"
              aria-expanded={solutionsOpen}
              aria-haspopup="true"
              onClick={() => {
                setServicesOpen(false);
                setSolutionsOpen((open) => !open);
              }}
            >
              Solutions
              <ChevronDown className={cn("h-4 w-4 transition-transform", solutionsOpen && "rotate-180")} />
            </button>
            <div
              className={cn(
                "flex-col border border-white/10 py-2 md:absolute md:left-0 md:top-full md:z-50 md:min-w-[16rem] md:border",
                deepBlueThemeEnabled ? "bg-surface-deep" : "bg-canvas-dark",
                solutionsOpen ? "flex" : "hidden",
              )}
            >
              {SOLUTIONS.map((solution) => (
                <a
                  key={solution.slug}
                  href={solutionPath(solution.slug)}
                  className="px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                  onClick={closeMenus}
                >
                  {solution.title}
                </a>
              ))}
              <a
                href={`${linkPrefix}#solutions`}
                className="px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
                onClick={closeMenus}
              >
                All solutions
              </a>
            </div>
          </div>

          <a
            href={`${linkPrefix}#success-stories`}
            className="rounded px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-white md:p-0"
            onClick={closeMenus}
          >
            Success Stories
          </a>
          <a
            href={`${linkPrefix}#careers`}
            className="rounded px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-white md:p-0"
            onClick={closeMenus}
          >
            Careers
          </a>
          <a
            href={`${linkPrefix}#contact`}
            className="rounded border border-white/20 px-4 py-2 text-sm text-zinc-100 transition-colors hover:bg-white hover:text-black md:py-1.5"
            onClick={closeMenus}
          >
            Apply or Contact
          </a>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-white/20 md:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="block h-0.5 w-4 bg-white" />
          <span className="block h-0.5 w-4 bg-white" />
        </button>

        <div className="flex shrink-0 items-center gap-3">
          {showDevThemeToggle ? (
            <button
              type="button"
              className={cn(
                "rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors sm:px-3 sm:text-xs",
                deepBlueThemeEnabled
                  ? "border-blue-300/70 bg-blue-950 text-blue-100"
                  : "border-white/25 bg-black text-zinc-200 hover:border-white/50",
              )}
              onClick={onToggleDeepBlueTheme}
              aria-pressed={deepBlueThemeEnabled}
              aria-label="Toggle deep blue theme"
            >
              <span className="sm:hidden">Blue</span>
              <span className="hidden sm:inline">Deep Blue</span>
            </button>
          ) : null}
          <a href={linkPrefix || "#landing"} className="flex items-center gap-0">
            <img
              src={LOGO_SRC}
              alt="BSoftPlats logo"
              className={cn(
                "object-contain transition-all duration-200",
                scrolled ? "h-8 w-8 sm:h-9 sm:w-9" : "h-12 w-12 sm:h-14 sm:w-14",
              )}
              onError={(event) => {
                event.currentTarget.src = LOGO_FALLBACK_SRC;
              }}
            />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-2xl font-semibold leading-none tracking-tight text-white transition-all duration-200",
                scrolled ? "-ml-1.5 max-w-[180px] opacity-100 sm:-ml-2" : "ml-0 max-w-0 opacity-0",
              )}
              aria-hidden={!scrolled}
            >
              SoftPlats
            </span>
          </a>
        </div>
      </div>
    </header>
    </>
  );
}
