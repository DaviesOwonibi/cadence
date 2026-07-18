"use client"

import { Star } from "lucide-react"
import { useCubeStore } from "@/lib/store"
import { useSessionSolves } from "@/lib/hooks"
import { averageOf, best, bestAverageOf, mean } from "@/lib/cubing/stats"
import { formatAverage, formatSolve } from "@/lib/cubing/format"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SolveDialog } from "@/components/history/solve-dialog"
import { useState } from "react"
import type { Solve } from "@/lib/cubing/types"

function Row({ label, current, best: bestVal }: { label: string; current: string; best: string }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono tabular-nums">{current}</span>
      <span className="text-right font-mono tabular-nums text-muted-foreground">{bestVal}</span>
    </div>
  )
}

export function StatsSidebar() {
  const settings = useCubeStore((s) => s.settings)
  const solves = useSessionSolves()
  const p = settings.precision
  const [selected, setSelected] = useState<Solve | null>(null)

  const fmt = (v: number | null) => (v !== null ? formatAverage(v, p) : "—")

  const recent = [...solves].reverse()

  return (
    <aside className="flex h-full flex-col border-l border-border bg-sidebar/40">
      <div className="border-b border-border p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statistics</h2>
        <div className="grid grid-cols-3 gap-2 pb-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
          <span />
          <span className="text-right">Current</span>
          <span className="text-right">Best</span>
        </div>
        <Row label="single" current={fmt(solves.length ? best(solves.slice(-1)) : null)} best={fmt(best(solves))} />
        <Row label="ao5" current={fmt(averageOf(solves, 5))} best={fmt(bestAverageOf(solves, 5))} />
        <Row label="ao12" current={fmt(averageOf(solves, 12))} best={fmt(bestAverageOf(solves, 12))} />
        <Row label="ao50" current={fmt(averageOf(solves, 50))} best={fmt(bestAverageOf(solves, 50))} />
        <Row label="ao100" current={fmt(averageOf(solves, 100))} best={fmt(bestAverageOf(solves, 100))} />
        <Row label="mean" current={fmt(mean(solves))} best="—" />
      </div>
      <div className="flex items-center justify-between px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent</h2>
        <span className="text-xs text-muted-foreground">{solves.length} solves</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 max-h-24">
          {recent.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">No solves yet</p>
          )}
          {recent.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
            >
              <span className="w-6 text-xs text-muted-foreground">{recent.length - i}</span>
              <span
                className={`flex-1 font-mono tabular-nums ${s.penalty === "dnf" ? "text-destructive" : ""}`}
              >
                {formatSolve(s, p)}
              </span>
              {s.favorite && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
            </button>
          ))}
        </div>
      </ScrollArea>
      <SolveDialog solve={selected} onClose={() => setSelected(null)} />
    </aside>
  )
}
