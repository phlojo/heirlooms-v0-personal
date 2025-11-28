"use client"

import { useState, useEffect, useRef } from "react"
import { type ArtifactMediaWithDerivatives, type UserMediaWithDerivatives } from "@/lib/types/media"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Plus, Image as ImageIcon, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  createArtifactMediaLink,
  removeArtifactMediaLink,
  reorderArtifactMedia,
} from "@/lib/actions/media"
import { MediaPicker } from "@/components/media-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface ArtifactGalleryEditorProps {
  artifactId: string
  galleryMedia: ArtifactMediaWithDerivatives[]
  onUpdate: () => void
}

/**
 * Gallery management section for artifact editor
 * Allows adding, removing, and reordering gallery media with drag-and-drop
 */
export function ArtifactGalleryEditor({
  artifactId,
  galleryMedia,
  onUpdate,
}: ArtifactGalleryEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const packeryInstance = useRef<any>(null)
  const scrollInterval = useRef<number | null>(null)
  const isDragging = useRef<boolean>(false)

  // Get existing gallery media URLs to exclude from picker
  const existingUrls = galleryMedia.map((item) => item.media.public_url)

  // Initialize Packery once
  useEffect(() => {
    if (!gridRef.current || galleryMedia.length === 0) return

    // Skip if already initialized
    if (packeryInstance.current) {
      return
    }

    const initPackery = async () => {
      const Packery = (await import("packery")).default
      const Draggabilly = (await import("draggabilly")).default
      const imagesLoaded = (await import("imagesloaded")).default

      if (!gridRef.current) return

      // Wait for images to load before initializing Packery
      imagesLoaded(gridRef.current, () => {
        if (!gridRef.current || packeryInstance.current) return

        // Initialize Packery for horizontal layout
        const pckry = new Packery(gridRef.current, {
          itemSelector: ".gallery-grid-item",
          isHorizontal: true,
          gutter: 8,
        })

        packeryInstance.current = pckry

        // Layout after initialization
        pckry.layout()

        // Make items draggable
        const items = pckry.getItemElements()
        console.log('[Packery] Found items:', items.length)

        items.forEach((itemElem: HTMLElement) => {
          if (!itemElem) return

          const draggie = new Draggabilly(itemElem)
          pckry.bindDraggabillyEvents(draggie)
          console.log('[Packery] Made item draggable')

          // Track drag state
          draggie.on('dragStart', () => {
            isDragging.current = true
          })

          // Auto-scroll on drag near edges
          draggie.on('dragMove', (event: any, pointer: any) => {
            if (!gridRef.current || !pointer) return

            try {
              const container = gridRef.current
              if (!container) return

              const containerRect = container.getBoundingClientRect()
              if (!containerRect) return

              const scrollEdgeSize = 100 // pixels from edge to trigger scroll
              const scrollSpeed = 10

              // Clear existing scroll interval
              if (scrollInterval.current) {
                clearInterval(scrollInterval.current)
                scrollInterval.current = null
              }

              // Check if near left edge
              if (pointer.pageX - containerRect.left < scrollEdgeSize && container.scrollLeft > 0) {
                scrollInterval.current = window.setInterval(() => {
                  if (!gridRef.current) {
                    if (scrollInterval.current) clearInterval(scrollInterval.current)
                    return
                  }
                  if (container.scrollLeft > 0) {
                    container.scrollLeft -= scrollSpeed
                  } else if (scrollInterval.current) {
                    clearInterval(scrollInterval.current)
                    scrollInterval.current = null
                  }
                }, 20)
              }
              // Check if near right edge
              else if (containerRect.right - pointer.pageX < scrollEdgeSize) {
                scrollInterval.current = window.setInterval(() => {
                  if (!gridRef.current) {
                    if (scrollInterval.current) clearInterval(scrollInterval.current)
                    return
                  }
                  const maxScroll = container.scrollWidth - container.clientWidth
                  if (container.scrollLeft < maxScroll) {
                    container.scrollLeft += scrollSpeed
                  } else if (scrollInterval.current) {
                    clearInterval(scrollInterval.current)
                    scrollInterval.current = null
                  }
                }, 20)
              }
            } catch (error) {
              console.error('[Packery] Error in dragMove:', error)
              if (scrollInterval.current) {
                clearInterval(scrollInterval.current)
                scrollInterval.current = null
              }
            }
          })

          // Clear scroll interval on drag end
          draggie.on('dragEnd', () => {
            if (scrollInterval.current) {
              clearInterval(scrollInterval.current)
              scrollInterval.current = null
            }
          })
        })

        // Handle drag end to save new order
        pckry.on("dragItemPositioned", async () => {
        const itemElems = pckry.getItemElements()
        const newOrder = itemElems.map((elem, idx) => {
          const mediaId = elem.getAttribute("data-media-id")
          return {
            media_id: mediaId!,
            new_sort_order: idx,
          }
        })

        setIsReordering(true)
        try {
          const result = await reorderArtifactMedia({
            artifact_id: artifactId,
            role: "gallery",
            reorders: newOrder,
          })

          if (result.error) {
            toast.error(`Failed to reorder: ${result.error}`)
            isDragging.current = false
            return
          }

          toast.success("Reordered successfully")

          // Delay update to let Packery finish its animation
          setTimeout(() => {
            isDragging.current = false
            onUpdate()
          }, 100)
        } catch (error) {
          console.error("[GalleryEditor] Error reordering:", error)
          toast.error("Failed to reorder media")
          isDragging.current = false
        } finally {
          setIsReordering(false)
        }
        })
      })
    }

    initPackery()

    return () => {
      // Only destroy on unmount
      if (packeryInstance.current) {
        packeryInstance.current.destroy()
        packeryInstance.current = null
      }
    }
  }, []) // Empty deps - initialize once

  // Update layout when gallery changes
  useEffect(() => {
    if (!packeryInstance.current || galleryMedia.length === 0) return

    // Skip layout updates during drag
    if (isDragging.current) return

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      try {
        if (packeryInstance.current && gridRef.current && !isDragging.current) {
          packeryInstance.current.reloadItems()
          packeryInstance.current.layout()
        }
      } catch (error) {
        console.error('[Packery] Error updating layout:', error)
      }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [galleryMedia])

  const handleAddMedia = async (selectedMedia: UserMediaWithDerivatives[]) => {
    try {
      // Add each selected media to gallery
      for (const media of selectedMedia) {
        const result = await createArtifactMediaLink({
          artifact_id: artifactId,
          media_id: media.id,
          role: "gallery",
          sort_order: galleryMedia.length,
        })

        if (result.error) {
          toast.error(`Failed to add ${media.filename}: ${result.error}`)
          return
        }
      }

      toast.success(`Added ${selectedMedia.length} item${selectedMedia.length > 1 ? "s" : ""} to gallery`)
      setIsPickerOpen(false)
      onUpdate()
    } catch (error) {
      console.error("[GalleryEditor] Error adding media:", error)
      toast.error("Failed to add media to gallery")
    }
  }

  const handleRemove = async (linkId: string, filename: string) => {
    try {
      const result = await removeArtifactMediaLink(linkId)

      if (result.error) {
        toast.error(`Failed to remove ${filename}: ${result.error}`)
        return
      }

      toast.success(`Removed ${filename} from gallery`)
      onUpdate()
    } catch (error) {
      console.error("[GalleryEditor] Error removing media:", error)
      toast.error("Failed to remove media")
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Gallery</h3>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Auto-saved
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Media carousel displayed at the top of your artifact page. Drag to reorder, changes save automatically.
          </p>
        </div>
        <Button onClick={() => setIsPickerOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add to Gallery
        </Button>
      </div>

      {/* Gallery Grid */}
      {galleryMedia.length === 0 ? (
        <Card className="flex h-40 flex-col items-center justify-center gap-2 border-dashed rounded-sm">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No media in gallery</p>
          <Button onClick={() => setIsPickerOpen(true)} size="sm" variant="outline">
            Add Media
          </Button>
        </Card>
      ) : (
        <div ref={gridRef} className="gallery-grid h-[192px] relative">
          {galleryMedia.map((item, index) => {
            const media = item.media
            const isImage = media.media_type === "image"
            const isVideo = media.media_type === "video"

            return (
              <Card
                key={item.id}
                data-media-id={item.media_id}
                className="gallery-grid-item w-auto inline-flex items-center justify-center gap-1 p-3 rounded-sm cursor-grab active:cursor-grabbing"
              >
                {/* Drag Handle */}
                <div className="drag-handle flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Thumbnail */}
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted flex items-center justify-center">
                  {isImage && (
                    <img
                      src={media.thumbnailUrl || media.public_url}
                      alt={media.filename}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {isVideo && (
                    <div className="relative h-full w-full flex items-center justify-center">
                      {media.thumbnailUrl ? (
                        <img
                          src={media.thumbnailUrl}
                          alt={media.filename}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-black">
                          <ImageIcon className="h-6 w-6 text-white/50" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground capitalize">
                    {media.media_type}
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.id, media.filename)}
                  className="text-destructive hover:bg-destructive/10 flex-shrink-0 inline-flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            )
          })}
        </div>
      )}

      {/* Media Picker Dialog */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add to Gallery</DialogTitle>
            <DialogDescription>
              Select media from your library to add to this artifact's gallery
            </DialogDescription>
          </DialogHeader>
          <MediaPicker
            onSelect={handleAddMedia}
            multiSelect={true}
            excludeUrls={existingUrls}
          />
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{
        __html: `
          .gallery-grid {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            white-space: nowrap !important;
          }
          .gallery-grid-item {
            display: inline-block !important;
            vertical-align: top !important;
          }

          /* Hide scrollbar but keep scrolling */
          .gallery-grid::-webkit-scrollbar {
            display: none !important;
          }
          .gallery-grid {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `
      }} />
    </div>
  )
}
