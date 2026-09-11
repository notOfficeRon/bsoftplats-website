export type Solution = {
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  blurb: string;
  tag: string;
  stop: string;
  bullets: string[];
};

export const SOLUTIONS_INTRO =
  "Products that stay after the engagement ends. Four platforms we built because no tool on the market did the whole job for the teams we work with. Each one deploys into your environment, works on any cloud or on premises, and reports to you, not to a vendor.";

export const SOLUTIONS: Solution[] = [
  {
    slug: "chaos-testing",
    code: "prod.01",
    title: "Plats Seismic",
    subtitle: "Chaos Testing Platform",
    blurb: "Your architecture diagram says the system survives losing a zone. This is how you find out.",
    tag: "Principles of Chaos Engineering · any cloud · on premises",
    stop: "It finds weaknesses. It doesn't fix them. It refuses any experiment without an abort condition.",
    bullets: [
      "Injects real failures safely: instance, pod, zone, network, dependency, disk, DNS, clock",
      "Every experiment has a hypothesis, blast radius, abort condition and rollback",
      "Watches every component during the run and records a timeline per component",
      "Own control plane, experiment store and monitoring. No third party tool required",
      "Scheduled, versioned, triggered by deployments. History shows resilience per release",
      "Report with measured recovery time and a gap list with owners",
    ],
  },
  {
    slug: "load-performance",
    code: "prod.02",
    title: "Plats Ballast",
    subtitle: "Load & Performance Platform",
    blurb: "Find the breaking point before your biggest customer does.",
    tag: "Built-in monitoring · no Grafana, no Datadog",
    stop: "It tells you where the system breaks and why. Moving the number is engineering work.",
    bullets: [
      "Traffic at scale: HTTP, gRPC, WebSocket, queues, databases; ramp, soak, spike, stress",
      "Benchmarks versions, configurations, instance types and regions side by side",
      "Own agents and collectors: latency next to CPU, queue depth, connection pool, GC pause, in one timeline",
      "Full suite: functional, integration, contract, load, resilience under load, soak",
      "Analysis in the product: first component to degrade, bottleneck, headroom, likely fix",
    ],
  },
  {
    slug: "finops",
    code: "prod.03",
    title: "Plats Tally",
    subtitle: "FinOps Platform",
    blurb: "Every resource you pay for. Cloud, on premises or AI. One owner per line.",
    tag: "FinOps Foundation · Inform → Optimize → Operate",
    stop: "It shows the cost and the owner. It doesn't resize or delete anything on its own.",
    bullets: [
      "Any resource anywhere: AWS, Azure, Google Cloud, on premises, Kubernetes to namespace, warehouses, CDN, third party",
      "AI spend as a first class resource: tokens, GPU hours, inference endpoints, cost per agent run",
      "Allocation per team, product, customer, environment; unit economics",
      "Anomalies routed to the owner, fixed within four hours",
      "Monthly cost review process; dependency, handover and support answered on the page",
      "Licensing not a percentage of spend; starts narrow and extends",
    ],
  },
  {
    slug: "observability",
    code: "prod.04",
    title: "Plats Aperture",
    subtitle: "Observability Platform",
    blurb: "One place to see the whole system. Built for the person on call, not the vendor's pricing page.",
    tag: "OpenTelemetry native · the foundation the other three build on",
    stop: "It shows what the system is doing. Runbooks and fixes are Reliability and Cloud Management.",
    bullets: [
      "Infrastructure: hosts, containers, Kubernetes, networks, databases, queues, storage; one agent",
      "APM: distributed tracing, latency and errors per endpoint, query analysis, dependency maps",
      "AI monitoring: model and agent calls traced; tokens, cost, refusals, drift, eval scores",
      "Synthetic: scripted user journeys from multiple locations, alerting that names the failed step",
      "Dashboards per role, SLOs with burn rate alerts, symptom to trace to log line",
      "Telemetry stays in your perimeter; retention is your policy; cost not tied to data volume",
    ],
  },
];

export function getSolution(slug: string) {
  return SOLUTIONS.find((solution) => solution.slug === slug) ?? null;
}

export function solutionPath(slug: string) {
  return `/solutions/${slug}`;
}
