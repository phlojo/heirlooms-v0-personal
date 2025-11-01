import { AppLayout } from "@/components/app-layout"
import { getCurrentUser } from "@/lib/supabase/server"
import { getAllPublicArtifacts } from "@/lib/actions/artifacts"
import { ArtifactCard } from "@/components/artifact-card"

export default async function ArtifactsPage() {
  const user = await getCurrentUser()
  const artifacts = await getAllPublicArtifacts()

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Artifacts</h1>
            <p className="mt-1 text-muted-foreground">Browse artifacts from public collections</p>
          </div>
        </div>

        {artifacts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} showAuthor={true} authorName={artifact.author_name} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">No public artifacts available yet.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
