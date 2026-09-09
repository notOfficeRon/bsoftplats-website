export type Service = {
  slug: string;
  title: string;
  blurb: string;
  body: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "devsecops-cloud",
    title: "DevSecOps & Cloud",
    blurb: "Stable, scalable infrastructure with monitoring built in for performance and security.",
    body: [
      "Expertise in stable, scalable infrastructures with integrated monitoring for optimal performance and security.",
      "Infrastructure as Code, CI/CD pipeline setup and optimization, security through the development lifecycle, and performance monitoring.",
    ],
  },
  {
    slug: "cloud-migration",
    title: "Cloud migration & architecture",
    blurb: "Cloud migration and architecture design, with infrastructure as code from the start.",
    body: [
      "Cloud migration and architecture design so the environment you land in is the one you can operate.",
      "Infrastructure as Code implementation so the design is repeatable, not a one-off console build.",
    ],
  },
  {
    slug: "full-stack-development",
    title: "Full-Stack Development",
    blurb: "End-to-end development with full visibility, detailed documentation, and a clean handover.",
    body: [
      "Comprehensive development with full visibility throughout the project lifecycle, detailed documentation, and smooth handovers.",
      "Frontend and backend, APIs, and knowledge transfer so the work can be owned after we leave.",
    ],
  },
  {
    slug: "ai-solutions",
    title: "AI Solutions",
    blurb:
      "Implementing cutting-edge Generative AI solutions through strategic collaborations to transform your business.",
    body: [
      "Leveraging AI technologies to build intelligent applications and automation, including strategy consulting.",
      "Delivered with partners such as Flametree.ai: model integration, NLP, computer vision, predictive analytics, and machine learning pipelines.",
    ],
  },
  {
    slug: "automation",
    title: "Automation Solutions",
    blurb: "Streamlining business processes through intelligent automation to increase efficiency and reduce costs.",
    body: [
      "Business process automation, workflow optimization, RPA, and custom tools that integrate with systems you already run.",
      "Delivered with partners such as Skipper-Soft, including an automation strategy and roadmap.",
    ],
  },
  {
    slug: "talent-solutions",
    title: "Talent Solutions",
    blurb: "Providing highly skilled professionals tailored to meet your specific business needs and technical requirements.",
    body: [
      "Highly skilled professionals matched to the client’s technical needs.",
      "The same people-first bar as the rest of the work: the team that shows up is the team that delivers.",
    ],
  },
  {
    slug: "partnership-projects",
    title: "Partnership Projects",
    blurb: "Implementing integrations in banking and Generative AI through strategic collaborations.",
    body: [
      "Beyond core delivery, we run partnership projects that plug specialized partners into the work.",
      "Current strategic collaborations include banking and Generative AI.",
    ],
  },
  {
    slug: "support-maintenance",
    title: "Support & maintenance",
    blurb: "Full project transparency, with independent maintenance or ongoing support via a bank of hours.",
    body: [
      "Clients receive full project transparency, with the option for independent maintenance or ongoing support via a bank of hours.",
      "24/7 support and maintenance options where the operating model needs it.",
    ],
  },
];

export function getService(slug: string) {
  return SERVICES.find((service) => service.slug === slug) ?? null;
}

export function servicePath(slug: string) {
  return `/services/${slug}`;
}
