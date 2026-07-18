import type { Solve } from "./types"
import { effectiveTime } from "./types"

/** Format a millisecond value as a cube time string, e.g. 12438 -> "12.44" */
export function formatTime(ms: number, precision: 2 | 3 = 2): string {
  if (!isFinite(ms)) return "DNF"
  if (ms < 0) return "0.00"
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds - minutes * 60
  const secStr = seconds.toFixed(precision).padStart(precision + 3, "0")
  if (minutes > 0) {
    return `${minutes}:${secStr}`
  }
  return seconds.toFixed(precision)
}

export function formatStatTime(seconds: number, precision: 2 | 3 = 2): string {
  if (!Number.isFinite(seconds)) return "DNF";
  if (seconds < 0) return (0).toFixed(precision);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds
      .toFixed(precision)
      .padStart(precision + 3, "0")}`;
  }

  return remainingSeconds.toFixed(precision);
}

/** Format a solve's display time including penalty markers. */
export function formatSolve(solve: Solve, precision: 2 | 3 = 2): string {
  if (solve.penalty === "dnf") return "DNF"
  const base = formatTime(solve.time + (solve.penalty === "plus2" ? 2000 : 0), precision)
  return solve.penalty === "plus2" ? `${base}+` : base
}

/** Format an average value (which may be Infinity for a DNF average). */
export function formatAverage(ms: number, precision: 2 | 3 = 2): string {
  return Number.isFinite(ms)
    ? formatTime(ms, precision)
    : "DNF";
}

export function formatStatAverage(ms: number, precision: 2 | 3 = 2): string {
  return Number.isFinite(ms)
    ? formatStatTime(ms, precision)
    : "DNF";
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export { effectiveTime }
