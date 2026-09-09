import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getService, type Service, type ServiceNode } from "@/lib/services";

const STOP_MARKER = "Where we stop:";

function splitLede(lede: string) {
  const index = lede.indexOf(STOP_MARKER);
  if (index === -1) return { headline: lede, stop: "" };
  return {
    headline: lede.slice(0, index).trim(),
    stop: lede.slice(index).trim(),
  };
}

function padStep(index: number) {
  return String(index + 1).padStart(2, "0");
}

function CloudManagementLayout({ nodes }: { nodes: ServiceNode[] }) {
  return (
    <div className="space-y-0">
      {nodes.map((node, index) => (
        <article
          key={node.title}
          className="grid gap-5 border-t border-white/12 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10"
        >
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-zinc-500">{padStep(index)}</p>
            <h2 className="mb-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{node.title}</h2>
            {node.lede ? <p className="text-sm leading-relaxed text-zinc-400">{node.lede}</p> : null}
          </div>
          <div className="flex flex-wrap content-start gap-2">
            {node.bullets.map((item) => (
              <p
                key={item}
                className="border border-white/12 bg-white/[0.03] px-3 py-1.5 text-sm leading-relaxed text-zinc-300"
              >
                {item}
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function DevelopmentLayout({ nodes }: { nodes: ServiceNode[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-3 md:gap-6">
      {nodes.map((node) => (
        <article key={node.title} className="border-t border-white/12 pt-5">
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-white">{node.title}</h2>
          {node.lede ? <p className="mb-5 text-sm leading-relaxed text-zinc-400">{node.lede}</p> : null}
          <div className="space-y-3">
            {node.bullets.map((item) => (
              <p key={item} className="text-sm leading-relaxed text-zinc-300">
                {item}
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ReliabilityBlock({
  node,
  index,
  wide,
}: {
  node: ServiceNode;
  index: number;
  wide?: boolean;
}) {
  const { headline, stop } = splitLede(node.lede);
  return (
    <article className={wide ? "border border-white/12 p-6 sm:p-8" : "border border-white/12 p-5 sm:p-6"}>
      <p className="mb-3 text-4xl font-semibold tracking-tight text-white/25">{padStep(index)}</p>
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">{node.title}</h2>
      {headline ? <p className="mb-5 text-sm leading-relaxed text-zinc-400">{headline}</p> : null}
      <div className="space-y-2.5">
        {node.bullets.map((item) => (
          <p key={item} className="border-l border-brand-primary/50 pl-3 text-sm leading-relaxed text-zinc-300">
            {item}
          </p>
        ))}
      </div>
      {stop ? <p className="mt-5 text-sm leading-relaxed text-zinc-500 italic">{stop}</p> : null}
    </article>
  );
}

function ReliabilityLayout({ nodes }: { nodes: ServiceNode[] }) {
  const [first, second, third] = nodes;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {first ? <ReliabilityBlock node={first} index={0} /> : null}
        {second ? <ReliabilityBlock node={second} index={1} /> : null}
      </div>
      {third ? <ReliabilityBlock node={third} index={2} wide /> : null}
    </div>
  );
}

function GenerativeAiLayout({ nodes }: { nodes: ServiceNode[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {nodes.map((node, index) => (
        <article
          key={node.title}
          className={
            index === 0
              ? "border border-white/12 bg-white/[0.04] p-6 sm:p-8"
              : "border border-white/12 p-6 sm:p-8"
          }
        >
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white">{node.title}</h2>
          {node.lede ? <p className="mb-6 text-sm leading-relaxed text-zinc-400">{node.lede}</p> : null}
          <div>
            {node.bullets.map((item) => (
              <p
                key={item}
                className="border-t border-white/10 py-3 text-sm leading-relaxed text-zinc-300 first:border-t-0 first:pt-0"
              >
                {item}
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function StaffAugmentationLayout({ nodes }: { nodes: ServiceNode[] }) {
  const node = nodes[0];
  if (!node) return null;
  return (
    <div>
      {node.lede ? (
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-zinc-300">{node.lede}</p>
      ) : null}
      <div className="border-t border-white/12">
        {node.bullets.map((item) => (
          <p key={item} className="border-b border-white/12 py-4 text-base leading-relaxed text-zinc-200">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function StrategicConsultingLayout({ nodes }: { nodes: ServiceNode[] }) {
  const node = nodes[0];
  if (!node) return null;
  return (
    <div className="max-w-2xl">
      {node.lede ? (
        <p className="mb-12 border-l border-white/20 pl-5 text-lg leading-relaxed text-zinc-300">{node.lede}</p>
      ) : null}
      <div className="space-y-10">
        {node.bullets.map((item, index) => (
          <p key={item} className="text-base leading-relaxed text-zinc-200">
            <span className="mr-3 text-xs font-semibold tracking-[0.18em] text-zinc-500">{padStep(index)}</span>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function ServiceBody({ service }: { service: Service }) {
  switch (service.slug) {
    case "cloud-management":
      return <CloudManagementLayout nodes={service.nodes} />;
    case "development":
      return <DevelopmentLayout nodes={service.nodes} />;
    case "reliability":
      return <ReliabilityLayout nodes={service.nodes} />;
    case "generative-ai":
      return <GenerativeAiLayout nodes={service.nodes} />;
    case "staff-augmentation":
      return <StaffAugmentationLayout nodes={service.nodes} />;
    case "strategic-consulting":
      return <StrategicConsultingLayout nodes={service.nodes} />;
    default:
      return null;
  }
}

function bodyMaxWidth(slug: string) {
  if (slug === "staff-augmentation" || slug === "strategic-consulting") return "max-w-3xl";
  return "max-w-5xl";
}

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
        showPageOrbs
      />
      <main className="relative z-10 min-h-screen bg-transparent pt-28 pb-24">
        <div className={`mx-auto px-6 ${bodyMaxWidth(service.slug)}`}>
          <a
            href="/#services"
            className="mb-8 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </a>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Services</p>
          <h1 className="mb-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {service.title}
          </h1>
          <p className="mb-12 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">{service.intro}</p>
          <ServiceBody service={service} />
          <div className="mt-12 flex justify-center">
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
