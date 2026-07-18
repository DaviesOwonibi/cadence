"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Search, Star } from "lucide-react"
import { useCubeStore } from "@/lib/store"
import { useActiveSession, useSessionSolves } from "@/lib/hooks"
import { effectiveTime, type Solve } from "@/lib/cubing/types"
import { formatDateTime, formatSolve } from "@/lib/cubing/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SolveDialog } from "./solve-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SortKey = "date" | "time"
type Filter = "all" | "favorites" | "plus2" | "dnf"

export function HistoryView() {
  const solves = useSessionSolves()
  const session = useActiveSession()
  const settings = useCubeStore((s) => s.settings)
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [desc, setDesc] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [selected, setSelected] = useState<Solve | null>(null)

  const filtered = useMemo(() => {
    let list = [...solves]
    if (filter === "favorites") list = list.filter((s) => s.favorite)
    else if (filter === "plus2") list = list.filter((s) => s.penalty === "plus2")
    else if (filter === "dnf") list = list.filter((s) => s.penalty === "dnf")
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (s) => s.scramble.toLowerCase().includes(q) || s.comment.toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      const cmp = sortKey === "time" ? effectiveTime(a) - effectiveTime(b) : a.createdAt - b.createdAt
      return desc ? -cmp : cmp
    })
    return list
  }, [solves, filter, query, sortKey, desc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setDesc((d) => !d)
    else {
      setSortKey(key)
      setDesc(true)
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      desc ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUp className="size-3.5" />
      )
    ) : null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">History</h1>
        <p className="text-sm text-muted-foreground">
          {session?.name} • {filtered.length} of {solves.length} solves
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scramble or comment"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All solves</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
            <SelectItem value="plus2">+2 only</SelectItem>
            <SelectItem value="dnf">DNF only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[3rem_1fr_1fr_auto] items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>#</span>
          <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("time")}>
            Time <SortIcon k="time" />
          </button>
          <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("date")}>
            Date <SortIcon k="date" />
          </button>
          <span className="sr-only">Flags</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No solves match your filters</p>
          )}
          {filtered.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="grid w-full grid-cols-[3rem_1fr_1fr_auto] items-center gap-2 border-b border-border/60 px-4 py-2.5 text-left text-sm transition-colors last:border-0 hover:bg-accent"
            >
              <span className="text-xs text-muted-foreground">{desc ? filtered.length - i : i + 1}</span>
              <span className={`font-mono font-medium tabular-nums ${s.penalty === "dnf" ? "text-destructive" : ""}`}>
                {formatSolve(s, settings.precision)}
              </span>
              <span className="truncate text-xs text-muted-foreground">{formatDateTime(s.createdAt)}</span>
              <span className="flex items-center gap-1.5">
                {s.penalty === "plus2" && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem]">
                    +2
                  </Badge>
                )}
                {s.comment && <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-label="has comment" />}
                {s.favorite && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <SolveDialog solve={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
