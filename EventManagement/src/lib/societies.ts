export type SocietySlug =
  | "cesta"
  | "indus-rise"
  | "ai-renaissance"
  | "foss"
  | "gdg";

export type SocietySeed = {
  slug: SocietySlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  focus: string[];
  palette: {
    accent: string;
    soft: string;
    deep: string;
  };
  presidentLabel: string;
  vicePresidentLabel: string;
};

/** Starter content for Delhi Technical Campus societies. Logos/banners come from Supabase Storage later. */
export const SOCIETIES: SocietySeed[] = [
  {
    slug: "cesta",
    name: "CESTA",
    shortName: "CESTA",
    tagline: "Code, create, and collaborate.",
    description:
      "CESTA is the hands-on tech club at Delhi Technical Campus — competitive DSA, game & app development, UI/UX design, and a welcoming open-source culture.",
    focus: ["DSA", "Gaming", "Development", "Design", "Open Source"],
    palette: {
      accent: "#e8917a",
      soft: "#ffe8df",
      deep: "#b85a45",
    },
    presidentLabel: "President",
    vicePresidentLabel: "Vice President",
  },
  {
    slug: "indus-rise",
    name: "Indus Rise",
    shortName: "Indus Rise",
    tagline: "Forging futures, building industries.",
    description:
      "Indus Rise explores AI, blockchain, and the metaverse to revive economies and build industry-ready ventures — where campus ideas meet real-world impact.",
    focus: ["AI", "Blockchain", "Metaverse", "Industry", "Ventures"],
    palette: {
      accent: "#c97b8a",
      soft: "#fce8ec",
      deep: "#8a4555",
    },
    presidentLabel: "President",
    vicePresidentLabel: "Vice President",
  },
  {
    slug: "ai-renaissance",
    name: "AI Renaissance",
    shortName: "AI Ren.",
    tagline: "AIML, tech, and innovation.",
    description:
      "AI Renaissance is the campus hub for machine learning, applied AI, and innovation projects — workshops, demos, and experiments that make AI approachable.",
    focus: ["AIML", "Tech", "Innovation", "Research", "Projects"],
    palette: {
      accent: "#9b8ec4",
      soft: "#efeaf8",
      deep: "#5f4f8a",
    },
    presidentLabel: "President",
    vicePresidentLabel: "Vice President",
  },
  {
    slug: "foss",
    name: "FOSS",
    shortName: "FOSS",
    tagline: "Open source & hacker culture.",
    description:
      "FOSS champions free and open-source software at DTC — contribution drives, hackathons, and a friendly hacker culture around sharing and building in public.",
    focus: ["Open Source", "Hackathons", "Linux", "Community", "Contribute"],
    palette: {
      accent: "#6fae8f",
      soft: "#e5f5eb",
      deep: "#3d6b52",
    },
    presidentLabel: "President",
    vicePresidentLabel: "Vice President",
  },
  {
    slug: "gdg",
    name: "Google Developer Group",
    shortName: "GDG",
    tagline: "AIML, data science & Google tech.",
    description:
      "GDG at Delhi Technical Campus runs workshops and solution challenges around AIML, data science, and Google developer tools — GDSC-style community learning.",
    focus: ["AIML", "Data Science", "GDSC Solutions", "Workshops", "Google Tech"],
    palette: {
      accent: "#6a9fbf",
      soft: "#e5f2f8",
      deep: "#3d6a82",
    },
    presidentLabel: "President",
    vicePresidentLabel: "Vice President",
  },
];

export function getSociety(slug: string) {
  return SOCIETIES.find((s) => s.slug === slug);
}
