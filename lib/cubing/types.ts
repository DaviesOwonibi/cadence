export type PuzzleId =
  | "222"
  | "333"
  | "444"
  | "555"
  | "666"
  | "777"
  | "clock"
  | "minx"
  | "pyram"
  | "skewb"
  | "sq1"
  | "333mirror"
  | "333oh"
  | "333bf"
  | "fmc"

export interface PuzzleMeta {
  id: PuzzleId
  name: string
  short: string
}

export const PUZZLES: PuzzleMeta[] = [
  { id: "222", name: "2x2x2", short: "2x2" },
  { id: "333", name: "3x3x3", short: "3x3" },
  { id: "444", name: "4x4x4", short: "4x4" },
  { id: "555", name: "5x5x5", short: "5x5" },
  { id: "666", name: "6x6x6", short: "6x6" },
  { id: "777", name: "7x7x7", short: "7x7" },
  { id: "clock", name: "Clock", short: "Clock" },
  { id: "minx", name: "Megaminx", short: "Minx" },
  { id: "pyram", name: "Pyraminx", short: "Pyram" },
  { id: "skewb", name: "Skewb", short: "Skewb" },
  { id: "sq1", name: "Square-1", short: "Sq-1" },
  { id: "333mirror", name: "Mirror Cube", short: "Mirror" },
  { id: "333oh", name: "3x3 One-Handed", short: "3x3 OH" },
  { id: "333bf", name: "3x3 Blindfolded", short: "3x3 BLD" },
  { id: "fmc", name: "Fewest Moves", short: "FMC" },
]

export type Penalty = "none" | "plus2" | "dnf"

export interface Solve {
  id: string
  sessionId: string
  /** raw recorded time in milliseconds (without penalty) */
  time: number
  scramble: string
  puzzle: PuzzleId
  penalty: Penalty
  comment: string
  favorite: boolean
  createdAt: number
}

export interface Session {
  id: string
  name: string
  puzzle: PuzzleId
  color: string
  createdAt: number
  archived: boolean
}

/** Effective time in ms accounting for penalty. Returns Infinity for DNF. */
export function effectiveTime(solve: Solve): number {
  if (solve.penalty === "dnf") return Number.POSITIVE_INFINITY
  if (solve.penalty === "plus2") return solve.time + 2000
  return solve.time
}
