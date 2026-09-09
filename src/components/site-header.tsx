import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logoWhiteNoBg from "@/images/logowhitenobg.png";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#success-stories", label: "Success Stories" },
  { href: "#careers", label: "Careers" },
];

const LOGO_SRC = logoWhiteNoBg;
const LOGO_FALLBACK_SRC = logoWhiteNoBg;

export function SiteHeader({
  showDevThemeToggle = false,
  deepBlueThemeEnabled = false,
  onToggleDeepBlueTheme,
}: {
  showDevThemeToggle?: boolean;
  deepBlueThemeEnabled?: boolean;
  onToggleDeepBlueTheme?: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [linkPrefix, setLinkPrefix] = useState("");

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

  return (
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
          {NAV_LINKS.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={`${linkPrefix}${link.href}`}
              className="rounded px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-white md:p-0"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={`${linkPrefix}#contact`}
            className="rounded border border-white/20 px-4 py-2 text-sm text-zinc-100 transition-colors hover:bg-white hover:text-black md:py-1.5"
            onClick={() => setMenuOpen(false)}
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
  );
}
