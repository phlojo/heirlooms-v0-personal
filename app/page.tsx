export const dynamic = "force-dynamic"

import { getCurrentUser, createClient } from "@/lib/supabase/server"
import { LoggedOutHomepage } from "@/components/homepage/logged-out-homepage"
import { LoggedInHomepage } from "@/components/homepage/logged-in-homepage"
import { getMyArtifactsPaginated } from "@/lib/actions/artifacts"
import { getMyCollectionsPaginated } from "@/lib/actions/collections"
import { getPrimaryVisualMediaUrl } from "@/lib/media"

async function getPublicShowcaseData() {
  const supabase = await createClient()

  // Fetch sample public artifacts for showcase
  const { data: artifacts } = await supabase
    .from("artifacts")
    .select(`
      id,
      slug,
      title,
      description,
      media_urls,
      media_derivatives,
      thumbnail_url,
      user_id,
      artifact_type:artifact_types(id, name, icon_name)
    `)
    .not("media_urls", "is", null)
    .limit(6)

  // Fetch sample public collections for showcase
  const { data: collections } = await supabase
    .from("collections")
    .select("id, slug, title, description, cover_image, user_id, is_public")
    .eq("is_public", true)
    .limit(4)

  // Get background images for hero
  const allImages =
    artifacts
      ?.map((artifact) => {
        const mediaUrls = artifact.media_urls as string[] | null
        return getPrimaryVisualMediaUrl(mediaUrls)
      })
      .filter((url): url is string => url !== null) || []

  const shuffled = allImages.sort(() => Math.random() - 0.5)
  const backgroundImages = shuffled.slice(0, 3)

  // Transform artifacts and collections to match card prop interfaces
  const showcaseArtifacts = artifacts?.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description,
    media_urls: a.media_urls as string[] | undefined,
    media_derivatives: a.media_derivatives as Record<string, any> | null,
    thumbnail_url: a.thumbnail_url,
    user_id: a.user_id,
    artifact_type: a.artifact_type?.[0] || null,
  })) || []

  const showcaseCollections = await Promise.all(
    (collections || []).map(async (c) => {
      // Get artifact count and thumbnails for each collection
      const { count } = await supabase
        .from("artifacts")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", c.id)

      const { data: collectionArtifacts } = await supabase
        .from("artifacts")
        .select("media_urls, thumbnail_url")
        .eq("collection_id", c.id)
        .order("created_at", { ascending: false })
        .limit(4)

      const thumbnailImages = collectionArtifacts
        ?.map((a) => a.thumbnail_url || getPrimaryVisualMediaUrl(a.media_urls as string[] | null))
        .filter((url): url is string => url !== null) || []

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        cover_image: c.cover_image,
        user_id: c.user_id,
        is_public: c.is_public,
        itemCount: count || 0,
        thumbnailImages,
      }
    })
  )

  return { backgroundImages, showcaseArtifacts, showcaseCollections }
}

async function getUserDashboardData(userId: string) {
  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("id", userId)
    .single()

  // Fetch recent artifacts (sorted by last edited)
  const { artifacts: recentArtifacts } = await getMyArtifactsPaginated(userId, {
    limit: 6,
    sortBy: "last-edited",
  })

  // Fetch user collections
  const { collections } = await getMyCollectionsPaginated(userId, 6)

  // Get stats
  const [artifactsCount, collectionsCount] = await Promise.all([
    supabase.from("artifacts").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("collections").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ])

  return {
    profile,
    recentArtifacts,
    collections,
    stats: {
      artifactsCount: artifactsCount.count || 0,
      collectionsCount: collectionsCount.count || 0,
    },
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    // Logged-in user: show dashboard
    const dashboardData = await getUserDashboardData(user.id)
    return (
      <LoggedInHomepage
        user={user}
        profile={dashboardData.profile}
        recentArtifacts={dashboardData.recentArtifacts}
        collections={dashboardData.collections}
        stats={dashboardData.stats}
      />
    )
  }

  // Logged-out user: show marketing page
  const showcaseData = await getPublicShowcaseData()
  return (
    <LoggedOutHomepage
      backgroundImages={showcaseData.backgroundImages}
      showcaseArtifacts={showcaseData.showcaseArtifacts}
      showcaseCollections={showcaseData.showcaseCollections}
    />
  )
}
