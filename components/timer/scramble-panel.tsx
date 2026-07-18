"use client"

import { useState } from "react"
import { Check, Copy, RotateCw } from "lucide-react"
import { useCubeStore } from "@/lib/store"
import { useActiveSession } from "@/lib/hooks"
import { Button } from "@/components/ui/button"

export function ScramblePanel({ dimmed }: { dimmed?: boolean }) {
  const scramble = useCubeStore((s) => s.currentScramble)
  const newScramble = useCubeStore((s) => s.newScramble)
  const session = useActiveSession()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(scramble)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  const isMultiline = scramble.includes("\n")
  const moveCount = isMultiline ? scramble.split("\n").length : scramble.trim().split(/\s+/).length

  return (
    <div
      className={`w-full transition-opacity duration-300 ${dimmed ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>{session?.name ?? "Session"}</span>
          <span className="text-border">•</span>
          <span>{isMultiline ? `${moveCount} lines` : `${moveCount} moves`}</span>
        </div>
        <p
          className={`text-balance text-center font-mono leading-relaxed text-foreground ${
            isMultiline ? "whitespace-pre-line text-sm sm:text-base" : "text-lg sm:text-2xl"
          }`}
        >
          {scramble}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={newScramble} className="gap-1.5 bg-transparent">
            <RotateCw className="size-3.5" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={copy} className="gap-1.5">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  )
}
