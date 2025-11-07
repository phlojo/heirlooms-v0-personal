"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"
import { SwipeGuidance } from "@/components/swipe-guidance"

interface CollectionSwipeWrapperProps {
  previousUrl: string | null
  nextUrl: string | null
  children: React.ReactNode
}

export function CollectionSwipeWrapper({ previousUrl, nextUrl, children }: CollectionSwipeWrapperProps) {
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
