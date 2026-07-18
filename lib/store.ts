"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Penalty, PuzzleId, Session, Solve } from "@/lib/cubing/types"
import { generateScramble } from "@/lib/cubing/scramble"

export type ThemeMode = "light" | "dark" | "oled"
export type AccentColor = "blue" | "green" | "orange" | "rose" | "violet"
export type InspectionMode = 0 | 15
export type Precision = 2 | 3

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const SESSION_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"]

interface Settings {
  theme: ThemeMode
  accent: AccentColor
  inspection: InspectionMode
  precision: Precision
  soundEnabled: boolean
  volume: number
  timerSize: number
  hideWhileSolving: boolean
}

interface CubeState {
  sessions: Session[]
  solves: Solve[]
  activeSessionId: string
  currentScramble: string
  settings: Settings

  // derived helpers
  addSolve: (time: number, penalty?: Penalty) => void
  deleteSolve: (id: string) => void
  updateSolve: (id: string, patch: Partial<Solve>) => void
  setPenalty: (id: string, penalty: Penalty) => void
  toggleFavorite: (id: string) => void

  newScramble: () => void
  setScramble: (s: string) => void

  createSession: (name: string, puzzle: PuzzleId) => void
  renameSession: (id: string, name: string) => void
  deleteSession: (id: string) => void
  duplicateSession: (id: string) => void
  archiveSession: (id: string, archived: boolean) => void
  setActiveSession: (id: string) => void

  updateSettings: (patch: Partial<Settings>) => void
  importData: (data: { sessions: Session[]; solves: Solve[] }) => void
  clearSession: (id: string) => void
}

const defaultSessionId = "default-333"

const initialSessions: Session[] = [
  {
    id: defaultSessionId,
    name: "Main 3x3",
    puzzle: "333",
    color: SESSION_COLORS[0],
    createdAt: Date.now(),
    archived: false,
  },
]

export const useCubeStore = create<CubeState>()(
  persist(
    (set, get) => ({
      sessions: initialSessions,
      solves: [],
      activeSessionId: defaultSessionId,
      currentScramble: generateScramble("333"),
      settings: {
        theme: "dark",
        accent: "blue",
        inspection: 0,
        precision: 2,
        soundEnabled: false,
        volume: 0.5,
        timerSize: 100,
        hideWhileSolving: false,
      },

      addSolve: (time, penalty = "none") => {
        const { activeSessionId, sessions, currentScramble } = get()
        const session = sessions.find((s) => s.id === activeSessionId)
        const solve: Solve = {
          id: uid(),
          sessionId: activeSessionId,
          time,
          scramble: currentScramble,
          puzzle: session?.puzzle ?? "333",
          penalty,
          comment: "",
          favorite: false,
          createdAt: Date.now(),
        }
        set((state) => ({ solves: [...state.solves, solve] }))
        get().newScramble()
      },

      deleteSolve: (id) => set((state) => ({ solves: state.solves.filter((s) => s.id !== id) })),

      updateSolve: (id, patch) =>
        set((state) => ({
          solves: state.solves.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      setPenalty: (id, penalty) =>
        set((state) => ({
          solves: state.solves.map((s) => (s.id === id ? { ...s, penalty } : s)),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          solves: state.solves.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)),
        })),

      newScramble: () => {
        const { sessions, activeSessionId } = get()
        const session = sessions.find((s) => s.id === activeSessionId)
        set({ currentScramble: generateScramble(session?.puzzle ?? "333") })
      },

      setScramble: (s) => set({ currentScramble: s }),

      createSession: (name, puzzle) => {
        const id = uid()
        const color = SESSION_COLORS[get().sessions.length % SESSION_COLORS.length]
        const session: Session = { id, name, puzzle, color, createdAt: Date.now(), archived: false }
        set((state) => ({ sessions: [...state.sessions, session], activeSessionId: id }))
        get().newScramble()
      },

      renameSession: (id, name) =>
        set((state) => ({ sessions: state.sessions.map((s) => (s.id === id ? { ...s, name } : s)) })),

      deleteSession: (id) => {
        const { sessions } = get()
        if (sessions.length <= 1) return
        const remaining = sessions.filter((s) => s.id !== id)
        set((state) => ({
          sessions: remaining,
          solves: state.solves.filter((s) => s.sessionId !== id),
          activeSessionId: state.activeSessionId === id ? remaining[0].id : state.activeSessionId,
        }))
        get().newScramble()
      },

      duplicateSession: (id) => {
        const session = get().sessions.find((s) => s.id === id)
        if (!session) return
        const newId = uid()
        set((state) => ({
          sessions: [
            ...state.sessions,
            { ...session, id: newId, name: `${session.name} copy`, createdAt: Date.now() },
          ],
        }))
      },

      archiveSession: (id, archived) =>
        set((state) => ({ sessions: state.sessions.map((s) => (s.id === id ? { ...s, archived } : s)) })),

      setActiveSession: (id) => {
        set({ activeSessionId: id })
        get().newScramble()
      },

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      importData: (data) => set({ sessions: data.sessions, solves: data.solves }),

      clearSession: (id) =>
        set((state) => ({ solves: state.solves.filter((s) => s.sessionId !== id) })),
    }),
    {
      name: "v0-cube-timer",
      version: 2,
    },
  ),
)
