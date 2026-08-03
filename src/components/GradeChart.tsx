import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

/**
 * The grades curve, in a module of its own so recharts can be loaded on demand.
 *
 * It used to be imported straight into the progress route. That route lives
 * under `_authenticated`, which is `ssr: false` - the component never renders
 * on the server - and yet the static import still pulled recharts and its
 * victory-vendor dependency into the server bundle: 565 KiB of charting code
 * shipped to a runtime that could never execute it, and into the first client
 * chunk of a page most visits never open.
 *
 * A dynamic import moves it to a chunk fetched when the page is actually
 * opened, which is also the only time it can possibly be drawn.
 */

export type Point = { date: string; value: number };

export default function GradeChart({
  data,
  rangeKey,
  formatDay,
  formatNum,
}: {
  data: Point[];
  /** Remounts the chart when the range changes, so it redraws rather than tweens. */
  rangeKey: string;
  formatDay: (iso: string) => string;
  formatNum: (n: number) => string;
}) {
  return (
    <ResponsiveContainer key={rangeKey} width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 4, left: -20 }}>
        <defs>
          <linearGradient id="formaArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(v: string) => formatDay(v)}
        />
        <YAxis
          domain={[0, 20]}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={28}
          tickCount={5}
        />
        <Tooltip
          cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            fontSize: 12,
            boxShadow: "var(--shadow-soft)",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "var(--muted-foreground)", marginBottom: 2 }}
          labelFormatter={(v) => formatDay(String(v))}
          formatter={(v) => [formatNum(Number(v)) + " / 20", ""]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--emerald)"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="url(#formaArea)"
          dot={false}
          activeDot={{
            r: 4,
            fill: "var(--emerald)",
            stroke: "var(--card)",
            strokeWidth: 2,
          }}
          isAnimationActive
          animationDuration={1400}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
