import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

/**
 * TEMPORARY diagnostic page for the Android Chrome black-camera report.
 *
 * The black preview could not be reproduced off-device, so this runs the
 * candidate input configurations side by side on the real phone and measures
 * the returned photo objectively - including whether the pixels are actually
 * black. Delete this route once the cause is known.
 */
export const Route = createFileRoute("/camera-test")({
  component: CameraTest,
});

type Result = {
  variant: string;
  name: string;
  type: string;
  sizeKb: number;
  dimensions: string;
  meanLuminance: number | null;
  verdict: string;
};

const VARIANTS = [
  { id: "env-sronly", label: "1. capture=environment, sr-only (current)", capture: "environment", hidden: "sr-only" },
  { id: "env-hidden", label: "2. capture=environment, display:none (previous)", capture: "environment", hidden: "hidden" },
  { id: "bare", label: "3. capture (no value)", capture: "", hidden: "sr-only" },
  { id: "user", label: "4. capture=user (front camera)", capture: "user", hidden: "sr-only" },
  { id: "none", label: "5. no capture (chooser / gallery)", capture: null, hidden: "sr-only" },
] as const;

function CameraTest() {
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const [results, setResults] = useState<Result[]>([]);

  const inspect = async (variant: string, file: File | undefined) => {
    if (!file) {
      setResults((r) => [{ variant, name: "(no file returned)", type: "-", sizeKb: 0, dimensions: "-", meanLuminance: null, verdict: "CANCELLED or NOTHING RETURNED" }, ...r]);
      return;
    }
    const url = URL.createObjectURL(file);
    let dimensions = "-";
    let meanLuminance: number | null = null;
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      dimensions = `${img.naturalWidth}x${img.naturalHeight}`;
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 64, 64);
        const { data } = ctx.getImageData(0, 0, 64, 64);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        meanLuminance = Math.round((sum / (data.length / 4)) * 10) / 10;
      }
    } catch {
      dimensions = "(could not decode)";
    } finally {
      URL.revokeObjectURL(url);
    }

    // A dead sensor reads about 0-2. Real indoor frames sit well above 25, so
    // the middle band catches a mostly-dark capture without calling it black.
    const verdict =
      meanLuminance === null
        ? "UNDECODABLE"
        : meanLuminance < 3
          ? "BLACK IMAGE"
          : meanLuminance < 12
            ? "NEARLY BLACK"
            : "REAL PHOTO";

    setResults((r) => [
      { variant, name: file.name, type: file.type, sizeKb: Math.round(file.size / 102.4) / 10, dimensions, meanLuminance, verdict },
      ...r,
    ]);
  };

  const env = {
    secureContext: typeof window !== "undefined" ? String(window.isSecureContext) : "?",
    origin: typeof window !== "undefined" ? window.location.origin : "?",
    ua: typeof navigator !== "undefined" ? navigator.userAgent : "?",
  };

  return (
    <div className="mx-auto max-w-lg px-5 py-8">
      <h1 className="text-xl font-bold text-foreground">Camera diagnostic</h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Tap each button, take a photo, and let it come back. The result is measured, so a
        black frame is detected even if the preview looked fine.
      </p>

      <pre className="mt-4 overflow-x-auto rounded-xl bg-surface-muted p-3 text-[11px] leading-relaxed text-foreground">
{`secureContext: ${env.secureContext}
origin:        ${env.origin}
userAgent:     ${env.ua}`}
      </pre>

      <div className="mt-5 flex flex-col gap-2">
        {VARIANTS.map((v) => (
          <div key={v.id}>
            <button
              onClick={() => refs.current[v.id]?.click()}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left text-[14px] font-semibold text-foreground"
            >
              {v.label}
            </button>
            <input
              ref={(el) => {
                refs.current[v.id] = el;
              }}
              type="file"
              accept="image/*"
              {...(v.capture === null ? {} : { capture: v.capture || true })}
              className={v.hidden}
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => inspect(v.label, e.target.files?.[0] ?? undefined)}
            />
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Results
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {results.map((r, i) => (
              <pre
                key={i}
                className="overflow-x-auto rounded-xl border border-border bg-card p-3 text-[11px] leading-relaxed text-foreground"
              >
{`${r.variant}
verdict:    ${r.verdict}
file:       ${r.name} (${r.type})
size:       ${r.sizeKb} KB
dimensions: ${r.dimensions}
luminance:  ${r.meanLuminance ?? "-"}  (0 = pure black)`}
              </pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
