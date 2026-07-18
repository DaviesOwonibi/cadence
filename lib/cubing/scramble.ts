import type { PuzzleId } from "./types"

function randInt(n: number): number {
  return Math.floor(Math.random() * n)
}

function pick<T>(arr: T[]): T {
  return arr[randInt(arr.length)]
}

/**
 * Generic WCA-style scramble for cubic NxN puzzles.
 * Avoids consecutive moves on the same axis to keep scrambles well-formed.
 */
function cubeScramble(length: number, faces: string[], suffixes: string[], axisOf: (f: string) => number): string {
  const moves: string[] = []
  let lastAxis = -1
  let secondLastAxis = -1
  let count = 0
  while (count < length) {
    const face = pick(faces)
    const axis = axisOf(face)
    // avoid same-axis repeats (both the immediately previous and the sandwiched case)
    if (axis === lastAxis) continue
    if (axis === secondLastAxis && lastAxis === secondLastAxis) continue
    moves.push(face + pick(suffixes))
    secondLastAxis = lastAxis
    lastAxis = axis
    count++
  }
  return moves.join(" ")
}

const AXIS_333: Record<string, number> = { R: 0, L: 0, U: 1, D: 1, F: 2, B: 2 }
const SUFFIX = ["", "'", "2"]

function scramble333(length = 20): string {
  const faces = ["R", "L", "U", "D", "F", "B"]
  let last = ""
  const moves: string[] = []
  while (moves.length < length) {
    const face = pick(faces)
    if (AXIS_333[face] === AXIS_333[last]) continue
    moves.push(face + pick(SUFFIX))
    last = face
  }
  return moves.join(" ")
}

function scrambleBig(faces: string[], length: number): string {
  // faces include wide moves like Rw, Lw etc.
  const axisOf = (f: string) => {
    const base = f.replace("w", "")
    return AXIS_333[base]
  }
  return cubeScramble(length, faces, SUFFIX, axisOf)
}

function scrambleMinx(): string {
  // Megaminx official notation: 7 lines of R++/R--/D++/D-- ... U/U'
  const lines: string[] = []
  for (let i = 0; i < 7; i++) {
    const parts: string[] = []
    for (let j = 0; j < 5; j++) {
      const rd = pick(["R", "D"])
      const dir = pick(["++", "--"])
      parts.push(rd + dir)
    }
    parts.push(pick(["U", "U'"]))
    lines.push(parts.join(" "))
  }
  return lines.join("\n")
}

function scramblePyram(): string {
  const faces = ["U", "L", "R", "B"]
  const tips = ["u", "l", "r", "b"]
  const moves: string[] = []
  let last = ""
  while (moves.length < 10) {
    const f = pick(faces)
    if (f === last) continue
    moves.push(f + pick(["", "'"]))
    last = f
  }
  // random tips
  for (const t of tips) {
    if (Math.random() > 0.5) moves.push(t + pick(["", "'"]))
  }
  return moves.join(" ")
}

function scrambleSkewb(): string {
  const faces = ["R", "L", "U", "B"]
  const moves: string[] = []
  let last = ""
  while (moves.length < 9) {
    const f = pick(faces)
    if (f === last) continue
    moves.push(f + pick(["", "'"]))
    last = f
  }
  return moves.join(" ")
}

function scrambleSq1(): string {
  const parts: string[] = []
  for (let i = 0; i < 12; i++) {
    const top = randInt(13) - 6
    const bottom = randInt(13) - 6
    parts.push(`(${top},${bottom})`)
    if (i < 11) parts.push("/")
  }
  return parts.join(" ")
}

function scrambleClock(): string {
  const pins = ["UR", "DR", "DL", "UL", "U", "R", "D", "L", "ALL"]
  const parts = pins.map((p) => {
    const amt = randInt(12) - 5
    return `${p}${amt >= 0 ? "+" : ""}${amt}`
  })
  parts.push("y2")
  const back = ["U", "R", "D", "L", "ALL"].map((p) => {
    const amt = randInt(12) - 5
    return `${p}${amt >= 0 ? "+" : ""}${amt}`
  })
  return parts.concat(back).join(" ")
}

export function generateScramble(puzzle: PuzzleId): string {
  switch (puzzle) {
    case "222":
      return scramble333(11).split(" ").slice(0, 11).join(" ")
    case "333":
    case "333mirror":
    case "333oh":
    case "333bf":
      return scramble333(20)
    case "fmc":
      return "R' U' F " + scramble333(20) + " R' U' F"
    case "444":
      return scrambleBig(["R", "L", "U", "D", "F", "B", "Rw", "Uw", "Fw"], 44)
    case "555":
      return scrambleBig(["R", "L", "U", "D", "F", "B", "Rw", "Uw", "Fw", "Lw", "Dw", "Bw"], 60)
    case "666":
      return scrambleBig(["R", "L", "U", "D", "F", "B", "Rw", "Uw", "Fw", "3Rw", "3Uw", "3Fw"], 80)
    case "777":
      return scrambleBig(["R", "L", "U", "D", "F", "B", "Rw", "Uw", "Fw", "3Rw", "3Uw", "3Fw"], 100)
    case "minx":
      return scrambleMinx()
    case "pyram":
      return scramblePyram()
    case "skewb":
      return scrambleSkewb()
    case "sq1":
      return scrambleSq1()
    case "clock":
      return scrambleClock()
    default:
      return scramble333(20)
  }
}
