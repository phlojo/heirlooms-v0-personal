import { AppLayout } from "@/components/app-layout"
import { getCurrentUser } from "@/lib/supabase/server"
import { HomeCard } from "@/components/home-card"

export default async function HomePage() {
  const user = await getCurrentUser()

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
          />
          <HomeCard
            title="Artifacts"
            description="Document and preserve individual items with rich media"
            href="/artifacts"
          />
          <HomeCard title="Stories" description="Connect artifacts to the stories that make them meaningful" />
        </div>
      </div>
    </AppLayout>
  )
}
