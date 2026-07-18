"use client"

import { useRef } from "react"
import { Check, Download, Upload } from "lucide-react"
import { useCubeStore, type AccentColor, type ThemeMode } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ACCENTS: { id: AccentColor; label: string; color: string }[] = [
  { id: "blue", label: "Blue", color: "oklch(0.62 0.19 256)" },
  { id: "green", label: "Green", color: "oklch(0.65 0.17 156)" },
  { id: "orange", label: "Orange", color: "oklch(0.7 0.18 52)" },
  { id: "rose", label: "Rose", color: "oklch(0.64 0.22 15)" },
  { id: "violet", label: "Violet", color: "oklch(0.6 0.2 292)" },
]

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "oled", label: "OLED" },
]

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="gap-4 p-5">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  )
}

function RowItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm font-normal">{label}</Label>
      {children}
    </div>
  )
}

export function SettingsView() {
  const settings = useCubeStore((s) => s.settings)
  const update = useCubeStore((s) => s.updateSettings)
  const sessions = useCubeStore((s) => s.sessions)
  const solves = useCubeStore((s) => s.solves)
  const importData = useCubeStore((s) => s.importData)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ sessions, solves }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cadence-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (Array.isArray(data.sessions) && Array.isArray(data.solves)) {
        importData({ sessions: data.sessions, solves: data.solves })
      } else {
        alert("Invalid backup file format.")
      }
    } catch {
      alert("Could not read the file. Make sure it is a valid Cadence backup.")
    }
    e.target.value = ""
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Section title="Appearance" description="Theme and accent color for the interface.">
        <RowItem label="Theme">
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => update({ theme: t.id })}
                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                  settings.theme === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </RowItem>
        <RowItem label="Accent color">
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => update({ accent: a.id })}
                className="flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-all data-[active=true]:ring-2 data-[active=true]:ring-ring"
                style={{ backgroundColor: a.color }}
                data-active={settings.accent === a.id}
                aria-label={a.label}
              >
                {settings.accent === a.id && <Check className="size-4 text-white" />}
              </button>
            ))}
          </div>
        </RowItem>
      </Section>

      <Section title="Timer" description="Inspection, precision and display behavior.">
        <RowItem label="Inspection">
          <Select
            value={String(settings.inspection)}
            onValueChange={(v) => update({ inspection: Number(v) as 0 | 15 })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">None</SelectItem>
              <SelectItem value="15">15 seconds (WCA)</SelectItem>
            </SelectContent>
          </Select>
        </RowItem>
        <RowItem label="Precision">
          <Select
            value={String(settings.precision)}
            onValueChange={(v) => update({ precision: Number(v) as 2 | 3 })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">Hundredths (0.00)</SelectItem>
              <SelectItem value="3">Milliseconds (0.000)</SelectItem>
            </SelectContent>
          </Select>
        </RowItem>
        <RowItem label="Hide UI while solving">
          <Switch checked={settings.hideWhileSolving} onCheckedChange={(c) => update({ hideWhileSolving: c })} />
        </RowItem>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Timer size</Label>
            <span className="text-xs text-muted-foreground">{settings.timerSize}%</span>
          </div>
          <Slider
            value={[settings.timerSize]}
            min={60}
            max={140}
            step={5}
            onValueChange={(v) => update({ timerSize: Array.isArray(v) ? v[0] : v })}
          />
        </div>
      </Section>

      <Section title="Sound" description="Audio cues for inspection and timing.">
        <RowItem label="Sound effects">
          <Switch checked={settings.soundEnabled} onCheckedChange={(c) => update({ soundEnabled: c })} />
        </RowItem>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Volume</Label>
            <span className="text-xs text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
          </div>
          <Slider
            value={[settings.volume * 100]}
            min={0}
            max={100}
            step={5}
            disabled={!settings.soundEnabled}
            onValueChange={(v) => update({ volume: (Array.isArray(v) ? v[0] : v) / 100 })}
          />
        </div>
      </Section>

      <Section title="Data" description="Back up or restore your sessions and solves.">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-1.5 bg-transparent" onClick={exportData}>
            <Download className="size-4" /> Export JSON
          </Button>
          <Button variant="outline" className="gap-1.5 bg-transparent" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Import JSON
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
        <p className="text-xs text-muted-foreground">
          {sessions.length} sessions • {solves.length} total solves stored locally on this device.
        </p>
      </Section>
    </div>
  )
}
