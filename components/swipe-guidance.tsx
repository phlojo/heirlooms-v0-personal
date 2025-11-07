"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

const STORAGE_KEY = "heirlooms_swipe_guidance_dismissed"

export function SwipeGuidance() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already seen and dismissed the guidance
    const isDismissed = localStorage.getItem(STORAGE_KEY)
    if (!isDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(STORAGE_KEY, "true")
  }

  // Auto-dismiss when navigation occurs (triggered by parent component)
  useEffect(() => {
    const handleNavigation = () => {
      if (isVisible) {
        handleDismiss()
      }
    }

    // Listen for route changes
    window.addEventListener("beforeunload", handleNavigation)

    return () => {
      window.removeEventListener("beforeunload", handleNavigation)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500"
      role="status"
      aria-live="polite"
    >
      <div className="bg-foreground text-background px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span className="font-medium">Swipe to navigate</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  )
}
