"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Trigger fade-in on pathname change
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  // Skip animations if user prefers reduced motion
  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <div
      className={`transition-opacity ${isTransitioning ? "opacity-0" : "opacity-100"} ${prefersReducedMotion ? "" : "duration-300"}`}
      style={{
        willChange: "opacity",
      }}
    >
      {children}
    </div>
  )
}
