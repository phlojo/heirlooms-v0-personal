import { getThumbnailUrl } from "@/lib/cloudinary"
import { Package } from "lucide-react"

interface CollectionThumbnailGridProps {
  images: string[]
  title: string
}

export function CollectionThumbnailGrid({ images, title }: CollectionThumbnailGridProps) {
  // Filter out any empty/null images
  const validImages = images.filter(Boolean).slice(0, 5)

  // If no images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <Package className="h-12 w-12 text-muted-foreground/40" />
      </div>
    )
  }

  // Single image - full size
  if (validImages.length === 1) {
    return (
      <img
        src={getThumbnailUrl(validImages[0]) || "/placeholder.svg"}
        alt={title}
        className="h-full w-full object-cover"
      />
    )
  }

  // Two images - side by side
  if (validImages.length === 2) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-2">
        {validImages.map((img, i) => (
          <img
            key={i}
            src={getThumbnailUrl(img) || "/placeholder.svg"}
            alt={`${title} ${i + 1}`}
            className="h-full w-full object-cover"
          />
        ))}
      </div>
    )
  }

  // Three images - 1 large left, 2 small stacked right
  if (validImages.length === 3) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-2">
        <img
          src={getThumbnailUrl(validImages[0]) || "/placeholder.svg"}
          alt={`${title} 1`}
          className="h-full w-full object-cover"
        />
        <div className="grid grid-rows-2 gap-2">
          <img
            src={getThumbnailUrl(validImages[1]) || "/placeholder.svg"}
            alt={`${title} 2`}
            className="h-full w-full object-cover"
          />
          <img
            src={getThumbnailUrl(validImages[2]) || "/placeholder.svg"}
            alt={`${title} 3`}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    )
  }

  // Four images - 2x2 grid
  if (validImages.length === 4) {
    return (
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
        {validImages.map((img, i) => (
          <img
            key={i}
            src={getThumbnailUrl(img) || "/placeholder.svg"}
            alt={`${title} ${i + 1}`}
            className="h-full w-full object-cover"
          />
        ))}
      </div>
    )
  }

  // Five images - 2 large left, 3 small stacked right
  return (
    <div className="grid h-full w-full grid-cols-3 gap-2">
      <div className="col-span-2 grid grid-rows-2 gap-2">
        <img
          src={getThumbnailUrl(validImages[0]) || "/placeholder.svg"}
          alt={`${title} 1`}
          className="h-full w-full object-cover"
        />
        <img
          src={getThumbnailUrl(validImages[1]) || "/placeholder.svg"}
          alt={`${title} 2`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid grid-rows-3 gap-2">
        <img
          src={getThumbnailUrl(validImages[2]) || "/placeholder.svg"}
          alt={`${title} 3`}
          className="h-full w-full object-cover"
        />
        <img
          src={getThumbnailUrl(validImages[3]) || "/placeholder.svg"}
          alt={`${title} 4`}
          className="h-full w-full object-cover"
        />
        <img
          src={getThumbnailUrl(validImages[4]) || "/placeholder.svg"}
          alt={`${title} 5`}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
