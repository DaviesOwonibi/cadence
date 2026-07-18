"use client"

import { useEffect, useState } from "react"
import { useCubeStore } from "@/lib/store"
import type { Session, Solve } from "@/lib/cubing/types"

/** Returns true once the persisted store has hydrated on the client. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}

export function useActiveSession(): Session | undefined {
  return useCubeStore((s) => s.sessions.find((sess) => sess.id === s.activeSessionId))
}

/** Solves for the active session, ordered oldest -> newest. */
export function useSessionSolves(): Solve[] {
  const solves = useCubeStore((s) => s.solves)
  const activeSessionId = useCubeStore((s) => s.activeSessionId)
  return solves
    .filter((sv) => sv.sessionId === activeSessionId)
    .sort((a, b) => a.createdAt - b.createdAt)
}
