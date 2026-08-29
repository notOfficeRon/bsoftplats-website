import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const STORY_1_PATH = "/wrong-numbers-were-hiding-real-cloud-waste";
const STORY_2_PATH = "/a-free-network-fix-ended-a-recurring-cost-spike";

const CPU_ROWS = [
  { name: "Rating DB · Primary", cpus: 20, avg: 34, peak: 73, kind: "main" as const },
  { name: "Core DB · Primary", cpus: 16, avg: 25, peak: 42, kind: "main" as const },
  { name: "Analytics · Replica", cpus: 4, avg: 13, peak: 27, kind: "standby" as const },
  { name: "Analytics · Primary", cpus: 4, avg: 13, peak: 23, kind: "main" as const },
  { name: "Core DB · Replica", cpus: 16, avg: 5, peak: 8, kind: "standby" as const },
  { name: "Core DB · Replica", cpus: 16, avg: 5, peak: 7, kind: "standby" as const },
  { name: "Rating DB · Replica", cpus: 20, avg: 3, peak: 7, kind: "standby" as const },
  { name: "Rating DB · Replica", cpus: 20, avg: 3, peak: 7, kind: "standby" as const },
];

const GB_DAYS = [
  { day: "Jun 14", gb: 280 },
  { day: "Jun 15", gb: 280 },
  { day: "Jun 16", gb: 4956 },
  { day: "Jun 17", gb: 26975 },
  { day: "Jun 18", gb: 55076 },
  { day: "Jun 19", gb: 28338 },
  { day: "Jun 20", gb: 20380 },
  { day: "Jun 21", gb: 280 },
];

function CpuChart() {
  const max = 80;
  const rowH = 36;
  const labelW = 220;
  const chartW = 480;
  const axisTop = 22;
  const height = axisTop + 18 + CPU_ROWS.length * rowH;
  const ticks = [0, 20, 40, 60, 80];

  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-sm font-medium text-zinc-200">
        Real database CPU use over 7 days: bar = average, ♦ = peak
      </p>
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-[#3b5bdb]" />
          Main databases · healthy load
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-[#c4a574]" />
          Standby copies · barely used
        </span>
      </div>
      <svg viewBox={`0 0 ${labelW + chartW + 100} ${height}`} className="h-auto w-full min-w-[720px]">
        {ticks.map((tick) => {
          const x = labelW + (tick / max) * chartW;
          return (
            <g key={tick}>
              <line x1={x} y1={axisTop} x2={x} y2={height - 8} stroke="#3f3f46" strokeWidth={1} />
              <text x={x} y={14} fill="#a1a1aa" fontSize={10} textAnchor="middle">
                {tick}%
              </text>
            </g>
          );
        })}
        {CPU_ROWS.map((row, index) => {
          const y = axisTop + 6 + index * rowH;
          const barW = (row.avg / max) * chartW;
          const peakX = labelW + (row.peak / max) * chartW;
          const fill = row.kind === "main" ? "#3b5bdb" : "#c4a574";
          return (
            <g key={`${row.name}-${index}`}>
              <text x={0} y={y + 16} fill="#d4d4d8" fontSize={11}>
                {row.name} ({row.cpus} CPUs)
              </text>
              <rect x={labelW} y={y + 6} width={Math.max(barW, 1)} height={14} fill={fill} />
              <polygon
                points={`${peakX},${y + 5} ${peakX + 5},${y + 13} ${peakX},${y + 21} ${peakX - 5},${y + 13}`}
                fill="#e4e4e7"
              />
              <text x={peakX + 10} y={y + 17} fill="#a1a1aa" fontSize={11}>
                peak {row.peak}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GbChart() {
  const max = 60000;
  const height = 260;
  const left = 56;
  const bottom = 36;
  const width = 640;
  const top = 16;
  const innerW = width - left - 16;
  const innerH = height - bottom - top;
  const barW = innerW / GB_DAYS.length - 10;
  const ticks = [0, 15000, 30000, 45000, 60000];

  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-sm font-medium text-zinc-200">Data forced onto the paid route (GB / day)</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[560px]">
        {ticks.map((tick) => {
          const y = top + innerH - (tick / max) * innerH;
          return (
            <g key={tick}>
              <line x1={left} y1={y} x2={width - 16} y2={y} stroke="#3f3f46" strokeWidth={1} />
              <text x={left - 8} y={y + 3} fill="#a1a1aa" fontSize={10} textAnchor="end">
                {tick === 0 ? "0" : `${tick / 1000}k`}
              </text>
            </g>
          );
        })}
        {GB_DAYS.map((item, index) => {
          const h = (item.gb / max) * innerH;
          const x = left + index * (innerW / GB_DAYS.length);
          const y = top + innerH - h;
          const peak = item.gb === 55076;
          return (
            <g key={item.day}>
              <rect x={x} y={y} width={barW} height={Math.max(h, 1)} fill={peak ? "#8a6a3d" : "#c4a574"} />
              <text x={x + barW / 2} y={height - 14} fill="#a1a1aa" fontSize={11} textAnchor="middle">
                {item.day.replace("Jun ", "")}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-zinc-500">Peak on Jun 18 during one weekend of production traffic. Normal level: 280 GB/day.</p>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`border p-4 ${accent ? "border-brand-primary bg-brand-primary text-white" : "border-white/12 bg-white/[0.04]"}`}>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-1 text-xs ${accent ? "text-white/85" : "text-zinc-400"}`}>{label}</p>
    </div>
  );
}

function Story1() {
  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">FinOps case study</p>
      <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
        Wrong numbers were hiding real cloud waste
      </h1>
      <p className="mb-10 max-w-3xl text-base text-zinc-300 sm:text-lg">
        How we fixed a global IoT provider's dashboards, and found real savings underneath.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">01 · The problem</p>
          <p className="text-sm leading-relaxed text-zinc-200">
            Their dashboards showed database usage up to 8× higher than reality. Nobody could plan with confidence.
          </p>
        </article>
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">02 · What caused it</p>
          <p className="text-sm leading-relaxed text-zinc-200">
            A faulty plugin was mixing two databases' readings into one, so the numbers were simply wrong.
          </p>
        </article>
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">03 · The fix</p>
          <p className="text-sm font-medium text-white">One line of code changed. Free, no downtime.</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">Dashboards now match what the cloud provider reports.</p>
        </article>
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">04 · The payoff</p>
          <p className="text-sm leading-relaxed text-zinc-200">
            With honest numbers we found standby databases sitting nearly idle (72 CPUs at under 8% use) while the main
            ones ran hot. We sized down only the idle ones.
          </p>
        </article>
      </div>

      <div className="mb-8 border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <CpuChart />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value="8x" label="inflated readings corrected" />
        <Stat value="$0" label="cost of the fix" />
        <Stat value="72 CPUs" label="idle capacity found" />
        <Stat value="$30–45K / year" label="estimated savings per year" accent />
      </div>
    </>
  );
}

function Story2() {
  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">FinOps case study · 02</p>
      <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
        A free network fix ended a recurring cost spike
      </h1>
      <p className="mb-10 max-w-3xl text-base text-zinc-300 sm:text-lg">
        How we traced a spend alert to one missing network setting, and removed the charge for good.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">01 · Spot it</p>
          <p className="text-sm leading-relaxed text-zinc-200">
            An alert flagged network costs running about 5x higher than normal in one region.
          </p>
        </article>
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">02 · Trace it</p>
          <p className="text-sm leading-relaxed text-zinc-200">
            We traced it to one production system: its data transfers jumped from 280 to 55,000 GB a day over one weekend.
          </p>
        </article>
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">03 · Find the cause</p>
          <p className="text-sm leading-relaxed text-zinc-200">
            A missing network shortcut meant the data took the long way round, through paid checkpoints, billed for every GB.
          </p>
        </article>
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary-bright">04 · The fix</p>
          <p className="text-sm leading-relaxed text-zinc-200">
            We added the shortcut: one setting, one route. Nothing to buy, no app changes. The data now travels free inside AWS.
          </p>
        </article>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Before · the paid route</p>
          <p className="mb-3 text-xs text-zinc-500">charged for every GB, at every step</p>
          <p className="text-sm text-zinc-200">App servers → Transit GW → NAT → Firewall → Internet → S3</p>
        </article>
        <article className="border border-white/12 bg-white/[0.03] p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">After · the direct route</p>
          <p className="mb-3 text-xs text-zinc-500">stays inside AWS, free</p>
          <p className="text-sm text-zinc-200">App servers → Direct shortcut → S3</p>
        </article>
      </div>

      <div className="mb-8 border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <GbChart />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value="≈ $11.5K" label="avoidable in the week we measured" />
        <Stat value="≈ $1.7M / yr" label="per year if left unfixed" accent />
        <Stat value="$0" label="cost of the fix" />
        <Stat value="1 fixed · 11 more to check" label="systems can use the same free fix" />
      </div>
      <p className="text-xs leading-relaxed text-zinc-500">
        The $1.7M yearly figure is the avoidable charge at expected production volume (~55K GB/day) multiplied by 365
        days. Only one system has been measured so far; the other 11 are estimates. Customer name is withheld.
      </p>
      <p className="mt-4 text-sm text-zinc-400">Numbers you can trust. Spend you can cut.</p>
    </>
  );
}

export function StoryPage({ path }: { path: string }) {
  useEffect(() => {
    document.body.classList.add("brand-atmosphere", "dev-blue-theme");
    return () => {
      document.body.classList.remove("brand-atmosphere", "dev-blue-theme");
    };
  }, []);

  return (
    <>
      <SiteHeader deepBlueThemeEnabled />
      <main className="min-h-screen bg-transparent pt-28 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <a
            href="/#success-stories"
            className="mb-8 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </a>
          {path === STORY_1_PATH ? <Story1 /> : null}
          {path === STORY_2_PATH ? <Story2 /> : null}
        </div>
      </main>
    </>
  );
}

export const FEATURED_STORY_PATHS = [STORY_1_PATH, STORY_2_PATH];
