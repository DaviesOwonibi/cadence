"use client"

import { formatTime } from "@/lib/cubing/format"
import type { TimerPhase } from "./use-timer"
import type { Precision } from "@/lib/store"
import type { Penalty } from "@/lib/cubing/types"

interface Props {
  phase: TimerPhase
  displayMs: number
  inspectionRemaining: number
  pendingPenalty: Penalty
  precision: Precision
  scale: number
}

export function TimerDisplay({ phase, displayMs, inspectionRemaining, pendingPenalty, precision, scale }: Props) {
  let text: string
  let colorClass = "text-foreground"

  if (phase === "inspection" || (phase === "holding" && inspectionRemaining < 15 && inspectionRemaining > -2)) {
    const r = Math.ceil(inspectionRemaining)
    if (inspectionRemaining <= -2) {
      text = "DNF"
      colorClass = "text-destructive"
    } else if (inspectionRemaining <= 0) {
      text = "+2"
      colorClass = "text-destructive"
    } else {
      text = String(r)
      colorClass = r <= 3 ? "text-destructive" : r <= 7 ? "text-amber-500" : "text-foreground"
    }
  } else {
    text = formatTime(displayMs, precision)
    if (phase === "holding") colorClass = "text-destructive"
    else if (phase === "ready") colorClass = "text-emerald-500"
    else if (phase === "running") colorClass = "text-accent-solid"
    else if (pendingPenalty === "dnf") colorClass = "text-destructive"
  }

  return (
    <div className="flex select-none flex-col items-center justify-center">
      <div
        className={`font-mono font-bold leading-none tabular-nums tracking-tight transition-colors duration-100 ${colorClass}`}
        style={{ fontSize: `clamp(3.5rem, ${13 * (scale / 100)}vw, ${11 * (scale / 100)}rem)` }}
        aria-live="polite"
      >
        {text}
      </div>
      {phase === "running" && pendingPenalty !== "none" && (
        <span className="mt-2 text-sm font-medium text-destructive">
          {pendingPenalty === "plus2" ? "+2 penalty" : "DNF"}
        </span>
      )}
    </div>
  )
}
