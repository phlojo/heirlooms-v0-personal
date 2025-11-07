"use client"

import type React from "react"

import { useSwipeNavigation } from "@/hooks/use-swipe-navigation"

interface CollectionSwipeWrapperProps {
  previousUrl: string | null
  nextUrl: string | null
  children: React.ReactNode
}

export function CollectionSwipeWrapper({ previousUrl, nextUrl, children }: CollectionSwipeWrapperProps) {
  useSwipeNavigation({ previousUrl, nextUrl })

  return <>{children}</>
}
