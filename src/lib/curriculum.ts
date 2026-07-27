// Full curriculum used across landing carousels, onboarding search and Progress subject picker.
// Groups are used for the searchable grouped picker.
/** Names keyed by locale. English is the fallback for anything unsupported. */
export type LocalizedName = Record<string, string>;

export type SubjectItem = {
  id: string;
  names: LocalizedName;
  icon: string; // emoji — light-weight, premium enough and consistent across platforms
  groups: LocalizedName;
};

const G = {
  sciences: {
    en: "Sciences",
    fr: "Sciences",
    es: "Ciencias",
    de: "Naturwissenschaften",
    pt: "Ciências",
    it: "Scienze",
  },
  languages: {
    en: "Languages",
    fr: "Langues",
    es: "Idiomas",
    de: "Sprachen",
    pt: "Línguas",
    it: "Lingue",
  },
  humanities: {
    en: "Humanities",
    fr: "Sciences humaines",
    es: "Humanidades",
    de: "Geisteswissenschaften",
    pt: "Humanidades",
    it: "Materie umanistiche",
  },
  tech: {
    en: "Technology",
    fr: "Technologie",
    es: "Tecnología",
    de: "Technik",
    pt: "Tecnologia",
    it: "Tecnologia",
  },
  business: {
    en: "Business",
    fr: "Économie",
    es: "Economía",
    de: "Wirtschaft",
    pt: "Economia",
    it: "Economia",
  },
  arts: { en: "Arts", fr: "Arts", es: "Arte", de: "Kunst", pt: "Artes", it: "Arte" },
  health: { en: "Health", fr: "Santé", es: "Salud", de: "Gesundheit", pt: "Saúde", it: "Salute" },
  university: {
    en: "University",
    fr: "Université",
    es: "Universidad",
    de: "Universität",
    pt: "Universidade",
    it: "Università",
  },
};

function make(id: string, names: LocalizedName, icon: string, group: keyof typeof G): SubjectItem {
  return { id, names, icon, groups: G[group] };
}

export const SUBJECTS: SubjectItem[] = [
  // Sciences
  make(
    "mathematics",
    {
      en: "Mathematics",
      fr: "Mathématiques",
      es: "Matemáticas",
      de: "Mathematik",
      pt: "Matemática",
      it: "Matematica",
    },
    "∑",
    "sciences",
  ),
  make(
    "algebra",
    { en: "Algebra", fr: "Algèbre", es: "Álgebra", de: "Algebra", pt: "Álgebra", it: "Algebra" },
    "𝑥",
    "sciences",
  ),
  make(
    "geometry",
    {
      en: "Geometry",
      fr: "Géométrie",
      es: "Geometría",
      de: "Geometrie",
      pt: "Geometria",
      it: "Geometria",
    },
    "△",
    "sciences",
  ),
  make(
    "calculus",
    {
      en: "Calculus",
      fr: "Analyse",
      es: "Cálculo",
      de: "Analysis",
      pt: "Cálculo",
      it: "Analisi matematica",
    },
    "∫",
    "sciences",
  ),
  make(
    "statistics",
    {
      en: "Statistics",
      fr: "Statistiques",
      es: "Estadística",
      de: "Statistik",
      pt: "Estatística",
      it: "Statistica",
    },
    "📊",
    "sciences",
  ),
  make(
    "probability",
    {
      en: "Probability",
      fr: "Probabilités",
      es: "Probabilidad",
      de: "Wahrscheinlichkeit",
      pt: "Probabilidade",
      it: "Probabilità",
    },
    "🎲",
    "sciences",
  ),
  make(
    "physics",
    { en: "Physics", fr: "Physique", es: "Física", de: "Physik", pt: "Física", it: "Fisica" },
    "⚛",
    "sciences",
  ),
  make(
    "chemistry",
    { en: "Chemistry", fr: "Chimie", es: "Química", de: "Chemie", pt: "Química", it: "Chimica" },
    "⚗",
    "sciences",
  ),
  make(
    "physics-chemistry",
    {
      en: "Physics & Chemistry",
      fr: "Physique-Chimie",
      es: "Física y Química",
      de: "Physik und Chemie",
      pt: "Física e Química",
      it: "Fisica e Chimica",
    },
    "🧪",
    "sciences",
  ),
  make(
    "biology",
    {
      en: "Biology",
      fr: "Biologie",
      es: "Biología",
      de: "Biologie",
      pt: "Biologia",
      it: "Biologia",
    },
    "🧬",
    "sciences",
  ),
  make(
    "svt",
    {
      en: "Life & Earth Sciences",
      fr: "SVT",
      es: "Biología y Geología",
      de: "Biologie und Erdkunde",
      pt: "Biologia e Geologia",
      it: "Scienze della Terra",
    },
    "🌱",
    "sciences",
  ),
  make(
    "mechanics",
    {
      en: "Mechanics",
      fr: "Mécanique",
      es: "Mecánica",
      de: "Mechanik",
      pt: "Mecânica",
      it: "Meccanica",
    },
    "⚙",
    "sciences",
  ),
  // Languages
  make(
    "french",
    {
      en: "French",
      fr: "Français",
      es: "Francés",
      de: "Französisch",
      pt: "Francês",
      it: "Francese",
    },
    "🇫🇷",
    "languages",
  ),
  make(
    "english",
    { en: "English", fr: "Anglais", es: "Inglés", de: "Englisch", pt: "Inglês", it: "Inglese" },
    "🇬🇧",
    "languages",
  ),
  make(
    "spanish",
    {
      en: "Spanish",
      fr: "Espagnol",
      es: "Español",
      de: "Spanisch",
      pt: "Espanhol",
      it: "Spagnolo",
    },
    "🇪🇸",
    "languages",
  ),
  make(
    "german",
    { en: "German", fr: "Allemand", es: "Alemán", de: "Deutsch", pt: "Alemão", it: "Tedesco" },
    "🇩🇪",
    "languages",
  ),
  make(
    "italian",
    {
      en: "Italian",
      fr: "Italien",
      es: "Italiano",
      de: "Italienisch",
      pt: "Italiano",
      it: "Italiano",
    },
    "🇮🇹",
    "languages",
  ),
  make(
    "latin",
    { en: "Latin", fr: "Latin", es: "Latín", de: "Latein", pt: "Latim", it: "Latino" },
    "🏛",
    "languages",
  ),
  make(
    "ancient-greek",
    {
      en: "Ancient Greek",
      fr: "Grec ancien",
      es: "Griego antiguo",
      de: "Altgriechisch",
      pt: "Grego antigo",
      it: "Greco antico",
    },
    "Ω",
    "languages",
  ),
  make(
    "literature",
    {
      en: "Literature",
      fr: "Littérature",
      es: "Literatura",
      de: "Literatur",
      pt: "Literatura",
      it: "Letteratura",
    },
    "📖",
    "languages",
  ),
  // Humanities
  make(
    "history",
    {
      en: "History",
      fr: "Histoire",
      es: "Historia",
      de: "Geschichte",
      pt: "História",
      it: "Storia",
    },
    "🏺",
    "humanities",
  ),
  make(
    "geography",
    {
      en: "Geography",
      fr: "Géographie",
      es: "Geografía",
      de: "Erdkunde",
      pt: "Geografia",
      it: "Geografia",
    },
    "🌍",
    "humanities",
  ),
  make(
    "history-geography",
    {
      en: "History & Geography",
      fr: "Histoire-Géographie",
      es: "Historia y Geografía",
      de: "Geschichte und Erdkunde",
      pt: "História e Geografia",
      it: "Storia e Geografia",
    },
    "🗺",
    "humanities",
  ),
  make(
    "philosophy",
    {
      en: "Philosophy",
      fr: "Philosophie",
      es: "Filosofía",
      de: "Philosophie",
      pt: "Filosofia",
      it: "Filosofia",
    },
    "🦉",
    "humanities",
  ),
  make(
    "psychology",
    {
      en: "Psychology",
      fr: "Psychologie",
      es: "Psicología",
      de: "Psychologie",
      pt: "Psicologia",
      it: "Psicologia",
    },
    "🧠",
    "humanities",
  ),
  make(
    "sociology",
    {
      en: "Sociology",
      fr: "Sociologie",
      es: "Sociología",
      de: "Soziologie",
      pt: "Sociologia",
      it: "Sociologia",
    },
    "🫂",
    "humanities",
  ),
  make(
    "political-science",
    {
      en: "Political Science",
      fr: "Sciences politiques",
      es: "Ciencias políticas",
      de: "Politikwissenschaft",
      pt: "Ciência política",
      it: "Scienze politiche",
    },
    "🏛",
    "humanities",
  ),
  make(
    "law",
    { en: "Law", fr: "Droit", es: "Derecho", de: "Recht", pt: "Direito", it: "Diritto" },
    "⚖",
    "humanities",
  ),
  // Technology
  make(
    "technology",
    {
      en: "Technology",
      fr: "Technologie",
      es: "Tecnología",
      de: "Technik",
      pt: "Tecnologia",
      it: "Tecnologia",
    },
    "🔧",
    "tech",
  ),
  make(
    "computer-science",
    {
      en: "Computer Science",
      fr: "Informatique",
      es: "Informática",
      de: "Informatik",
      pt: "Informática",
      it: "Informatica",
    },
    "💻",
    "tech",
  ),
  make(
    "snt",
    {
      en: "Digital Sciences (SNT)",
      fr: "SNT",
      es: "Ciencias digitales",
      de: "Digitale Grundbildung",
      pt: "Ciências digitais",
      it: "Scienze digitali",
    },
    "🌐",
    "tech",
  ),
  make(
    "nsi",
    {
      en: "Computer Science (NSI)",
      fr: "NSI",
      es: "Informática avanzada",
      de: "Informatik (Vertiefung)",
      pt: "Informática avançada",
      it: "Informatica avanzata",
    },
    "⌨",
    "tech",
  ),
  make(
    "si",
    {
      en: "Engineering Sciences (SI)",
      fr: "Sciences de l'ingénieur",
      es: "Ciencias de la ingeniería",
      de: "Ingenieurwissenschaften",
      pt: "Ciências da engenharia",
      it: "Scienze dell'ingegneria",
    },
    "🛠",
    "tech",
  ),
  make(
    "programming",
    {
      en: "Programming",
      fr: "Programmation",
      es: "Programación",
      de: "Programmierung",
      pt: "Programação",
      it: "Programmazione",
    },
    "{ }",
    "tech",
  ),
  make(
    "electronics",
    {
      en: "Electronics",
      fr: "Électronique",
      es: "Electrónica",
      de: "Elektronik",
      pt: "Eletrónica",
      it: "Elettronica",
    },
    "🔌",
    "tech",
  ),
  make(
    "engineering",
    {
      en: "Engineering",
      fr: "Ingénierie",
      es: "Ingeniería",
      de: "Ingenieurwesen",
      pt: "Engenharia",
      it: "Ingegneria",
    },
    "🏗",
    "tech",
  ),
  make(
    "digital-sciences",
    {
      en: "Digital Sciences",
      fr: "Sciences numériques",
      es: "Ciencias digitales",
      de: "Digitale Wissenschaften",
      pt: "Ciências digitais",
      it: "Scienze digitali",
    },
    "🖥",
    "tech",
  ),
  // Business / Economics
  make(
    "economics",
    {
      en: "Economics",
      fr: "Économie",
      es: "Economía",
      de: "Wirtschaft",
      pt: "Economia",
      it: "Economia",
    },
    "📈",
    "business",
  ),
  make(
    "ses",
    {
      en: "Economics (SES)",
      fr: "SES",
      es: "Economía y sociología",
      de: "Wirtschaft und Sozialkunde",
      pt: "Economia e sociologia",
      it: "Economia e sociologia",
    },
    "💶",
    "business",
  ),
  make(
    "finance",
    { en: "Finance", fr: "Finance", es: "Finanzas", de: "Finanzen", pt: "Finanças", it: "Finanza" },
    "💰",
    "business",
  ),
  make(
    "marketing",
    {
      en: "Marketing",
      fr: "Marketing",
      es: "Marketing",
      de: "Marketing",
      pt: "Marketing",
      it: "Marketing",
    },
    "📣",
    "business",
  ),
  make(
    "management",
    {
      en: "Management",
      fr: "Management",
      es: "Gestión",
      de: "Management",
      pt: "Gestão",
      it: "Management",
    },
    "📋",
    "business",
  ),
  make(
    "business",
    {
      en: "Business",
      fr: "Commerce",
      es: "Comercio",
      de: "Handel",
      pt: "Comércio",
      it: "Commercio",
    },
    "🏢",
    "business",
  ),
  make(
    "accounting",
    {
      en: "Accounting",
      fr: "Comptabilité",
      es: "Contabilidad",
      de: "Rechnungswesen",
      pt: "Contabilidade",
      it: "Contabilità",
    },
    "🧾",
    "business",
  ),
  // Arts
  make(
    "art",
    {
      en: "Art",
      fr: "Arts plastiques",
      es: "Educación plástica",
      de: "Kunst",
      pt: "Artes visuais",
      it: "Arte",
    },
    "🎨",
    "arts",
  ),
  make(
    "music",
    { en: "Music", fr: "Musique", es: "Música", de: "Musik", pt: "Música", it: "Musica" },
    "🎵",
    "arts",
  ),
  make(
    "design",
    { en: "Design", fr: "Design", es: "Diseño", de: "Design", pt: "Design", it: "Design" },
    "✏",
    "arts",
  ),
  make(
    "architecture",
    {
      en: "Architecture",
      fr: "Architecture",
      es: "Arquitectura",
      de: "Architektur",
      pt: "Arquitetura",
      it: "Architettura",
    },
    "🏛",
    "arts",
  ),
  // Health
  make(
    "medicine",
    {
      en: "Medicine",
      fr: "Médecine",
      es: "Medicina",
      de: "Medizin",
      pt: "Medicina",
      it: "Medicina",
    },
    "🩺",
    "health",
  ),
  make(
    "nursing",
    {
      en: "Nursing",
      fr: "Soins infirmiers",
      es: "Enfermería",
      de: "Krankenpflege",
      pt: "Enfermagem",
      it: "Infermieristica",
    },
    "💊",
    "health",
  ),
  // University / Business school
  make(
    "university-subjects",
    {
      en: "University subjects",
      fr: "Matières universitaires",
      es: "Materias universitarias",
      de: "Studienfächer",
      pt: "Disciplinas universitárias",
      it: "Materie universitarie",
    },
    "🎓",
    "university",
  ),
  make(
    "business-school",
    {
      en: "Business school",
      fr: "École de commerce",
      es: "Escuela de negocios",
      de: "Wirtschaftshochschule",
      pt: "Escola de negócios",
      it: "Business school",
    },
    "🎯",
    "university",
  ),
];

function pick(map: LocalizedName, locale: string) {
  const base = (locale || "en").toLowerCase().split("-")[0];
  return map[base] ?? map.en;
}
export function subjectName(s: SubjectItem, locale: string) {
  return pick(s.names, locale);
}
export function subjectGroup(s: SubjectItem, locale: string) {
  return pick(s.groups, locale);
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
  const numFmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rounded);
  const value = `${numFmt}k`;
  // Return the kind; the caller translates it via i18n so this stays language-agnostic.
  return { value, kind };
}
