"use client"

import { useState } from "react"
import clsx from "clsx"

interface MediaImageProps {
  src?: string | null
  alt?: string
  className?: string
  objectFit?: "cover" | "contain"
  fallbackSrc?: string
}

function MediaImage({
  src,
  alt = "",
  className = "",
  objectFit = "cover",
  fallbackSrc = "/placeholder.svg",
}: MediaImageProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>(
    (!src || src === "") ? 'loaded' : 'loading'
  )
  const [imageSrc, setImageSrc] = useState<string>(src || fallbackSrc)

  const handleError = (): void => {
    console.log("[v0] MediaImage error for:", imageSrc)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setLoadState('loaded')
    }
  }

  const handleLoad = (): void => {
    console.log("[v0] MediaImage loaded:", imageSrc)
    setLoadState('loaded')
  }

  const effectiveSrc = src || fallbackSrc

  return (
    <div className={clsx("relative w-full h-full overflow-hidden", className)}>
      {loadState === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
      )}

      <img
        src={effectiveSrc || "/placeholder.svg"}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
        className={clsx(
          "w-full h-full transition-opacity duration-300",
          loadState === 'loaded' ? "opacity-100" : "opacity-0",
          objectFit === "cover" ? "object-cover" : "object-contain"
        )}
      />
    </div>
  )
}

export { MediaImage }
export default MediaImage
