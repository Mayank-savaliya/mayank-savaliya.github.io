import alma from "../assets/AlmaConnect.png";
import news from "../assets/KarmaBoxFeed.png";
import data from "../assets/DataMine.png";
import builder from "../assets/IITKGPStaticWebsite.png";

export const profile = {
  name: "Mayank Savaliya",
  role: "Associate Tech Lead",
  company: "AlmaConnect",
  email: "mayanksavaliya123@gmail.com",
  github: "https://github.com/Mayank-savaliya",
  linkedin: "https://www.linkedin.com/in/mayank-savaliya-6bb197191/",
  resume: "/Mayank-Savaliya-Resume.pdf",
};

export const projects = [
  {
    id: "alma",
    title: "A place for every connection.",
    name: "AlmaConnect",
    category: "Community & connection",
    image: alma,
    imageAlt: "AlmaConnect alumni network homepage",
    url: "https://www.almaconnect.com/",
    description:
      "An alumni platform that brings people, opportunities, and knowledge together. Personalized feeds, mentorship discovery, and experiences built around the community.",
    tech: "Ruby on Rails · React · MongoDB",
    caption: "Building the connections that outlast a campus.",
  },
  {
    id: "news",
    title: "The world makes news. We find the signal.",
    name: "KarmaBox / AlmaNews",
    category: "News from the wider world",
    image: news,
    imageAlt: "KarmaBox news intelligence feed and prospect dashboard",
    url: "https://news.almaconnect.com/",
    description:
      "News intelligence spanning 400,000+ sources and 25M+ prospects. Behind the headlines: a distributed backend processing 1.2B+ background jobs every month.",
    tech: "React · Rails · Sidekiq Pro · NLP",
    caption: "400,000+ sources. One remarkably useful feed.",
  },
  {
    id: "data",
    title: "A directory that keeps up with life.",
    name: "DataMine",
    category: "Discoveries & intelligence",
    image: data,
    imageAlt: "AlmaConnect DataMine employment directory homepage",
    url: "https://news.almaconnect.com/data_mine",
    description:
      "Alumni employment intelligence, powerful filters, and data-rich directories that help teams discover the right people as their careers evolve.",
    tech: "React · MongoDB · Elasticsearch",
    caption: "Turning a sea of information into a clear next step.",
  },
  {
    id: "builder",
    title: "A little less code. A lot more possibility.",
    name: "No-code website builder",
    category: "Ingenious inventions",
    image: builder,
    imageAlt: "IIT Kharagpur alumni website built with the no-code platform",
    url: "https://alumni.iima.ac.in/",
    description:
      "A website builder that puts publishing in the hands of non-technical teams. Adoption grew from 16 to 118 active sites, with approximately 90% less service and maintenance effort.",
    tech: "React · Ruby on Rails · Automation",
    caption: "An IIT Kharagpur alumni site, one of the platform’s creations.",
  },
];

export const experience = [
  {
    chapter: "IV",
    title: "Associate Tech Lead",
    dates: "July 2026 — Present",
    short: "The architect’s chapter",
    text: "Architecting R3, a next-generation multi-tenant CRM. Owning the path from data model and system boundaries to production delivery.",
    points: [
      "Schema-per-workspace tenancy with PostgreSQL and pooled database access.",
      "Resilient MongoDB-to-PostgreSQL synchronization with signed webhooks and idempotent processing.",
      "AI-powered reports, secure exports, and engineering standards across HTTP and worker runtimes.",
    ],
    stack: "TypeScript · Hono · React · PostgreSQL · Redis · BullMQ",
  },
  {
    chapter: "III",
    title: "Senior Software Engineer",
    dates: "April 2023 — June 2026",
    short: "Making room for scale",
    text: "Led AlmaNews end to end: a news-intelligence product spanning 400,000+ sources and 25M+ prospects.",
    points: [
      "Built distributed workflows processing 1.2B+ background jobs per month.",
      "Reduced hot-path query latency by 30%+ and accelerated high-cardinality aggregations by up to 8×.",
      "Optimized search across 37M records: 41% less index storage and nearly 50% faster indexing.",
    ],
    stack: "Rails · React · Sidekiq Pro · Elasticsearch · Python · AI / NLP",
  },
  {
    chapter: "II",
    title: "Software Engineer",
    dates: "September 2020 — March 2023",
    short: "Ideas became products",
    text: "Built experiences across AlmaConnect’s alumni platform, from personalized feeds to tools that let clients publish for themselves.",
    points: [
      "Re-architected feeds around user interests and social graphs.",
      "Grew a no-code website builder from 16 to 118 active sites.",
      "Co-developed mentorship discovery and owned features through production support.",
    ],
    stack: "Ruby on Rails · React · JavaScript · MongoDB",
  },
  {
    chapter: "I",
    title: "Software Engineer Intern",
    dates: "January 2020 — August 2020",
    short: "Every story starts somewhere",
    text: "Joined AlmaConnect and began building across the stack, working closely with product and design teams.",
    points: [
      "Delivered internal administrative tools and full-stack features.",
      "Built client-facing React websites.",
    ],
    stack: "Ruby on Rails · JavaScript · React",
  },
];

export const skills = [
  {
    number: "01",
    name: "The art of interfaces",
    subtitle: "Frontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "Redux Toolkit",
      "Jotai",
      "Vite",
      "Linaria",
      "Chrome Extensions",
      "AngularJS",
    ],
  },
  {
    number: "02",
    name: "Behind the curtain",
    subtitle: "Backend & APIs",
    items: [
      "Ruby",
      "Ruby on Rails",
      "Hono",
      "Node.js",
      "REST APIs",
      "TypeORM",
      "Microservices",
      "Service-oriented architecture",
    ],
  },
  {
    number: "03",
    name: "Finding the signal",
    subtitle: "Databases & search",
    items: [
      "SQL",
      "PostgreSQL",
      "MongoDB",
      "Elasticsearch",
      "Searchkick",
      "Redis",
      "PgBouncer",
    ],
  },
  {
    number: "04",
    name: "Built to withstand",
    subtitle: "Distributed systems & cloud",
    items: [
      "BullMQ",
      "Sidekiq Pro",
      "AWS",
      "Docker",
      "CloudFormation",
      "Ansible",
      "CircleCI",
      "CI/CD",
    ],
  },
  {
    number: "05",
    name: "A little intelligence",
    subtitle: "AI, NLP & tooling",
    items: [
      "Python",
      "OpenAI APIs",
      "Sentence-Transformers",
      "DistilBERT",
      "PyTorch",
      "TensorFlow",
      "Claude Code",
      "Cursor",
      "Git",
      "GitHub",
      "Bugsnag",
      "New Relic",
    ],
  },
  {
    number: "06",
    name: "Further explorations",
    subtitle: "Beyond the everyday",
    items: [
      "Java",
      "Solidity",
      "Truffle",
      "Smart contracts",
      "ERC20 tokens",
      "Android",
      "Keras",
    ],
  },
];

export const fieldNotes = [
  {
    title: "R3 · A new foundation",
    text: "A multi-tenant prospect CRM, built as a TypeScript monorepo with isolated workspaces, reliable synchronization, AI reports, and secure exports.",
    label: "Architecture & ownership",
  },
  {
    title: "Seth · Reading between the lines",
    text: "Production NLP for semantic article clustering and 11-class content classification with Sentence-Transformers and a fine-tuned DistilBERT.",
    label: "Applied machine learning",
  },
  {
    title: "Caerus · Beyond the browser",
    text: "A Chrome extension extracting news from 50+ sources, with parallel tabs, duplicate prevention, stale-tab recovery, and 18+ versioned releases.",
    label: "Browser engineering",
  },
  {
    title: "Public News · Open to the world",
    text: "Server-rendered organization feeds with dynamic metadata, per-organization routes, and API-driven sitemaps that keep public content discoverable.",
    label: "Next.js & discoverability",
  },
];
