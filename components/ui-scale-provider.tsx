"use client"

import { createContext, useContext, useEffect, useState } from "react"

type UiScaleContextType = {
  scale: number
  setScale: (scale: number) => void
}

const UiScaleContext = createContext<UiScaleContextType>({
  scale: 16,
  setScale: () => null,
})

export function UiScaleProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState<number>(16)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("ui-scale")
    if (saved) {
      setScale(Number(saved))
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("ui-scale", scale.toString())
      document.documentElement.style.fontSize = `${scale}px`
    }
  }, [scale, mounted])

  if (!mounted) {
    // Avoid hydration mismatch by rendering normally until mounted
    return <>{children}</>
  }

  return (
    <UiScaleContext.Provider value={{ scale, setScale }}>
      {children}
    </UiScaleContext.Provider>
  )
}

export const useUiScale = () => useContext(UiScaleContext)
