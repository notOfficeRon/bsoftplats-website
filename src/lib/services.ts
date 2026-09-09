export type ServiceNode = {
  title: string;
  lede: string;
  bullets: string[];
};

export type Service = {
  slug: string;
  title: string;
  blurb: string;
  intro: string;
  nodes: ServiceNode[];
};

export const SERVICES: Service[] = [
  {
    slug: "cloud-management",
    title: "Cloud Management",
    blurb: "Your cloud has five owners. It should have one.",
    intro:
      "Architecture, the DevOps function, the pipeline, the platform and the bill get bought from five places, and every gap between them becomes your engineers' problem — the 30–40% DevOps tax that never appears on any of the five invoices.",
    nodes: [
      {
        title: "Cloud-Native Architecture",
        lede: "The AWS decisions you make at Seed set your Series B ceiling.",
        bullets: [
          "AWS Well-Architected · six pillars",
          "Architecture review and roadmap with effort estimates",
          "Greenfield design for new products and platforms",
          "Migrations — monolith to services, single to multi-region",
          "Security architecture: identity, secrets, network, encryption, detection",
          "Cost architecture: right-sizing, savings plans, tagging model",
        ],
      },
      {
        title: "DevOps as a Service",
        lede: "Your DevOps function, on retainer, without the €100–160K hire at the wrong stage.",
        bullets: [
          "DORA four keys · reported monthly",
          "Named lead and bench — the ongoing function",
          "Infrastructure as code, Terraform, readable by your team",
          "Observability: metrics, logs, traces, alerting",
          "Incident response and on-call with contracted response times",
          "Deployment frequency, lead time, change failure rate, time to restore",
        ],
      },
      {
        title: "CI/CD",
        lede: '"Improve CI/CD" has been on your roadmap for two sprints. Where we stop: we build the gates. We don\'t write your test suite.',
        bullets: [
          "Pipeline design and build — PR checks, test gates, artefacts, promotion",
          "Blue/green, canary, feature flags, one-action rollback",
          "Terraform plan/apply in the pipeline with policy checks",
          "Dependency, container and secret scanning before merge",
          "From a 4-hour manual release to under 20 minutes",
        ],
      },
      {
        title: "Kubernetes",
        lede: "The right answer to a question most 20-engineer teams haven't asked yet. Where we stop: after handover, app teams own their manifests — or we keep running it under DevOps as a Service.",
        bullets: [
          "Fit assessment — ECS or Fargate when that's the honest answer",
          "EKS design and build in Terraform",
          "Lifecycle: version upgrades, add-ons, deprecations",
          "Karpenter, HPA, real requests and limits, spot where safe",
          "GitOps with Argo CD or Flux",
          "RBAC, network policies, pod security, image scanning",
        ],
      },
      {
        title: "FinOps",
        lede: "Cloud cost is an ownership problem before it's a tooling problem.",
        bullets: [
          "FinOps Foundation · Inform → Optimize → Operate",
          "Platform deployed into your account — your data stays in your perimeter",
          "Every component onboarded: AWS, Kubernetes to namespace, databases, warehouse, CDN, third-party",
          "Allocation per team, product, customer, environment — and unit economics",
          "Anomalies routed to the owner, fixed within four hours",
          "Monthly cost review: named owners, decision log, tracked actions",
        ],
      },
    ],
  },
  {
    slug: "development",
    title: "Development",
    blurb: "Most development shops stop at the pull request. That's where your problems start.",
    intro:
      "Everything here ships deploy-ready — pipeline, infrastructure, monitoring and runbook with the feature — because the same company runs the cloud it lands on.",
    nodes: [
      {
        title: "Cloud-Native Development",
        lede: 'Most "cloud" applications are server applications with a cloud bill attached.',
        bullets: [
          "Stateless, instrumented, horizontally scaling services — twelve-factor by default",
          "Containerisation — Docker, ECS, EKS, or neither",
          "Serverless where it earns its place",
          "Managed over self-managed: RDS, Aurora, OpenSearch, MSK",
          "Monolith modernisation in risk order",
          "Cost and performance decisions made in the code",
        ],
      },
      {
        title: "Product Development",
        lede: "Product engineering that ships deploy-ready, not commit-ready. Where we stop: no padded teams, and the roadmap is yours.",
        bullets: [
          "Feature development inside your repo, review and sprint",
          "Backend and API — services, integrations, data models, performance",
          "Frontend against a design system, tested, accessible",
          "Data pipelines, third-party integrations, event-driven flows",
          "Embedded engineers by the month, or a dedicated team with lead and QA",
        ],
      },
      {
        title: "MVP Development",
        lede: "An MVP is a bet. Build it so that winning doesn't mean rebuilding. Where we stop: \"should we build this\" is yours. Discovery and market validation aren't ours.",
        bullets: [
          "Scoping — requirements into a build spec, fixed price, yours to keep",
          "Fixed-scope build by a senior backend, frontend and DevOps team",
          "Architecture that survives success: AWS, IaC from the first commit, real pipeline",
          "Working software — deployed, monitored, backed up, documented",
          "Handover to your first hires, a team we help you find, or us on retainer",
        ],
      },
    ],
  },
  {
    slug: "reliability",
    title: "Reliability",
    blurb: "Everyone has a disaster recovery plan. Almost nobody has tested one.",
    intro:
      "Three disciplines: build so it doesn't fail, recover when it does, prove both — against an SLO per service and the error budget that goes with it.",
    nodes: [
      {
        title: "High Availability",
        lede: '"Five nines" is a number people say. We\'ll tell you which nines you can afford. SRE model · SLOs and error budgets. Where we stop: your ceiling is the AWS SLA for what you run on. We won\'t promise above it.',
        bullets: [
          "SLO per service, error budget, and a policy for when it's spent",
          "Multi-AZ by default, multi-region where the target justifies it",
          "Stateless, health-checked services with managed failover",
          "Timeouts, retries, circuit breakers, bulkheads",
          "Canary and blue/green with automated rollback on SLO breach",
          "Load testing to the real breaking point, proven autoscaling",
          "SLO dashboards and burn-rate alerting",
        ],
      },
      {
        title: "Disaster Recovery",
        lede: "A backup you've never restored is a hypothesis. AWS DR tiers · backup/restore → pilot light → warm standby → active/active. Where we stop: the technology. Business continuity for people, offices and suppliers is a separate plan.",
        bullets: [
          "RTO and RPO defined per system, costed per tier",
          "The right DR strategy per tier — most need the first two",
          "Backups proven: restored end to end on a schedule, timed, evidenced",
          "Full environment rebuild as a pipeline run",
          "Runbooks written for 3am and tested by someone who didn't write them",
          "Scheduled drills with measured RTO, RPO and a gap list",
          "Evidence for SOC 2, ISO 27001 and enterprise due diligence",
        ],
      },
      {
        title: "Chaos Testing",
        lede: "Break it on a Tuesday afternoon, on purpose, with everyone watching. Principles of Chaos Engineering · hypothesis, blast radius, rollback. Where we stop: nothing in production without an agreed blast radius and a named person who can stop it.",
        bullets: [
          "Fault injection — instance, AZ, network, dependency, disk (AWS FIS where it fits)",
          "Game days with your engineers, a scenario and a scribe",
          "Load and performance testing before the launch, not during",
          "Failover rehearsal timed against the RTO/RPO on paper",
          "Every experiment ends in a prioritised fix list with owners",
        ],
      },
    ],
  },
  {
    slug: "generative-ai",
    title: "Generative AI",
    blurb: "Most GenAI in production is a demo that got promoted.",
    intro:
      "The prototype took a week; making it reliable, evaluated, secure and affordable is the engineering. On AWS, in your account, with a cost budget attached.",
    nodes: [
      {
        title: "GenAI Engineering",
        lede: "An agent that's right 90% of the time is a support ticket generator. Where we stop: no foundation-model training, and no LLM where a regex would do.",
        bullets: [
          "Agents scoped to a job — tool use, planning, memory, human in the loop",
          "Retrieval done properly: chunking, hybrid search, reranking, access control",
          "Evaluation on your real cases, scored on every change",
          "Guardrails: input/output filtering, prompt-injection defence, PII handling, audit trail",
          "Tracing, token and latency budgets, model routing",
          "Bedrock or your provider through your own keys",
        ],
      },
      {
        title: "AI/ML Engineering",
        lede: "The notebook works. That was the easy part. Where we stop: your data scientists own the model. We own everything around it that runs at 3am.",
        bullets: [
          "ML platform on AWS — SageMaker or container-based",
          "Data and feature pipelines, versioned and reproducible",
          "Training and retraining pipelines, experiment tracking, model registry",
          "Real-time and batch serving, autoscaling, rollback",
          "Monitoring, drift and quality metrics that alert a person",
          "GPU and inference cost control",
        ],
      },
    ],
  },
  {
    slug: "staff-augmentation",
    title: "Staff Augmentation",
    blurb: "Engineering capacity now, without the four-month hiring lag.",
    intro: "Engineering capacity now, without the four-month hiring lag.",
    nodes: [
      {
        title: "Staff Augmentation",
        lede: "Senior people in the seats you can't fill in time, contracted for EU and Israel.",
        bullets: [
          "Senior ICs — backend, frontend, full-stack, DevOps, QA, performance",
          "Dedicated teams with a lead and QA owning a workstream",
          "Leadership roles — tech lead, product owner, engineering manager",
          "B2B contracts structured for EU and Israel, long-term placements",
          "Documentation and handoff plan from day one",
        ],
      },
    ],
  },
  {
    slug: "strategic-consulting",
    title: "Strategic Consulting",
    blurb: "Technology decisions made at Seed follow you to Series C.",
    intro: "Technology decisions made at Seed follow you to Series C.",
    nodes: [
      {
        title: "Strategic Consulting",
        lede: "Outside the team, on the decisions that compound.",
        bullets: [
          "Technology roadmap — what now, what can wait",
          "Architecture and reliability review from outside the team",
          "Pre-raise technical due diligence preparation",
          "Engineering process: cadence, review, incident management, on-call",
          "CTO advisory, ongoing",
        ],
      },
    ],
  },
];

export function getService(slug: string) {
  return SERVICES.find((service) => service.slug === slug) ?? null;
}

export function servicePath(slug: string) {
  return `/services/${slug}`;
}
