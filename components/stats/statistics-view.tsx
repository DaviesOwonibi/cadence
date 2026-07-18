"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useCubeStore } from "@/lib/store"
import { useActiveSession, useSessionSolves } from "@/lib/hooks"
import {
  averageOf,
  best,
  bestAverageOf,
  countPenalty,
  mean,
  median,
  rollingAverageSeries,
  successRate,
  worst,
} from "@/lib/cubing/stats"
import { effectiveTime } from "@/lib/cubing/types"
import { formatAverage, formatStatAverage } from "@/lib/cubing/format"
import { Card } from "@/components/ui/card"

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="gap-1 p-4">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-2xl font-bold tabular-nums">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </Card>
  )
}

function ChartTooltip({ active, payload, label, precision }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-muted-foreground">Solve #{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 font-mono tabular-nums" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span>{p.value != null ? formatStatAverage(p.value, precision) : "—"}</span>
        </p>
      ))}
    </div>
  )
}

export function StatisticsView() {
  const settings = useCubeStore((s) => s.settings)
  const solves = useSessionSolves()
  const session = useActiveSession()
  const p = settings.precision

  const timeSeries = useMemo(() => {
    const ao5 = rollingAverageSeries(solves, 5)
    const ao12 = rollingAverageSeries(solves, 12)
    return solves.map((s, i) => ({
      index: i + 1,
      time: isFinite(effectiveTime(s)) ? effectiveTime(s) / 1000 : null,
      ao5: ao5[i] != null ? (ao5[i] as number) / 1000 : null,
      ao12: ao12[i] != null ? (ao12[i] as number) / 1000 : null,
    }))
  }, [solves])

  const histogram = useMemo(() => {
    const valid = solves
      .map(effectiveTime)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
  
    if (valid.length === 0) return [];
  
    const min = valid[0];
    const max = valid[valid.length - 1];
  
    const range = Math.max(max - min, 1);
  
    // Target roughly 6 bins.
    const targetBins = Math.min(8, Math.max(4, Math.round(Math.sqrt(valid.length))));
    const idealWidth = range / targetBins;
  
    // Nice widths (milliseconds).
    const niceWidths = [
      100,    // 0.10 s
      250,    // 0.25 s
      500,    // 0.50 s
      1000,   // 1 s
      2000,   // 2 s
      5000,   // 5 s
      10000,  // 10 s
      30000,  // 30 s
      60000,  // 1 min
    ];
  
    const binWidth =
      niceWidths.find((w) => w >= idealWidth) ??
      niceWidths[niceWidths.length - 1];
  
    const start = Math.floor(min / binWidth) * binWidth;
    const end = Math.ceil(max / binWidth) * binWidth;
  
    const bucketCount = Math.ceil((end - start) / binWidth);
  
    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const from = start + i * binWidth;
      const to = from + binWidth;
  
      return {
        range: `${formatAverage(from)}–${formatAverage(to)}`,
        count: 0,
      };
    });
  
    for (const time of valid) {
      let index = Math.floor((time - start) / binWidth);
  
      if (index < 0) index = 0;
      if (index >= buckets.length) index = buckets.length - 1;
  
      buckets[index].count++;
    }
  
    return buckets;
  }, [solves, p]);

  const bestProgression = useMemo(() => {
    let running = Number.POSITIVE_INFINITY
    return solves.map((s, i) => {
      const t = effectiveTime(s)
      if (isFinite(t)) running = Math.min(running, t)
      return { index: i + 1, best: isFinite(running) ? running / 1000 : null }
    })
  }, [solves])

  const fmt = (v: number | null) => (v !== null ? formatAverage(v, p) : "—")
  const accent = "var(--color-chart-1)"
  const muted = "var(--color-muted-foreground)"

  if (solves.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <h2 className="text-lg font-semibold">No data yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Complete a few solves in the {session?.name ?? "current"} session to see detailed statistics and charts here.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold">{session?.name} statistics</h1>
        <p className="text-sm text-muted-foreground">
          {solves.length} solves • {successRate(solves).toFixed(0)}% success rate
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Best" value={fmt(best(solves))} />
        <StatCard label="Ao5" value={fmt(averageOf(solves, 5))} sub={`PB ${fmt(bestAverageOf(solves, 5))}`} />
        <StatCard label="Ao12" value={fmt(averageOf(solves, 12))} sub={`PB ${fmt(bestAverageOf(solves, 12))}`} />
        <StatCard label="Ao100" value={fmt(averageOf(solves, 100))} sub={`PB ${fmt(bestAverageOf(solves, 100))}`} />
        <StatCard label="Mean" value={fmt(mean(solves))} sub={`Median ${fmt(median(solves))}`} />
        <StatCard label="Worst" value={fmt(worst(solves))} sub={`${countPenalty(solves, "dnf")} DNF · ${countPenalty(solves, "plus2")} +2`} />
      </div>

      <Card className="p-4">
        <h2 className="mb-4 text-sm font-semibold">Times &amp; rolling averages</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timeSeries} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="index" tick={{ fontSize: 11, fill: muted }} stroke="var(--color-border)" />
            <YAxis tick={{ fontSize: 11, fill: muted }} stroke="var(--color-border)" width={44} />
            <Tooltip content={<ChartTooltip precision={p} />} />
            <Line type="monotone" dataKey="time" name="single" stroke={muted} dot={false} strokeWidth={1} opacity={0.5} />
            <Line type="monotone" dataKey="ao5" name="ao5" stroke={accent} dot={false} strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey="ao12" name="ao12" stroke="var(--color-chart-3)" dot={false} strokeWidth={2} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold">Time distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histogram} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: muted }} stroke="var(--color-border)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: muted }} stroke="var(--color-border)" width={30} />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="solves" fill={accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold">Personal best progression</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bestProgression} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="pbFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="index" tick={{ fontSize: 11, fill: muted }} stroke="var(--color-border)" />
              <YAxis tick={{ fontSize: 11, fill: muted }} stroke="var(--color-border)" width={44} />
              <Tooltip content={<ChartTooltip precision={p} />} />
              <Area type="stepAfter" dataKey="best" name="best" stroke={accent} strokeWidth={2} fill="url(#pbFill)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
