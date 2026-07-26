import {
  BookOpen,
  Sigma,
  Atom,
  FlaskConical,
  Leaf,
  Landmark,
  Globe2,
  Languages,
  Code2,
  LineChart,
  Scale,
  Palette,
  Music,
  Stethoscope,
  Feather,
} from "lucide-react";

type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

// Map an analysis's subject — free text produced by the AI, in any language —
// to a calm, on-topic icon. Keeps the Library visually organised so cards read
// as a real collection rather than an identical list, without adding noise:
// one consistent badge style, only the glyph changes. Falls back to a book.
export function subjectIcon(subject?: string | null): IconComponent {
  const s = (subject ?? "").toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => s.includes(k));

  if (has("math", "algèb", "algeb", "géom", "geom", "calcul", "analyse", "arith", "statis", "probab"))
    return Sigma;
  if (has("physiq", "physic", "mécan", "mecan")) return Atom;
  if (has("chim", "chem")) return FlaskConical;
  if (has("bio", "svt", "sciences de la vie", "life", "nature")) return Leaf;
  if (has("info", "nsi", "snt", "code", "program", "comput", "numér", "numer", "digital")) return Code2;
  if (has("hist")) return Landmark;
  if (has("géo", "geo", "geograph")) return Globe2;
  if (has("philo")) return Feather;
  if (
    has(
      "franç", "franc", "anglais", "english", "espagn", "spanish", "allem", "german",
      "ital", "langue", "langu", "littér", "liter", "latin", "grec", "greek",
    )
  )
    return Languages;
  if (has("éco", "eco", "ses", "econ", "financ", "gestion", "management", "commerc", "market", "compta"))
    return LineChart;
  if (has("droit", "law", "politiq", "polit", "juri")) return Scale;
  if (has("art", "dessin", "plastiq", "design", "architect")) return Palette;
  if (has("musi", "music")) return Music;
  if (has("médec", "medec", "medic", "santé", "sant", "infirm", "nursing", "soin")) return Stethoscope;

  return BookOpen;
}
