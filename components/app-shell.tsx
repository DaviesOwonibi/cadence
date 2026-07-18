"use client"

import { useState } from "react"
import { BarChart3, Clock, History, Settings as SettingsIcon, Boxes } from "lucide-react"
import { useHydrated } from "@/lib/hooks"
import { TimerView } from "@/components/timer/timer-view"
import { StatsSidebar } from "@/components/stats/stats-sidebar"
import { StatisticsView } from "@/components/stats/statistics-view"
import { HistoryView } from "@/components/history/history-view"
import { SettingsView } from "@/components/settings/settings-view"

type View = "timer" | "stats" | "history" | "settings"

const NAV: { id: View; label: string; icon: typeof Clock }[] = [
  { id: "timer", label: "Timer", icon: Clock },
  { id: "stats", label: "Statistics", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

export function AppShell() {
  const [view, setView] = useState<View>("timer")
  const hydrated = useHydrated()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Cadence</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                  active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </header>

      <main className="flex-1">
        {!hydrated ? (
          <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : view === "timer" ? (
          <div className="grid lg:grid-cols-[1fr_20rem]">
            <TimerView />
            <div className="hidden lg:block">
              <StatsSidebar />
            </div>
          </div>
        ) : view === "stats" ? (
          <StatisticsView />
        ) : view === "history" ? (
          <HistoryView />
        ) : (
          <SettingsView />
        )}
      </main>
    </div>
  )
}
