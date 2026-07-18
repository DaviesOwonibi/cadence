"use client"

import { useEffect } from "react"
import { useCubeStore } from "@/lib/store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useCubeStore((s) => s.settings.theme)
  const accent = useCubeStore((s) => s.settings.accent)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark", "oled")
    if (theme === "light") {
      root.classList.add("light")
    } else if (theme === "oled") {
      root.classList.add("dark", "oled")
    } else {
      root.classList.add("dark")
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent)
  }, [accent])

  return <>{children}</>
}
