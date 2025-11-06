import { AppLayout } from "@/components/app-layout"
import { getCurrentUser } from "@/lib/supabase/server"
import { HomeCard } from "@/components/home-card"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const user = await getCurrentUser()

  const supabase = await createClient()

  const { data: artifacts } = await supabase
    .from("artifacts")
    .select("media_urls")
    .not("media_urls", "is", null)
    .limit(20)

  // Extract first image URL from each artifact's media_urls array
  const allImages =
    artifacts
      ?.map((artifact) => {
        const mediaUrls = artifact.media_urls as string[] | null
        return mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : null
      })
      .filter((url): url is string => url !== null) || []

  const shuffled = allImages.sort(() => Math.random() - 0.5)
  const backgroundImages = shuffled.slice(0, 3)

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Heirlooms</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Preserve and share the objects and stories that matter to you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <HomeCard
            title="Collections"
            description="Organize your heirlooms into meaningful collections"
            href="/collections"
            backgroundImage={backgroundImages[0]}
          />
          <HomeCard
            title="Artifacts"
            description="Document and preserve individual items with rich media"
            href="/artifacts"
            backgroundImage={backgroundImages[1]}
          />
          <HomeCard
            title="Stories"
            description="Connect artifacts to the stories that make them meaningful"
            backgroundImage={backgroundImages[2]}
          />
        </div>
      </div>
    </AppLayout>
  )
}
