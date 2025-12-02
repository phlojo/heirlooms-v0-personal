"use client"

import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArtifactCard } from "@/components/artifact-card"
import { CollectionCard } from "@/components/collection-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Plus,
  Package,
  ImageIcon,
  FolderOpen,
  BookOpen,
  Upload,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface DashboardArtifact {
  id: string
  slug: string
  title: string
  description?: string | null
  media_urls?: string[]
  media_derivatives?: Record<string, any> | null
  thumbnail_url?: string | null
  user_id?: string
  artifact_type?: {
    id: string
    name: string
    icon_name: string
  } | null
}

interface DashboardCollection {
  id: string
  slug?: string
  title: string
  description?: string | null
  cover_image?: string | null
  user_id: string
  is_public?: boolean
  itemCount: number
  thumbnailImages?: string[]
  isUnsorted?: boolean
}

interface LoggedInHomepageProps {
  user: SupabaseUser
  profile: {
    display_name?: string | null
    created_at?: string | null
  } | null
  recentArtifacts: DashboardArtifact[]
  collections: DashboardCollection[]
  stats: {
    artifactsCount: number
    collectionsCount: number
  }
}

export function LoggedInHomepage({
  user,
  profile,
  recentArtifacts,
  collections,
  stats,
}: LoggedInHomepageProps) {
  const displayName = profile?.display_name || user.email?.split("@")[0] || "there"
  const firstName = displayName.split(" ")[0]

  return (
    <AppLayout user={user}>
      <div className="space-y-8 pb-20">
        {/* Welcome Header */}
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-sm rounded-sm">
              <svg
                width="24"
                height="26"
                viewBox="0 0 80 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path d="M39.6001 90L52.1001 82.7L39.6001 75.5L27.1001 82.7L39.6001 90Z" fill="currentColor" />
                <path d="M2.0001 68.3L14.6001 75.5L27.1001 68.3L14.6001 61L2.0001 68.3Z" fill="currentColor" />
                <path d="M77.2002 68.3L64.6002 61L52.1002 68.3L64.6002 75.5L77.2002 68.3Z" fill="currentColor" />
                <path d="M39.6001 61L52.1001 53.8L39.6001 46.6L27.1001 53.8L39.6001 61Z" fill="currentColor" />
                <path d="M39.6001 75.5L52.1001 68.3L39.6001 61L27.1001 68.3L39.6001 75.5Z" fill="currentColor" />
                <path d="M37.6001 43.3L37.6001 28.9L25.1001 36.1L25.1001 50.5L37.6001 43.3Z" fill="currentColor" />
                <path d="M12.6001 43.3L0.0001 50.5L0 65L12.6001 57.8L12.6001 43.3Z" fill="currentColor" />
                <path d="M37.6001 0L25.1001 7.2L25.1001 21.6L37.6001 14.4L37.6001 0Z" fill="currentColor" />
                <path d="M0 21.6L0 36.1L12.6001 28.9L12.6001 14.4L0 21.6Z" fill="currentColor" />
                <path d="M25.1001 21.6L12.6001 28.9L12.6001 43.3L25.1001 36.1L25.1001 21.6Z" fill="currentColor" />
                <path d="M41.6001 43.3L54.1001 50.5L54.1001 36.1L41.6001 28.9L41.6001 43.3Z" fill="currentColor" />
                <path d="M79.2002 65L79.2002 50.5L66.6002 43.3L66.6002 57.8L79.2002 65Z" fill="currentColor" />
                <path d="M54.1001 7.2L41.6001 0L41.6001 14.4L54.1001 21.6L54.1001 7.2Z" fill="currentColor" />
                <path d="M79.2002 21.6L66.6002 14.4L66.6002 28.9L79.2002 36.1L79.2002 21.6Z" fill="currentColor" />
                <path d="M66.6001 43.3L66.6001 28.9L54.1001 21.6L54.1001 36.1L66.6001 43.3Z" fill="currentColor" />
              </svg>
            </div>
            Welcome back, {firstName}
            <div className="ml-auto lg:hidden">
              <ThemeToggle />
            </div>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening in your Heirlooms.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/artifacts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.artifactsCount}</p>
                  <p className="text-sm text-muted-foreground">Artifacts</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/collections">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.collectionsCount}</p>
                  <p className="text-sm text-muted-foreground">Collections</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Continue Where You Left Off - Recent Artifacts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Continue Where You Left Off</h2>
            {recentArtifacts.length > 0 && (
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/artifacts">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {recentArtifacts.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {recentArtifacts.map((artifact) => (
                  <div key={artifact.id} className="w-[160px] shrink-0">
                    <ArtifactCard artifact={artifact} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="p-8">
                <Empty className="border-0">
                  <EmptyMedia variant="icon">
                    <ImageIcon className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No artifacts yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first artifact to start preserving your memories.
                  </EmptyDescription>
                  <Button asChild className="gap-2 mt-2">
                    <Link href="/artifacts/new">
                      <Plus className="h-4 w-4" />
                      Create Artifact
                    </Link>
                  </Button>
                </Empty>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Your Collections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Collections</h2>
            {collections.length > 0 && (
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/collections">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {collections.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.slice(0, 6).map((collection) => (
                <CollectionCard key={collection.id} collection={collection} mode="mine" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <Empty className="border-0">
                  <EmptyMedia variant="icon">
                    <FolderOpen className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No collections yet</EmptyTitle>
                  <EmptyDescription>
                    Organize your artifacts into themed collections.
                  </EmptyDescription>
                  <Button asChild className="gap-2 mt-2">
                    <Link href="/collections/new">
                      <Plus className="h-4 w-4" />
                      Create Collection
                    </Link>
                  </Button>
                </Empty>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Start Something New */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Start Something New</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Create Artifact */}
            <Link href="/artifacts/new">
              <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Artifact</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add a new item to preserve</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Create Collection */}
            <Link href="/collections/new">
              <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <FolderOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Collection</h3>
                    <p className="text-sm text-muted-foreground mt-1">Organize artifacts together</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Browse Artifacts */}
            <Link href="/artifacts">
              <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Explore Community</h3>
                    <p className="text-sm text-muted-foreground mt-1">Discover shared artifacts</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Stories */}
            <Link href="/stories">
              <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Write a Story</h3>
                    <p className="text-sm text-muted-foreground mt-1">Share the memories behind items</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
