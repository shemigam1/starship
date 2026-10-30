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
  { label: "email", href: `mailto:${site.email}` },
];

export type Link = { label: string; href?: string };

/** The short "who I am" lines under the hero. Links render inline and underlined. */
export const bio: (string | Link)[][] = [
  ["Ẹ n lẹ, I'm Semilore."],
  ["Software engineer, mostly backend + infra, and occasionally the frontend too."],
  [
    "Previously, SWE intern @ ",
    { label: "Moniepoint", href: "https://moniepoint.com" },
    " and ",
    { label: "Gamr" },
    " (Techstars '23).",
  ],
  [
    "Currently, studying Mechanical Engineering @ ",
    { label: "UNILAG", href: "https://unilag.edu.ng" },
    " (First Class) and leading tech @ Techstars UNILAG.",
  ],
];

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
  stack: string[];
};

export const featured: Project[] = [
  {
    name: "Moniepoint POS Platform",
    year: "2026",
    discipline: "Backend + APIs",
    blurb:
      "Consolidated the internal APIs behind POS terminal lifecycle and repairs, across ~1M active terminals, into enriched single-trip endpoints.",
    accent: "#3a6bff",
    stack: ["Java", "Spring Boot", "Postgres"],
  },
  {
    name: "Events Platform",
    year: "2026",
    discipline: "Backend + Infra",
    blurb:
      "All-in-one events platform: ticketing, vendors, real-time chat over WebSockets, SSE notifications, an idempotent Kafka pipeline and offline-verifiable QR tickets (Ed25519 + AES-GCM).",
    accent: "#ff7a2f",
    stack: ["Spring Boot", "Kafka", "Redis", "AWS"],
  },
  {
    name: "Small-O",
    year: "2025",
    discipline: "Systems + Product",
    blurb:
      "Self-hostable, LAN-only competitive programming platform with a hardened container sandbox and an empirical Big-O scorer built on valgrind.",
    href: "https://github.com/shemigam1",
    accent: "#3cd27a",
    stack: ["Go", "Next.js", "Docker", "Redis"],
  },
  {
    name: "Agent-Fury",
    year: "2025",
    discipline: "Developer Tools + AI",
    blurb:
      "Multi-provider CLI coding agent with hot-swappable models mid-session, planning mode, a ranked repo map, and a git-worktree eval harness.",
    href: "https://github.com/shemigam1",
    accent: "#c45bff",
    stack: ["TypeScript", "LLMs", "OpenTelemetry"],
  },
  {
    name: "Gamr",
    year: "2025",
    discipline: "Backend + Payments",
    blurb:
      "Backend APIs behind the gaming platform launch, plus a blockchain payment gateway for stablecoins and local currency. 15% faster responses from caching and query work.",
    accent: "#ffd23f",
    wip: true,
    stack: ["Node.js", "DigitalOcean"],
  },
  {
    name: "Techstars UNILAG Hackathon",
    year: "2025",
    discipline: "Community + Events",
    blurb:
      "Planned and ran a university-wide hackathon for 100+ participants, from sponsorship outreach to technical mentorship.",
    accent: "#ff4d6d",
    wip: true,
    stack: ["Leadership"],
  },
];

export const playground = [
  {
    name: "This Starfield",
    blurb:
      "The ASCII sky up top is its own little engine. Stars drift by depth, ships leave exhaust that diffuses through the grid, and a click opens a warp. Built on ideas from ascii-sharks.",
    href: "#top",
    cta: "Click the sky",
    art: [
      "    .        *          .",
      "  *     __           .     ",
      "      _/  \\____  ==-     *",
      " .   <_[]_____>======-     ",
      "        \\__/      ==-   .  ",
      "   *         .         *   ",
    ],
  },
  {
    name: "Footer Arcade",
    blurb:
      "Two fidget toys at the bottom of the page: badges you can knock around, and a tic-tac-toe opponent that plays to win most of the time.",
    href: "#arcade",
    cta: "Play a round",
    art: [
      "   X | O |          ",
      "  ---+---+---       ",
      "     | X | O        ",
      "  ---+---+---   (o) ",
      "   O |   | X  (o)(o)",
      "               (o)  ",
    ],
  },
];

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
  { name: "POS Lifecycle APIs", what: "API Design + Performance", where: "Moniepoint", year: "2026", tags: ["Backend"] },
  { name: "Events Platform", what: "Backend, Infra + Frontend", where: "Moniepoint", year: "2026", tags: ["Backend", "Infra", "Frontend"] },
  { name: "Kafka Notifications", what: "Event Pipeline", where: "Moniepoint", year: "2026", tags: ["Backend", "Infra"] },
  { name: "QR Ticketing", what: "Cryptography + Offline Verify", where: "Moniepoint", year: "2026", tags: ["Backend"] },
  { name: "IEEE IES Website", what: "Web + Community", where: "IEEE IES UNILAG", year: "2025", tags: ["Frontend", "Community"] },
  { name: "Agent-Fury", what: "CLI Agent + Evals", where: "Personal", year: "2025", tags: ["Backend"], href: "https://github.com/shemigam1" },
  { name: "Small-O", what: "Platform + Sandbox", where: "Personal", year: "2025", tags: ["Backend", "Infra", "Frontend"], href: "https://github.com/shemigam1" },
  { name: "Stablecoin Payments", what: "Payment Gateway", where: "Gamr", year: "2025", tags: ["Backend"] },
  { name: "Gamr Launch APIs", what: "Backend APIs + Caching", where: "Gamr", year: "2025", tags: ["Backend", "Infra"] },
  { name: "Hackathon '25", what: "Organising + Mentorship", where: "Techstars UNILAG", year: "2025", tags: ["Community"] },
  { name: "Dev Workshops", what: "5+ Workshops", where: "Techstars UNILAG", year: "2025", tags: ["Community"] },
  { name: "Arduino Sessions", what: "Embedded Systems Mentoring", where: "IEEE IES UNILAG", year: "2025", tags: ["Community"] },
];

/** Badges for the footer physics toy. */
export const badges = [
  { label: "Go", bg: "#00add8", fg: "#fff" },
  { label: "Java", bg: "#e76f00", fg: "#fff" },
  { label: "TS", bg: "#3178c6", fg: "#fff" },
  { label: "Py", bg: "#ffd43b", fg: "#1d3b5c" },
  { label: "AWS", bg: "#232f3e", fg: "#ff9900" },
  { label: "k8s", bg: "#326ce5", fg: "#fff" },
  { label: "PG", bg: "#e6edf5", fg: "#336791" },
  { label: "{ }", bg: "#ff4d6d", fg: "#fff" },
  { label: "</>", bg: "#61dafb", fg: "#0b0b0c" },
  { label: "Rd", bg: "#d82c20", fg: "#fff" },
];
