"use client"

import { useCubeStore } from "@/lib/store"
import { useSessionSolves } from "@/lib/hooks"
import { averageOf, best } from "@/lib/cubing/stats"
import { formatAverage, formatSolve } from "@/lib/cubing/format"
import { useTimer } from "./use-timer"
import { TimerDisplay } from "./timer-display"
import { ScramblePanel } from "./scramble-panel"
import { SessionSwitcher } from "@/components/sessions/session-switcher"
import { Button } from "@/components/ui/button"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

export function TimerView() {
  const settings = useCubeStore((s) => s.settings)
  const solves = useSessionSolves()
  const setPenalty = useCubeStore((s) => s.setPenalty)
  const deleteSolve = useCubeStore((s) => s.deleteSolve)

  const { phase, displayMs, inspectionRemaining, pendingPenalty, bind } = useTimer(true)

  const last = solves[solves.length - 1]
  const ao5 = averageOf(solves, 5)
  const ao12 = averageOf(solves, 12)
  const pb = best(solves)

  const solving = phase === "running" || phase === "holding" || phase === "ready" || phase === "inspection"
  const dim = solving && (settings.hideWhileSolving || phase === "running")

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* header row */}
      <div
        className={`flex items-center justify-between gap-3 px-4 pt-4 transition-opacity duration-300 sm:px-6 ${
          dim ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <SessionSwitcher />
        <div className="hidden items-center gap-5 sm:flex">
          <Stat label="Solves" value={String(solves.filter((s) => s.penalty !== "dnf").length)} />
          <Stat label="Best" value={pb !== null ? formatAverage(pb, settings.precision) : "—"} />
          <Stat label="Ao5" value={ao5 !== null ? formatAverage(ao5, settings.precision) : "—"} />
          <Stat label="Ao12" value={ao12 !== null ? formatAverage(ao12, settings.precision) : "—"} />
        </div>
      </div>

      {/* scramble */}
      <div className="px-4 pt-6 sm:pt-8">
        <ScramblePanel dimmed={dim} />
      </div>

      {/* timer touch area */}
      <div
        className="flex flex-1 cursor-pointer touch-none items-center justify-center px-4 py-8"
        {...bind}
        role="button"
        tabIndex={-1}
        aria-label="Timer. Hold space or press and hold to start."
      >
        <TimerDisplay
          phase={phase}
          displayMs={displayMs}
          inspectionRemaining={inspectionRemaining}
          pendingPenalty={pendingPenalty}
          precision={settings.precision}
          scale={settings.timerSize}
        />
      </div>

      {/* last solve controls */}
      <div
        className={`flex min-h-[3.5rem] items-center justify-center gap-2 px-4 pb-6 transition-opacity duration-300 ${
          dim ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        {last ? (
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 p-1 pl-4 backdrop-blur">
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatSolve(last, settings.precision)}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={last.penalty === "none" ? "secondary" : "ghost"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setPenalty(last.id, "none")}
              >
                OK
              </Button>
              <Button
                size="sm"
                variant={last.penalty === "plus2" ? "secondary" : "ghost"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setPenalty(last.id, "plus2")}
              >
                +2
              </Button>
              <Button
                size="sm"
                variant={last.penalty === "dnf" ? "secondary" : "ghost"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setPenalty(last.id, "dnf")}
              >
                DNF
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full px-2.5 text-xs text-destructive hover:text-destructive"
                onClick={() => deleteSolve(last.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Hold <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Space</kbd> and release
            to start
          </p>
        )}
      </div>
    </div>
  )
}
