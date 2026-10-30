// Everything personal on the site lives here. Edit this file, not the components.

export const site = {
  name: "Oluwasemilore Omotade-Michaels",
  short: "semilore",
  initials: "so",
  title: "semilore — Software Engineer",
  description:
    "Software engineer building backends, infrastructure and developer tools. Mechanical engineering @ UNILAG.",
  email: "semiloreomotade@gmail.com",
  location: "Lagos, Nigeria",
  // Typed out in the hero, one string per line.
  quote: ["the universe is mostly empty space;", "ship something worth the light"],
};

export const socials = [
  { label: "github", href: "https://github.com/shemigam1" },
  { label: "linkedin", href: "https://www.linkedin.com/in/semilore-omotade/" },
  { label: "substack", href: "https://memoirofsemilore.substack.com" },
  { label: "email", href: `mailto:${site.email}` },
];

export type Link = { label: string; href?: string };

/** The "who I am" paragraphs under the hero. Links render inline and underlined. */
export const bio: (string | Link)[][] = [
  [
    "Hi, I'm Semilore. I build + engineer ",
    { label: "products, systems, tools", href: "#work" },
    " and the occasional ",
    { label: "wacky project", href: "#playground" },
    ". I've spent the past 2 years turning complex ideas into things that actually work, feel seamless and are fast.",
  ],
  [
    "I like performance, good design, ambitious teams and projects, and building software people actually enjoy using. I've built at fintechs, startups, side projects and communities. This site is my ",
    { label: "digital archive", href: "#archive" },
    ", I hope you like it here.",
  ],
];

/**
 * Tech used across projects. Icons are Simple Icons SVGs in /public/icons,
 * drawn as CSS masks; `color` is the brand colour used behind them in the footer.
 */
export const tech = {
  go: { label: "Go", icon: "/icons/go.svg", color: "#00ADD8" },
  java: { label: "Java", icon: "/icons/openjdk.svg", color: "#ED8B00" },
  spring: { label: "Spring Boot", icon: "/icons/springboot.svg", color: "#6DB33F" },
  postgres: { label: "PostgreSQL", icon: "/icons/postgresql.svg", color: "#4169E1" },
  redis: { label: "Redis", icon: "/icons/redis.svg", color: "#FF4438" },
  kafka: { label: "Kafka", icon: "/icons/apachekafka.svg", color: "#231F20" },
  react: { label: "React", icon: "/icons/react.svg", color: "#61DAFB", ink: "#0b0b0c" },
  redux: { label: "Redux", icon: "/icons/redux.svg", color: "#764ABC" },
  tailwind: { label: "Tailwind CSS", icon: "/icons/tailwindcss.svg", color: "#06B6D4" },
  docker: { label: "Docker", icon: "/icons/docker.svg", color: "#2496ED" },
  next: { label: "Next.js", icon: "/icons/nextdotjs.svg", color: "#000000" },
  typescript: { label: "TypeScript", icon: "/icons/typescript.svg", color: "#3178C6" },
  python: { label: "Python", icon: "/icons/python.svg", color: "#3776AB" },
  gemini: { label: "Gemini", icon: "/icons/googlegemini.svg", color: "#8E75B2" },
  openai: { label: "OpenAI", icon: "/icons/openai.svg", color: "#412991" },
  anthropic: { label: "Anthropic", icon: "/icons/anthropic.svg", color: "#D97757" },
  otel: { label: "OpenTelemetry", icon: "/icons/opentelemetry.svg", color: "#425CC7" },
  vite: { label: "Vite", icon: "/icons/vite.svg", color: "#646CFF" },
  framer: { label: "Framer Motion", icon: "/icons/framer.svg", color: "#0055FF" },
  aws: { label: "AWS", icon: "/icons/amazonwebservices.svg", color: "#232F3E", ink: "#FF9900" },
  s3: { label: "Amazon S3", icon: "/icons/amazons3.svg", color: "#569A31" },
  k8s: { label: "Kubernetes", icon: "/icons/kubernetes.svg", color: "#326CE5" },
} satisfies Record<string, { label: string; icon: string; color: string; ink?: string }>;

export type Tech = keyof typeof tech;

export type Project = {
  name: string;
  year: string;
  discipline: string;
  blurb: string;
  href?: string;
  /** Optional cover image in /public. Without one, the card draws an ASCII cover. */
  image?: string;
  /** Glyph pattern seed + colour for the generated cover. */
  accent: string;
  wip?: boolean;
  /** Shown as icons in the card's details row. */
  stack: Tech[];
};

export const featured: Project[] = [
  {
    name: "Events Nest",
    image: "/projects/events-nest.webp",
    year: "2026",
    discipline: "Backend + Infra",
    blurb:
      "All-in-one events platform: ticketing, vendors, real-time chat over WebSockets, SSE notifications, an idempotent Kafka pipeline and offline-verifiable QR tickets (Ed25519 + AES-GCM).",
    href: "https://github.com/shemigam1/event-nest-backend",
    accent: "#ff7a2f",
    stack: ["java", "spring", "postgres", "redis", "kafka", "s3", "react", "redux"],
  },
  {
    name: "IEEE IES UNILAG Build-A-Thon",
    image: "/projects/ies-buildathon.webp",
    year: "2026",
    discipline: "Web + Interaction",
    blurb:
      "Site for a 24-hour hardware build-a-thon and conference: a terminal-styled event page with a live circuit sim, countdown, schedule and gallery.",
    href: "https://ies-unilag.netlify.app/",
    accent: "#00b5e2",
    stack: ["react", "vite", "framer"],
  },
  {
    name: "Small-O",
    image: "/projects/small-o.webp",
    year: "2025",
    discipline: "Systems + Product",
    blurb:
      "Self-hostable, LAN-only competitive programming platform with a hardened container sandbox and an empirical Big-O scorer built on valgrind.",
    href: "https://github.com/shemigam1/small-o",
    accent: "#3cd27a",
    stack: ["go", "postgres", "redis", "docker", "next", "typescript", "tailwind"],
  },
  {
    name: "Agent-Fury",
    image: "/projects/agent-fury.webp",
    year: "2025",
    discipline: "Developer Tools + AI",
    blurb:
      "Multi-provider CLI coding agent with hot-swappable models mid-session, planning mode, a ranked repo map, and a git-worktree eval harness.",
    href: "https://github.com/shemigam1/agent-fury",
    accent: "#c45bff",
    stack: ["python", "gemini", "openai", "anthropic", "otel"],
  },
];


/** Highlights from the blog. Reading times are rounded at ~230 words a minute. */
export const writing = {
  name: "defcon1",
  href: "https://memoirofsemilore.substack.com",
  blurb:
    "I write about engineering, art and everything in between I find interesting.",
  posts: [
    {
      title: "You shall not pass!!!; Diodes",
      dek: "Fourth attempt at explaining the physical electronics world in my own words.",
      date: "Feb 2026",
      minutes: 8,
      series: "Electronics",
      href: "https://memoirofsemilore.substack.com/p/you-shall-not-pass-diodes",
    },
    {
      title: "Data Structures and Algorithms for Dummies #2",
      dek: "How do you find a needle in a haystack?",
      date: "Jan 2026",
      minutes: 6,
      series: "DSA for Dummies",
      href: "https://memoirofsemilore.substack.com/p/data-structures-and-algorithms-for-ce4",
    },
    {
      title: "Light of The World; LEDs",
      dek: "The first article in a year-long project to research and write about an electronic component every week.",
      date: "Jan 2026",
      minutes: 5,
      series: "Electronics",
      href: "https://memoirofsemilore.substack.com/p/light-of-the-world-leds",
    },
    {
      title: "More Speed!!!",
      dek: "My first look into low-latency programming in C++.",
      date: "Oct 2025",
      minutes: 2,
      series: "Performance",
      href: "https://memoirofsemilore.substack.com/p/more-speed",
    },
  ],
};

export const archiveTags = ["Backend", "Infra", "Frontend", "Community"] as const;
export type ArchiveTag = (typeof archiveTags)[number];

export const archive: {
  name: string;
  what: string;
  where: string;
  year: string;
  tags: ArchiveTag[];
  href?: string;
}[] = [
  { name: "POS Logistics and Inventory Tools", what: "API Design + Performance", where: "Moniepoint", year: "2026", tags: ["Backend"] },
  { name: "Events Nest", what: "Backend, Infra + Frontend", where: "Moniepoint", year: "2026", tags: ["Backend", "Infra", "Frontend"], href: "https://github.com/shemigam1/event-nest-backend" },
  { name: "IEEE IES Website", what: "Web + Community", where: "IEEE IES UNILAG", year: "2026", tags: ["Frontend", "Community"], href: "https://ies-unilag.netlify.app/" },
  { name: "Agent-Fury", what: "CLI Agent + Evals", where: "Personal", year: "2025", tags: ["Backend"], href: "https://github.com/shemigam1/agent-fury" },
  { name: "Small-O", what: "Platform + Sandbox", where: "Personal", year: "2025", tags: ["Backend", "Infra", "Frontend"], href: "https://github.com/shemigam1/small-o" },
  { name: "Ape Odyssey", what: "Backend APIs + Caching", where: "Gamr", year: "2025", tags: ["Backend", "Infra"] },
  { name: "Hackathon '25", what: "Organising + Mentorship", where: "Techstars UNILAG", year: "2025", tags: ["Community"] },
];

/**
 * Badges for the footer physics toy: tech I use, then places I've built at.
 * `size` is the logo's width as a share of the badge (wordmarks need more).
 */
const techBadges: Tech[] = ["go", "java", "spring", "typescript", "python", "postgres", "redis", "kafka", "docker", "react", "aws", "k8s"];

export const badges: { label: string; icon: string; bg: string; ink?: string; size?: number }[] = [
  ...techBadges.map((t) => {
    const { label, icon, color, ink } = tech[t] as { label: string; icon: string; color: string; ink?: string };
    return { label, icon, bg: color, ink };
  }),
  { label: "Moniepoint", icon: "/logos/moniepoint-mark.svg", bg: "#0357EE" },
  { label: "Gamr", icon: "/logos/gamr.png", bg: "#E10600", size: 0.72 },
  { label: "Techstars UNILAG", icon: "/logos/techstars.png", bg: "#0A0AA8", size: 0.6 },
  { label: "IEEE", icon: "/logos/ieee.svg", bg: "#00629B", size: 0.72 },
  { label: "IEEE IES UNILAG", icon: "/logos/ieee-ies-mark.png", bg: "#1B365D", size: 0.66 },
];

/**
 * Logo strip under the hero. Files in /public/logos are white silhouettes used
 * as CSS masks, so they take the theme's text colour. `ratio` is width / height.
 */
export const logos: {
  name: string;
  src: string;
  ratio: number;
  text?: string;
  href?: string;
  /** Height multiplier for logos whose artwork is small inside its box. */
  scale?: number;
}[] = [
  { name: "Moniepoint", src: "/logos/moniepoint.svg", ratio: 160 / 28, href: "https://moniepoint.com" },
  { name: "Gamr", src: "/logos/gamr.png", ratio: 586 / 160, href: "https://www.gamr.africa" },
  { name: "IEEE", src: "/logos/ieee.svg", ratio: 24 / 7, href: "https://www.ieee.org" },
  { name: "Techstars UNILAG", src: "/logos/techstars.png", ratio: 163 / 160, text: "Techstars" },
  { name: "IEEE Industrial Electronics Society", src: "/logos/ieee-ies.png", ratio: 348 / 160, href: "https://www.ieee-ies.org", scale: 1.9 },
];
