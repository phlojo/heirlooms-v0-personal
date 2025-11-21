"use client"

import { useEffect, useState } from "react"
import { getArtifactTypeIcon } from "@/config/artifact-types"
import { cn } from "@/lib/utils"
import type { ArtifactType } from "@/lib/types/artifact-types"
import { getArtifactTypes } from "@/lib/actions/artifact-types"

interface AnimatedArtifactsIconProps {
  className?: string
}

/**
 * AnimatedArtifactsIcon - Cycles through artifact type icons from database
 *
 * Smoothly animates between different artifact type icons to showcase
 * the variety of artifacts that can be collected in Heirlooms.
 *
 * Data Source:
 * - Fetches active artifact types from Supabase on mount
 * - Uses icon_name from database to map to Lucide icons
 * - Falls back to Package icon if no types available
 *
 * Animation:
 * - Changes icon every 4 seconds
 * - Uses opacity cross-fade for smooth transition
 * - Respects prefers-reduced-motion
 * - Continues animating even when tab is active
 *
 * Styling:
 * - Inherits color from parent (text-muted-foreground or text-foreground)
 * - No stroke or fill changes - consistent with other bottom nav icons
 *
 * Accessibility:
 * - No rapid flashing (4s interval is very slow)
 * - Respects prefers-reduced-motion preference
 * - Semantic HTML with proper ARIA attributes
 */
export function AnimatedArtifactsIcon({ className }: AnimatedArtifactsIconProps) {
  const [artifactTypes, setArtifactTypes] = useState<ArtifactType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    async function fetchTypes() {
      const types = await getArtifactTypes()
      console.log("[v0] AnimatedArtifactsIcon loaded types:", types)
      setArtifactTypes(types)
    }
    fetchTypes()
  }, [])

  useEffect(() => {
    // Don't animate if no types loaded
    if (artifactTypes.length === 0) return

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      // If reduced motion is preferred, just show the first icon
      setCurrentIndex(0)
      return
    }

    // Change icon every 4 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true)

      // After fade out, change icon
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % artifactTypes.length)
        setIsTransitioning(false)
      }, 200) // Half of transition duration
    }, 4000)

    return () => clearInterval(interval)
  }, [artifactTypes])

  const currentType = artifactTypes[currentIndex]
  const IconComponent = currentType ? getArtifactTypeIcon(currentType.icon_name) : getArtifactTypeIcon("Package") // Fallback icon

  return (
    <div className="relative">
      <IconComponent
        aria-label="Artifacts icon"
        className={cn(
          "transition-opacity duration-[400ms] ease-in-out",
          isTransitioning ? "opacity-0" : "opacity-100",
          className,
        )}
      />
    </div>
  )
}
