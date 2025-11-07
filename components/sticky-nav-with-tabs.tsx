"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface StickyNavWithTabsProps {
  title: string
  backHref: string
  backLabel: string
  previousItem?: {
    id: string
    title: string
  } | null
  nextItem?: {
    id: string
    title: string
  } | null
  editHref?: string
  canEdit?: boolean
  itemType?: "collection"
  userId: string | null
  collectionId: string
  currentCreatedAt: string
}

const STORAGE_KEY = "heirloom-collection-view-tab"

export function StickyNavWithTabs({
  title,
  backHref,
  backLabel,
  previousItem,
  nextItem,
  editHref,
  canEdit = false,
  itemType = "collection",
  userId,
  collectionId,
  currentCreatedAt,
}: StickyNavWithTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Load saved tab preference
  useEffect(() => {
    const savedTab = sessionStorage.getItem(STORAGE_KEY)
    if (savedTab && (savedTab === "all" || savedTab === "mine")) {
      setActiveTab(savedTab)
    }
  }, [])

  const handleTabChange = async (value: string) => {
    if (value === activeTab || !userId || isTransitioning) return

    setIsTransitioning(true)
    setActiveTab(value)
    sessionStorage.setItem(STORAGE_KEY, value)

    try {
      // Call server action to find closest collection
      const response = await fetch("/api/collections/closest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCollectionId: collectionId,
          currentCreatedAt,
          targetMode: value,
        }),
      })

      const data = await response.json()

      if (data.collection) {
        // Navigate to the closest collection with the new filter
        router.push(`/collections/${data.collection.slug}`)
      }
    } catch (error) {
      console.error("[v0] Error switching collection view:", error)
    } finally {
      setIsTransitioning(false)
    }
  }

  return (
    <div className="sticky top-16 z-30 -mx-6 bg-background px-6 pb-4 lg:-mx-8 lg:px-8">
      <div className="mb-4 flex items-center gap-2 mt-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        {userId && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="ml-2">
            <TabsList>
              <TabsTrigger value="all" disabled={isTransitioning}>
                Community
              </TabsTrigger>
              <TabsTrigger value="mine" disabled={isTransitioning}>
                My Collections
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Previous button, Title, Edit button */}
          <Button
            variant="outline"
            size="icon"
            asChild={!!previousItem}
            disabled={!previousItem || isTransitioning}
            className={`shrink-0 bg-transparent ${!previousItem ? "opacity-50 pointer-events-none" : ""}`}
          >
            {previousItem ? (
              <Link href={`/${itemType}s/${previousItem.id}`} title={previousItem.title}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : (
              <span>
                <ChevronLeft className="h-5 w-5" />
              </span>
            )}
          </Button>
          <h1 className="text-balance text-3xl font-bold tracking-tight min-w-0">{title}</h1>
          {canEdit && editHref && (
            <Button variant="outline" size="sm" asChild className="shrink-0 bg-transparent ml-2">
              <Link href={editHref}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          asChild={!!nextItem}
          disabled={!nextItem || isTransitioning}
          className={`shrink-0 bg-transparent ${!nextItem ? "opacity-50 pointer-events-none" : ""}`}
        >
          {nextItem ? (
            <Link href={`/${itemType}s/${nextItem.id}`} title={nextItem.title}>
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <span>
              <ChevronRight className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
