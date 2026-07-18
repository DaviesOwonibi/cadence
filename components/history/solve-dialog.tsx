"use client"

import { useEffect, useState } from "react"
import { Star, Trash2 } from "lucide-react"
import { useCubeStore } from "@/lib/store"
import { formatDateTime, formatSolve } from "@/lib/cubing/format"
import type { Penalty, Solve } from "@/lib/cubing/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SolveDialog({ solve: initial, onClose }: { solve: Solve | null; onClose: () => void }) {
  const setPenalty = useCubeStore((s) => s.setPenalty)
  const toggleFavorite = useCubeStore((s) => s.toggleFavorite)
  const updateSolve = useCubeStore((s) => s.updateSolve)
  const deleteSolve = useCubeStore((s) => s.deleteSolve)
  const settings = useCubeStore((s) => s.settings)
  // read the live version from the store so edits reflect immediately
  const live = useCubeStore((s) => s.solves.find((sv) => sv.id === initial?.id))
  const solve = live ?? initial
  const [comment, setComment] = useState("")

  useEffect(() => {
    setComment(initial?.comment ?? "")
  }, [initial])

  if (!solve) return null

  // live reference so the displayed penalty updates
  const penalties: { value: Penalty; label: string }[] = [
    { value: "none", label: "OK" },
    { value: "plus2", label: "+2" },
    { value: "dnf", label: "DNF" },
  ]

  return (
    <Dialog open={!!solve} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-2xl tabular-nums">{formatSolve(solve, settings.precision)}</span>
            <button
              onClick={() => toggleFavorite(solve.id)}
              className="text-muted-foreground transition-colors hover:text-amber-400"
              aria-label="Toggle favorite"
            >
              <Star className={`size-5 ${solve.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Scramble</Label>
            <p className="whitespace-pre-line rounded-md border border-border bg-muted/50 p-3 font-mono text-sm leading-relaxed">
              {solve.scramble}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {penalties.map((pen) => (
              <Button
                key={pen.value}
                size="sm"
                variant={solve.penalty === pen.value ? "default" : "outline"}
                className="flex-1 bg-transparent data-[active=true]:bg-primary"
                data-active={solve.penalty === pen.value}
                onClick={() => setPenalty(solve.id, pen.value)}
              >
                {pen.label}
              </Button>
            ))}
          </div>

          <div>
            <Label htmlFor="comment" className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
              Comment
            </Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={() => updateSolve(solve.id, { comment })}
              placeholder="Add a note about this solve"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDateTime(solve.createdAt)}</span>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => {
                deleteSolve(solve.id)
                onClose()
              }}
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
