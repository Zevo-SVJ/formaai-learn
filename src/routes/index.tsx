import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BookOpen,
  Camera,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  ScrollText,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UploadArea } from "@/components/UploadArea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <SupportedTypes />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <Link
          to="/auth"
          className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:border-border-strong"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-10 pb-16 sm:pt-20 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, oklch(0.94 0.05 155 / 0.5) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          Built for students, not for cheating
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-[38px] font-bold leading-[1.03] tracking-[-0.04em] text-foreground sm:text-6xl"
        >
          Understand every lesson.
          <br />
          <span className="text-muted-foreground">Not just the answer.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg"
        >
          Upload a lesson, worksheet or a photo of your notes. Forma AI reads it, understands it,
          and teaches it back — in words that actually make sense.
        </motion.p>

        <div className="mt-10">
          <UploadArea />
        </div>
      </div>
    </section>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
              {eyebrow}
            </div>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
        </div>
        {children && <div className="mt-14">{children}</div>}
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    "You stare at the lesson and none of it clicks.",
    "You ask an AI. It gives you the answer, not the idea.",
    "Next week the test comes — and you still don't understand.",
  ];
  return (
    <Section
      eyebrow="The problem"
      title="Answers aren't the same as understanding."
      subtitle="Most AI tools solve your homework for you. Forma AI does the opposite — it helps you actually learn the thing."
    >
      <div className="mx-auto grid max-w-3xl gap-3">
        {items.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-surface px-5 py-4 text-[15px] text-foreground shadow-[var(--shadow-soft)]"
          >
            <span className="mr-3 text-muted-foreground">0{i + 1}</span>
            {t}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Solution() {
  const items = [
    { icon: BookOpen, title: "Reads your lesson", body: "OCR handles photos and handwriting. PDFs and worksheets too." },
    { icon: Sparkles, title: "Teaches, not solves", body: "Structured explanations — with the why, common mistakes, and simple examples." },
    { icon: ShieldCheck, title: "Grounded in your document", body: "Every answer is anchored in the lesson you uploaded. No made-up facts." },
  ];
  return (
    <Section
      eyebrow="The solution"
      title="A tutor that actually reads your lesson."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ icon: Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft">
              <Icon className="h-5 w-5 text-emerald" strokeWidth={2.25} />
            </div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload anything", d: "A photo, PDF, or a screenshot of your worksheet." },
    { n: "02", t: "Forma reads it", d: "Detects the subject, level, chapter and key concepts." },
    { n: "03", t: "You understand it", d: "A clear explanation with examples — plus a chat that already knows the lesson." },
  ];
  return (
    <Section id="how" eyebrow="How it works" title="Three steps. No busywork.">
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-3xl border border-border bg-surface p-6"
          >
            <div className="text-xs font-semibold tracking-[0.2em] text-emerald">{s.n}</div>
            <h3 className="mt-3 text-xl font-bold text-foreground">{s.t}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{s.d}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function SupportedTypes() {
  const types = [
    { icon: BookOpen, label: "Lesson" },
    { icon: ScrollText, label: "Homework" },
    { icon: ImageIcon, label: "Screenshot" },
    { icon: Camera, label: "Photo" },
    { icon: FileText, label: "PDF" },
    { icon: FileSpreadsheet, label: "Worksheet" },
    { icon: Zap, label: "Notes" },
  ];
  return (
    <Section
      eyebrow="Supported"
      title="Bring anything from class."
      subtitle="Snap it, drop it, forget the format."
    >
      <div className="-mx-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x snap-mandatory gap-3 px-5">
          {types.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex min-w-[160px] snap-start flex-col items-start justify-between rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:min-w-[200px]"
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted">
                <Icon className="h-5 w-5 text-foreground" strokeWidth={2.25} />
              </div>
              <div className="text-[15px] font-semibold text-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Testimonials() {
  const items = [
    {
      quote:
        "I finally understood how to factor polynomials. Not because it gave me the answer — because it walked me through it.",
      name: "Lucas",
      role: "Grade 10",
    },
    {
      quote:
        "I take a picture of my biology notes and it explains the parts I skipped in class. It's the calmest study tool I've used.",
      name: "Sofia",
      role: "Grade 9",
    },
    {
      quote:
        "It doesn't feel like homework help. It feels like someone actually explaining the chapter.",
      name: "Amir",
      role: "Grade 11",
    },
  ];
  return (
    <Section eyebrow="Students" title="Built for how you actually study.">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((t) => (
          <div
            key={t.name}
            className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]"
          >
            <p className="text-[15px] leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-soft text-sm font-bold text-emerald">
                {t.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Does Forma AI just give me the answer?",
      a: "No. Forma is designed to teach — it breaks down the concept, shows why it matters, points out common mistakes and gives a simple example. You can always ask it to go deeper.",
    },
    {
      q: "What can I upload?",
      a: "Photos of your notes, screenshots, PDFs, worksheets and handwritten pages. If it's a document, Forma reads it.",
    },
    {
      q: "Is my work private?",
      a: "Yes. Your documents are stored privately in your account and only visible to you.",
    },
    {
      q: "What subjects does it support?",
      a: "Any subject a middle or high school student studies — math, science, history, languages and more.",
    },
  ];
  return (
    <Section id="faq" eyebrow="FAQ" title="Everything, answered.">
      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`i${i}`} className="border-border">
              <AccordionTrigger className="text-left text-[16px] font-semibold hover:no-underline">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function FinalCTA() {
  return (
    <section className="px-5 pb-24">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-border bg-foreground p-10 text-center text-background sm:p-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Start understanding today.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-background/70">
          Upload your first lesson. No forms, no fluff.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row">
        <Logo size={22} />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Forma AI. Made for students.
        </p>
      </div>
    </footer>
  );
}
