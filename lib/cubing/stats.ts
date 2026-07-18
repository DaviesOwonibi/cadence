import type { Solve } from "./types"
import { effectiveTime } from "./types"

/**
 * WCA average of N: drop the fastest 5% and slowest 5% (min 1 each for N>=5),
 * then take the mean of the rest. For Ao5 that means dropping best+worst.
 * More than one DNF (for N=5) makes the average DNF.
 * Returns Infinity when the average is a DNF, or null when not enough solves.
 */
export function averageOf(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null
  const window = solves.slice(-n)
  const times = window.map((s) => effectiveTime(s))
  const trim = n >= 5 ? Math.ceil(n * 0.05) : 0
  const dnfCount = times.filter((t) => !isFinite(t)).length
  if (dnfCount > trim) return Number.POSITIVE_INFINITY
  const sorted = [...times].sort((a, b) => a - b)
  const kept = sorted.slice(trim, n - trim)
  const sum = kept.reduce((acc, t) => acc + t, 0)
  return sum / kept.length
}

/** Mean of all valid (non-DNF) solves. */
export function mean(solves: Solve[]): number | null {
  const valid = solves.map(effectiveTime).filter((t) => isFinite(t))
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export function median(solves: Solve[]): number | null {
  const valid = solves
    .map(effectiveTime)
    .filter((t) => isFinite(t))
    .sort((a, b) => a - b)
  if (valid.length === 0) return null
  const mid = Math.floor(valid.length / 2)
  return valid.length % 2 ? valid[mid] : (valid[mid - 1] + valid[mid]) / 2
}

export function best(solves: Solve[]): number | null {
  const valid = solves.map(effectiveTime).filter((t) => isFinite(t))
  if (valid.length === 0) return null
  return Math.min(...valid)
}

export function worst(solves: Solve[]): number | null {
  const valid = solves.map(effectiveTime).filter((t) => isFinite(t))
  if (valid.length === 0) return null
  return Math.max(...valid)
}

/** Best average of N across the whole session (rolling window). */
export function bestAverageOf(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null
  let bestAvg: number | null = null
  for (let i = 0; i + n <= solves.length; i++) {
    const avg = averageOf(solves.slice(i, i + n), n)
    if (avg === null || !isFinite(avg)) continue
    if (bestAvg === null || avg < bestAvg) bestAvg = avg
  }
  return bestAvg
}

/** Rolling average series (each point is the Ao{n} ending at that index). */
export function rollingAverageSeries(solves: Solve[], n: number): (number | null)[] {
  return solves.map((_, i) => {
    if (i + 1 < n) return null
    const avg = averageOf(solves.slice(i + 1 - n, i + 1), n)
    return avg !== null && isFinite(avg) ? avg : null
  })
}

export function countPenalty(solves: Solve[], penalty: "plus2" | "dnf"): number {
  return solves.filter((s) => s.penalty === penalty).length
}

export function successRate(solves: Solve[]): number {
  if (solves.length === 0) return 0
  const dnf = countPenalty(solves, "dnf")
  return ((solves.length - dnf) / solves.length) * 100
}
