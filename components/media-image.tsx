"use client"

import { useState, useEffect } from "react"
import clsx from "clsx"

function MediaImage({
  src,
  alt = "",
  className = "",
  objectFit = "cover",
  fallbackSrc = "/placeholder.svg",
}: {
  src?: string | null
  alt?: string
  className?: string
  objectFit?: "cover" | "contain"
  fallbackSrc?: string
}) {
  const [loaded, setLoaded] = useState(!src || src === "")
  const [error, setError] = useState(false)
  const [effectiveSrc, setEffectiveSrc] = useState(src || fallbackSrc)

  useEffect(() => {
    if (!src || src === "") {
      setEffectiveSrc(fallbackSrc)
      setLoaded(true)
      setError(false)
    } else {
      setEffectiveSrc(src)
      setLoaded(false)
      setError(false)
    }
  }, [src, fallbackSrc])

  const handleError = () => {
    if (effectiveSrc !== fallbackSrc) {
      console.log("[v0] MediaImage error, switching to fallback:", effectiveSrc)
      setEffectiveSrc(fallbackSrc)
      setError(true)
      setLoaded(true)
    }
  }

  const handleLoad = () => {
    setLoaded(true)
  }

  return (
    <div className={clsx("relative w-full h-full overflow-hidden", className)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
      )}

      <img
        src={effectiveSrc || "/placeholder.svg"}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={clsx(
          "w-full h-full transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          objectFit === "cover" ? "object-cover" : "object-contain"
        )}
      />
    </div>
  )
}

export { MediaImage }
export default MediaImage
