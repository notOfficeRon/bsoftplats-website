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
      "You buy architecture from one place, DevOps from another, the pipeline, the platform, and the bill from three more. Your engineers spend a third of their time stitching that together. None of those invoices mention it.",
    nodes: [
      {
        title: "Cloud-Native Architecture",
        lede: "What you pick on AWS at Seed is still there at Series B, whether it still fits or not.",
        bullets: [
          "A review against AWS's six Well-Architected pillars",
          "A written plan with effort, not a slide of principles",
          "Design for something you're building from scratch",
          "Migrations: monolith to services, one region to several",
          "Identity, secrets, network, encryption, detection",
          "Sizing, savings plans, and a tagging model so you can read the bill",
        ],
      },
      {
        title: "DevOps as a Service",
        lede: "You get the function on retainer. You don't hire a €100-160K person before you actually need one.",
        bullets: [
          "How often you ship, how long a change takes, how often it breaks, how fast you recover. Monthly.",
          "A named lead, and other people behind them",
          "Terraform your own team can read",
          "Metrics, logs, traces, alerts that go to someone",
          "Incidents and on-call, with response times in the contract",
        ],
      },
      {
        title: "CI/CD",
        lede: '"Improve CI/CD" has been on the board for two sprints. We build the checks. You still write the tests.',
        bullets: [
          "PR checks, test gates, artefacts, promotion",
          "Blue/green, canary, feature flags, rollback in one action",
          "Terraform plan/apply in the pipeline, with policy checks",
          "Dependency, container and secret scanning before merge",
          "A 4-hour manual release down to under 20 minutes",
        ],
      },
      {
        title: "Kubernetes",
        lede: "Most 20-person teams don't need it yet. We'll say so. If you do, we build it. After that, your app teams own the manifests, or we keep running it.",
        bullets: [
          "ECS or Fargate when that's the honest answer",
          "EKS in Terraform",
          "Version upgrades, add-ons, deprecations",
          "Karpenter, HPA, real requests and limits, spot where it's safe",
          "Argo CD or Flux",
          "RBAC, network policies, pod security, image scanning",
        ],
      },
      {
        title: "FinOps",
        lede: "The bill is high because nobody is on the hook for it.",
        bullets: [
          "See it, cut it, then keep it there",
          "Runs in your AWS account. We don't take a copy of the data",
          "AWS, Kubernetes down to namespace, databases, warehouse, CDN, third-party",
          "Cost per team, product, customer, environment, and per customer if you need it",
          "Spikes go to the owner. Four hours to act",
          "A monthly review: names, decisions, what actually got done",
        ],
      },
    ],
  },
  {
    slug: "development",
    title: "Development",
    blurb: "Most shops stop at the pull request. That's usually where things start breaking.",
    intro:
      "We don't hand you a branch and leave. The pipeline, the infra, the monitoring and a runbook come with the feature. We also run the cloud it goes onto.",
    nodes: [
      {
        title: "Cloud-Native Development",
        lede: "A lot of apps called cloud are still just servers with a bigger bill.",
        bullets: [
          "Services that scale out, don't keep local state, and tell you what they're doing",
          "Docker, ECS, EKS, or none of those if they don't help",
          "Serverless when it actually saves you money or time",
          "RDS, Aurora, OpenSearch, MSK instead of running it yourself",
          "Split the monolith in the order that hurts least",
          "Cost and speed decided in the code, not after finance forwards the invoice",
        ],
      },
      {
        title: "Product Development",
        lede: "The feature ships running. We don't pad the team. You still set the roadmap.",
        bullets: [
          "Work in your repo, your review, your sprint",
          "Backend and APIs: services, integrations, data models, speed",
          "Frontend against your design system, tested, usable with a keyboard",
          "Pipelines, third-party APIs, work that fires when something happens",
          "People by the month, or a small team with a lead and QA",
        ],
      },
      {
        title: "MVP Development",
        lede: "You're placing a bet. If it works, you shouldn't have to throw the code away. We don't decide whether you should build it. That's yours.",
        bullets: [
          "A build spec from your requirements, fixed price, you keep it",
          "Senior backend, frontend and DevOps, scoped and done",
          "AWS, infra as code from commit one, a real pipeline",
          "Deployed, monitored, backed up, written down",
          "Handover to your first hires, people we help you find, or us on retainer",
        ],
      },
    ],
  },
  {
    slug: "reliability",
    title: "Reliability",
    blurb: "Everyone has a disaster recovery plan. Almost nobody has restored from it.",
    intro:
      "Keep it up. Bring it back. Prove you can do both. Each service gets a downtime target you picked, and we design to that.",
    nodes: [
      {
        title: "High Availability",
        lede: 'People say "five nines" like it\'s a personality. We\'ll tell you which nines you can pay for. We won\'t promise more than AWS does for the thing you\'re on.',
        bullets: [
          "A target per service, and what you do when you've used up the slack",
          "More than one AZ by default. Another region only if the target needs it",
          "Services with health checks and failover you don't run by hand",
          "Timeouts, retries, circuit breakers, bulkheads",
          "Canary and blue/green, rolled back if the target breaks",
          "Load tests until it actually snaps. Autoscaling that you've seen work",
          "Dashboards and alerts on how fast you're burning the slack",
        ],
      },
      {
        title: "Disaster Recovery",
        lede: "If you've never restored the backup, you don't have one. We do the systems. Offices, people and suppliers are a different plan.",
        bullets: [
          "How fast you need to be back, how much data you can lose, priced per system",
          "Most teams only need backup/restore or a small warm spare",
          "Restores on a schedule, timed, written down",
          "Rebuild the whole environment by running a pipeline",
          "Runbooks for 3am, tested by someone who didn't write them",
          "Drills with a clock and a list of what failed",
          "Paper for SOC 2, ISO 27001, and a customer who asks",
        ],
      },
      {
        title: "Chaos Testing",
        lede: "We break it on a Tuesday, with everyone in the room. Production only if you've agreed how far it can spread and who can pull the plug.",
        bullets: [
          "Kill an instance, an AZ, the network, a dependency, a disk. AWS FIS if it fits",
          "A game day with your engineers, a scenario, and someone taking notes",
          "Load tests before launch, not during",
          "Failover timed against the numbers on paper",
          "A fix list with names, in order",
        ],
      },
    ],
  },
  {
    slug: "generative-ai",
    title: "Generative AI",
    blurb: "Most GenAI in production is a demo that got promoted.",
    intro:
      "The demo took a week. Getting it to be right, cheap, and not leaking data is the job. In your AWS account, with a spend cap.",
    nodes: [
      {
        title: "GenAI Engineering",
        lede: "An agent that's wrong one time in ten is a helpdesk. We don't train foundation models. We don't use a model where a regex would do.",
        bullets: [
          "An agent with a job: tools, a plan, memory, a person who can step in",
          "Search that works: chunking, hybrid search, reranking, who can see what",
          "Scored on your real cases, every time the prompt changes",
          "Filter in and out, prompt injection, PII, an audit trail",
          "Traces, token and latency budgets, cheap model for cheap work",
          "Bedrock, or your vendor, with your keys",
        ],
      },
      {
        title: "AI/ML Engineering",
        lede: "The notebook works. That's the easy part. Your data scientists own the model. We own the bits that have to run at 3am.",
        bullets: [
          "SageMaker or containers on AWS",
          "Data and features, versioned, you can rerun them",
          "Train, retrain, track experiments, register the model",
          "Serve live or in batch, scale, roll back",
          "Alerts a person actually gets when quality drifts",
          "GPU and inference spend that doesn't surprise you",
        ],
      },
    ],
  },
  {
    slug: "staff-augmentation",
    title: "Staff Augmentation",
    blurb: "You need people now, not after four months of hiring.",
    intro:
      "Hiring takes months. The work is already late. We put senior people in the seats you can't fill yet.",
    nodes: [
      {
        title: "Staff Augmentation",
        lede: "Senior people, contracted for the EU and Israel.",
        bullets: [
          "Backend, frontend, full-stack, DevOps, QA, performance",
          "A small team with a lead and QA on one piece of work",
          "Tech lead, product owner, engineering manager",
          "B2B, long-term, structured for EU and Israel",
          "Docs and a handoff from day one, so you're not stuck with us",
        ],
      },
    ],
  },
  {
    slug: "strategic-consulting",
    title: "Strategic Consulting",
    blurb: "The architecture you pick at Seed is the one you're still stuck with at Series C.",
    intro:
      "Early tech choices get expensive to undo. We sit outside the team and argue those before they set.",
    nodes: [
      {
        title: "Strategic Consulting",
        lede: "Not on the team. In the room for the calls that are hard to reverse.",
        bullets: [
          "What to do now, what can wait",
          "Someone who doesn't work here looking at architecture and uptime",
          "Get the codebase ready for investor diligence",
          "How you ship, review, handle incidents, run on-call",
          "Advice to the CTO, ongoing",
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
