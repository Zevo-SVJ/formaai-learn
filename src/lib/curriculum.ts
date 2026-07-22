// Full curriculum used across landing carousels, onboarding search and Progress subject picker.
// Groups are used for the searchable grouped picker.
export type SubjectItem = {
  id: string;
  name: string;
  name_fr: string;
  icon: string; // emoji — light-weight, premium enough and consistent across platforms
  group: string;
  group_fr: string;
};

const G = {
  sciences: { en: "Sciences", fr: "Sciences" },
  languages: { en: "Languages", fr: "Langues" },
  humanities: { en: "Humanities", fr: "Sciences humaines" },
  tech: { en: "Technology", fr: "Technologie" },
  business: { en: "Business", fr: "Économie" },
  arts: { en: "Arts", fr: "Arts" },
  health: { en: "Health", fr: "Santé" },
  university: { en: "University", fr: "Université" },
};

function make(
  id: string,
  name: string,
  name_fr: string,
  icon: string,
  group: keyof typeof G,
): SubjectItem {
  return { id, name, name_fr, icon, group: G[group].en, group_fr: G[group].fr };
}

export const SUBJECTS: SubjectItem[] = [
  // Sciences
  make("mathematics", "Mathematics", "Mathématiques", "∑", "sciences"),
  make("algebra", "Algebra", "Algèbre", "𝑥", "sciences"),
  make("geometry", "Geometry", "Géométrie", "△", "sciences"),
  make("calculus", "Calculus", "Analyse", "∫", "sciences"),
  make("statistics", "Statistics", "Statistiques", "📊", "sciences"),
  make("probability", "Probability", "Probabilités", "🎲", "sciences"),
  make("physics", "Physics", "Physique", "⚛", "sciences"),
  make("chemistry", "Chemistry", "Chimie", "⚗", "sciences"),
  make("physics-chemistry", "Physics & Chemistry", "Physique-Chimie", "🧪", "sciences"),
  make("biology", "Biology", "Biologie", "🧬", "sciences"),
  make("svt", "Life & Earth Sciences", "SVT", "🌱", "sciences"),
  make("mechanics", "Mechanics", "Mécanique", "⚙", "sciences"),
  // Languages
  make("french", "French", "Français", "🇫🇷", "languages"),
  make("english", "English", "Anglais", "🇬🇧", "languages"),
  make("spanish", "Spanish", "Espagnol", "🇪🇸", "languages"),
  make("german", "German", "Allemand", "🇩🇪", "languages"),
  make("italian", "Italian", "Italien", "🇮🇹", "languages"),
  make("latin", "Latin", "Latin", "🏛", "languages"),
  make("ancient-greek", "Ancient Greek", "Grec ancien", "Ω", "languages"),
  make("literature", "Literature", "Littérature", "📖", "languages"),
  // Humanities
  make("history", "History", "Histoire", "🏺", "humanities"),
  make("geography", "Geography", "Géographie", "🌍", "humanities"),
  make("history-geography", "History & Geography", "Histoire-Géographie", "🗺", "humanities"),
  make("philosophy", "Philosophy", "Philosophie", "🦉", "humanities"),
  make("psychology", "Psychology", "Psychologie", "🧠", "humanities"),
  make("sociology", "Sociology", "Sociologie", "🫂", "humanities"),
  make("political-science", "Political Science", "Sciences politiques", "🏛", "humanities"),
  make("law", "Law", "Droit", "⚖", "humanities"),
  // Technology
  make("technology", "Technology", "Technologie", "🔧", "tech"),
  make("computer-science", "Computer Science", "Informatique", "💻", "tech"),
  make("snt", "Digital Sciences (SNT)", "SNT", "🌐", "tech"),
  make("nsi", "Computer Science (NSI)", "NSI", "⌨", "tech"),
  make("si", "Engineering Sciences (SI)", "Sciences de l'ingénieur", "🛠", "tech"),
  make("programming", "Programming", "Programmation", "{ }", "tech"),
  make("electronics", "Electronics", "Électronique", "🔌", "tech"),
  make("engineering", "Engineering", "Ingénierie", "🏗", "tech"),
  make("digital-sciences", "Digital Sciences", "Sciences numériques", "🖥", "tech"),
  // Business / Economics
  make("economics", "Economics", "Économie", "📈", "business"),
  make("ses", "Economics (SES)", "SES", "💶", "business"),
  make("finance", "Finance", "Finance", "💰", "business"),
  make("marketing", "Marketing", "Marketing", "📣", "business"),
  make("management", "Management", "Management", "📋", "business"),
  make("business", "Business", "Commerce", "🏢", "business"),
  make("accounting", "Accounting", "Comptabilité", "🧾", "business"),
  // Arts
  make("art", "Art", "Arts plastiques", "🎨", "arts"),
  make("music", "Music", "Musique", "🎵", "arts"),
  make("design", "Design", "Design", "✏", "arts"),
  make("architecture", "Architecture", "Architecture", "🏛", "arts"),
  // Health
  make("medicine", "Medicine", "Médecine", "🩺", "health"),
  make("nursing", "Nursing", "Soins infirmiers", "💊", "health"),
  // University / Business school
  make("university-subjects", "University subjects", "Matières universitaires", "🎓", "university"),
  make("business-school", "Business school", "École de commerce", "🎯", "university"),
];

export function subjectName(s: SubjectItem, locale: string) {
  return locale.startsWith("fr") ? s.name_fr : s.name;
}
export function subjectGroup(s: SubjectItem, locale: string) {
  return locale.startsWith("fr") ? s.group_fr : s.group;
}

// Deterministic believable metrics per subject (mix of uploads / scans).
// Seed off the id so numbers stay stable and look real.
function seedRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function subjectMetric(
  s: SubjectItem,
  locale: string,
): { value: string; kind: "uploads" | "scans" } {
  const rnd = seedRand(s.id);
  const kind: "uploads" | "scans" = rnd() > 0.5 ? "uploads" : "scans";
  // 5k → 60k range, one decimal
  const n = 5 + rnd() * 55;
  const rounded = Math.round(n * 10) / 10;
  const numFmt = new Intl.NumberFormat(locale.startsWith("fr") ? "fr-FR" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rounded);
  const value = `${numFmt}k`;
  // Return the kind; the caller translates it via i18n so this stays language-agnostic.
  return { value, kind };
}
