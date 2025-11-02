"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArtifactCard } from "@/components/artifact-card"

interface Artifact {
  id: string
  title: string
  description: string | null
  media_urls: string[]
  collection_id: string
  user_id: string
  created_at: string
}

interface ArtifactsCarouselProps {
  artifacts: Artifact[]
  canEdit: boolean
}

export function ArtifactsCarousel({ artifacts, canEdit }: ArtifactsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 0)
    // small threshold to avoid flicker
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2)
  }, [])

  // Compute one-step amount = card width + gap
  const getScrollStep = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return 0

    const firstSlide = el.querySelector<HTMLElement>("[data-slide]")
    const cs = getComputedStyle(el)
    // Tailwind gap applies to both row/column; use 'gap' or fallbacks
    const gap =
      parseFloat((cs as any).gap || (cs as any).columnGap || (cs as any).rowGap || "0") || 0

    const cardWidth =
      firstSlide?.getBoundingClientRect().width ?? Math.round(el.clientWidth * 0.66)

    return cardWidth + gap
  }, [])

  const scroll = (dir: "left" | "right") => {
    const el = scrollContainerRef.current
    if (!el) return
    const step = getScrollStep()
    el.scrollBy({
      left: dir === "right" ? step : -step,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    updateArrows()
    const el = scrollContainerRef.current
    if (!el) return

    const onScroll = () => updateArrows()
    const onResize = () => updateArrows()

    el.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [artifacts, updateArrows])

  if (artifacts.length === 0) {
    return (
      <div className="mx-6 rounded-lg border border-dashed p-12 text-center lg:mx-8">
        <p className="text-sm text-muted-foreground">No artifacts in this collection yet.</p>
        {canEdit && (
          <p className="mt-2 text-xs text-muted-foreground">
            Click &quot;Add Artifact&quot; above to add your first item.
          </p>
        )}
      </div>
    )
  }

  return (
    // Clamp any children painting to the viewport to avoid body-level horizontal scroll
    <section className="relative w-full max-w-screen overflow-x-clip">
      {/* Left Navigation Button */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background shadow-lg hover:bg-accent lg:left-4"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Scroll left</span>
        </Button>
      )}

      {/* Right Navigation Button */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background shadow-lg hover:bg-accent lg:right-4"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Scroll right</span>
        </Button>
      )}

      {/* Scroller */}
      <div
        ref={scrollContainerRef}
        className="
          flex snap-x snap-mandatory gap-4
          overflow-x-auto overscroll-x-contain touch-pan-x
          px-4 pb-4 lg:gap-6 lg:px-8
          max-w-screen
          [scrollbar-width:thin]
        "
      >
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            data-slide
            className="
              shrink-0 snap-start
              basis-[66%]   /* ~1.5 cards visible on small screens */
              sm:basis-[60%]
              md:basis-[50%]
              lg:basis-80   /* fixed width cards on desktop */
            "
          >
            <ArtifactCard artifact={artifact} />
          </div>
        ))}
      </div>
    </section>
  )
}
