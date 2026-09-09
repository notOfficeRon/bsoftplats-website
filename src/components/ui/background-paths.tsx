import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.8 + i * 0.04,
    opacity: 0.12 + i * 0.02,
    duration: 18 + (i % 12) * 2,
    delay: i * -1.4,
  }));

  return (
    <svg
      className="block h-full w-full text-zinc-300/35"
      viewBox="-520 -220 1380 1120"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      {paths.map((path) => (
        <path
          key={path.id}
          className="hero-path"
          d={path.d}
          stroke="currentColor"
          strokeWidth={path.width}
          strokeLinecap="butt"
          strokeOpacity={path.opacity}
          style={
            {
              "--path-duration": `${path.duration}s`,
              "--path-delay": `${path.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  );
}

export function BackgroundPaths({
  className,
  reverse = false,
}: {
  className?: string;
  reverse?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const margin = Math.round(window.innerHeight * 0.35);
    const sync = (visible: boolean) => {
      setInView((current) => (current === visible ? current : visible));
    };

    const rect = el.getBoundingClientRect();
    sync(rect.bottom > -margin && rect.top < window.innerHeight + margin);

    const observer = new IntersectionObserver(
      ([entry]) => {
        sync(entry.isIntersecting);
      },
      { root: null, rootMargin: `${margin}px 0px`, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full min-h-screen w-full overflow-hidden",
        className,
      )}
    >
      {inView ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 origin-center",
            reverse && "scale-x-[-1]",
          )}
        >
          <div className="hero-paths-layer pointer-events-none absolute inset-0">
            <FloatingPaths position={1} />
          </div>
          <div className="hero-paths-layer pointer-events-none absolute inset-0">
            <FloatingPaths position={-1} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
