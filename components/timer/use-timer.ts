"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useCubeStore } from "@/lib/store"
import type { Penalty } from "@/lib/cubing/types"

export type TimerPhase = "idle" | "inspection" | "holding" | "ready" | "running" | "stopped"

const HOLD_THRESHOLD_MS = 300

interface UseTimerResult {
  phase: TimerPhase
  displayMs: number
  inspectionRemaining: number
  pendingPenalty: Penalty
  bind: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
  }
}

export function useTimer(enabled: boolean): UseTimerResult {
  const inspection = useCubeStore((s) => s.settings.inspection)
  const soundEnabled = useCubeStore((s) => s.settings.soundEnabled)
  const volume = useCubeStore((s) => s.settings.volume)
  const addSolve = useCubeStore((s) => s.addSolve)

  const [phase, setPhase] = useState<TimerPhase>("idle")
  const [displayMs, setDisplayMs] = useState(0)
  const [inspectionRemaining, setInspectionRemaining] = useState<number>(inspection)
  const [pendingPenalty, setPendingPenalty] = useState<Penalty>("none")

  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const holdTimer = useRef<number | null>(null)
  const rafId = useRef<number | null>(null)
  const startTime = useRef(0)
  const inspectionStart = useRef(0)
  const inspectionRaf = useRef<number | null>(null)
  const pendingPenaltyRef = useRef<Penalty>("none")

  const beep = useCallback(
    (freq: number) => {
      if (!soundEnabled) return
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new Ctx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.value = freq
        gain.gain.value = volume * 0.15
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.08)
        setTimeout(() => ctx.close(), 200)
      } catch {
        /* ignore */
      }
    },
    [soundEnabled, volume],
  )

  const stopRaf = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current)
    rafId.current = null
  }
  const stopInspectionRaf = () => {
    if (inspectionRaf.current) cancelAnimationFrame(inspectionRaf.current)
    inspectionRaf.current = null
  }

  const tick = useCallback(() => {
    setDisplayMs(performance.now() - startTime.current)
    rafId.current = requestAnimationFrame(tick)
  }, [])

  const inspectionTick = useCallback(() => {
    const elapsed = (performance.now() - inspectionStart.current) / 1000
    const remaining = 15 - elapsed
    setInspectionRemaining(Math.max(-2, remaining))
    if (remaining <= -2) {
      pendingPenaltyRef.current = "dnf"
      setPendingPenalty("dnf")
    } else if (remaining <= 0) {
      pendingPenaltyRef.current = "plus2"
      setPendingPenalty("plus2")
    }
    inspectionRaf.current = requestAnimationFrame(inspectionTick)
  }, [])

  const startRunning = useCallback(() => {
    stopInspectionRaf()
    startTime.current = performance.now()
    setDisplayMs(0)
    setPhase("running")
    beep(880)
    rafId.current = requestAnimationFrame(tick)
  }, [beep, tick])

  const finish = useCallback(() => {
    stopRaf()
    const elapsed = performance.now() - startTime.current
    setDisplayMs(elapsed)
    setPhase("stopped")
    beep(440)
    addSolve(Math.round(elapsed), pendingPenaltyRef.current)
    pendingPenaltyRef.current = "none"
    setPendingPenalty("none")
    setInspectionRemaining(inspection)
  }, [addSolve, beep, inspection])

  const press = useCallback(() => {
    const p = phaseRef.current
    if (p === "running") {
      finish()
      return
    }
    if (p === "stopped") {
      setPhase("idle")
      setDisplayMs(0)
      return
    }
    if (p === "idle" && inspection > 0) {
      // begin inspection
      inspectionStart.current = performance.now()
      setInspectionRemaining(15)
      pendingPenaltyRef.current = "none"
      setPendingPenalty("none")
      setPhase("inspection")
      inspectionRaf.current = requestAnimationFrame(inspectionTick)
      return
    }
    if (p === "idle" || p === "inspection") {
      setPhase("holding")
      holdTimer.current = window.setTimeout(() => {
        setPhase("ready")
        beep(660)
      }, HOLD_THRESHOLD_MS)
    }
  }, [beep, finish, inspection, inspectionTick])

  const release = useCallback(() => {
    const p = phaseRef.current
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    if (p === "ready") {
      startRunning()
    } else if (p === "holding") {
      // released too early -> return to previous state
      setPhase(inspection > 0 ? "inspection" : "idle")
    }
  }, [inspection, startRunning])

  // keyboard handling
  useEffect(() => {
    if (!enabled) return
    const isSpace = (e: KeyboardEvent) => e.code === "Space" || e.key === " "

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return
      }
      if (phaseRef.current === "running") {
        // any key stops
        e.preventDefault()
        finish()
        return
      }
      if (!isSpace(e)) return
      e.preventDefault()
      if (e.repeat) return
      press()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (!isSpace(e)) return
      const target = e.target as HTMLElement
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return
      }
      e.preventDefault()
      release()
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [enabled, finish, press, release])

  // cleanup on unmount / disable
  useEffect(() => {
    if (!enabled) {
      stopRaf()
      stopInspectionRaf()
      if (holdTimer.current) clearTimeout(holdTimer.current)
      setPhase("idle")
    }
    return () => {
      stopRaf()
      stopInspectionRaf()
    }
  }, [enabled])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      press()
    },
    [press],
  )
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      release()
    },
    [release],
  )

  return {
    phase,
    displayMs,
    inspectionRemaining,
    pendingPenalty,
    bind: { onPointerDown, onPointerUp },
  }
}
