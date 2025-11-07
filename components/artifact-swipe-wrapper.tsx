"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { SwipeGuidance } from "@/components/swipe-guidance"

interface ArtifactSwipeWrapperProps {
  previousUrl: string | null
  nextUrl: string | null
  children: React.ReactNode
}

export function ArtifactSwipeWrapper({ previousUrl, nextUrl, children }: ArtifactSwipeWrapperProps) {
  const [showGuidance, setShowGuidance] = useState(true)

  useSwipeNavigation({ previousUrl, nextUrl })

  useEffect(() => {
    const handleNavigationDismiss = () => {
      setShowGuidance(false)
    }

    // Hide guidance when URLs change (navigation occurred)
    handleNavigationDismiss()
  }, [previousUrl, nextUrl])

  return (
    <>
      {children}
      {showGuidance && (previousUrl || nextUrl) && <SwipeGuidance />}
    </>
  )
}
