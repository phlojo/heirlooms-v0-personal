"use client"

import type React from "react"

import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"

interface ArtifactSwipeWrapperProps {
  previousUrl: string | null
  nextUrl: string | null
  children: React.ReactNode
}

export function ArtifactSwipeWrapper({ previousUrl, nextUrl, children }: ArtifactSwipeWrapperProps) {
  useSwipeNavigation({ previousUrl, nextUrl })

  return <>{children}</>
}
