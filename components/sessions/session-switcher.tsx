"use client"

import { useState } from "react"
import { Check, ChevronDown, Copy, Pencil, Plus, Trash2 } from "lucide-react"
import { useCubeStore } from "@/lib/store"
import { PUZZLES, type PuzzleId } from "@/lib/cubing/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SessionSwitcher() {
  const sessions = useCubeStore((s) => s.sessions)
  const activeSessionId = useCubeStore((s) => s.activeSessionId)
  const setActiveSession = useCubeStore((s) => s.setActiveSession)
  const createSession = useCubeStore((s) => s.createSession)
  const renameSession = useCubeStore((s) => s.renameSession)
  const deleteSession = useCubeStore((s) => s.deleteSession)
  const duplicateSession = useCubeStore((s) => s.duplicateSession)

  const active = sessions.find((s) => s.id === activeSessionId)
  const visible = sessions.filter((s) => !s.archived)

  const [createOpen, setCreateOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState("")
  const [puzzle, setPuzzle] = useState<PuzzleId>("333")

  const puzzleName = (id: PuzzleId) => PUZZLES.find((p) => p.id === id)?.short ?? id

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 bg-transparent" />}>
          <span className="size-2.5 rounded-full" style={{ backgroundColor: active?.color }} aria-hidden />
          <span className="max-w-[10rem] truncate font-medium">{active?.name}</span>
          <span className="text-xs text-muted-foreground">{active ? puzzleName(active.puzzle) : ""}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sessions</DropdownMenuLabel>
            {visible.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => setActiveSession(s.id)}
                className="flex items-center gap-2"
              >
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                <span className="flex-1 truncate">{s.name}</span>
                <span className="text-xs text-muted-foreground">{puzzleName(s.puzzle)}</span>
                {s.id === activeSessionId && <Check className="size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setName("")
              setPuzzle("333")
              setCreateOpen(true)
            }}
          >
            <Plus className="size-4" /> New session
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setName(active?.name ?? "")
              setRenameOpen(true)
            }}
          >
            <Pencil className="size-4" /> Rename current
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => active && duplicateSession(active.id)}>
            <Copy className="size-4" /> Duplicate current
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={sessions.length <= 1}
            onClick={() => active && deleteSession(active.id)}
          >
            <Trash2 className="size-4" /> Delete current
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New session</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="session-name">Name</Label>
              <Input
                id="session-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. OH practice"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Puzzle</Label>
              <Select value={puzzle} onValueChange={(v) => setPuzzle(v as PuzzleId)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PUZZLES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                createSession(name.trim() || "New session", puzzle)
                setCreateOpen(false)
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename session</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (active) renameSession(active.id, name.trim() || active.name)
                setRenameOpen(false)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
