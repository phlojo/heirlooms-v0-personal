import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { getCollection } from "@/lib/actions/collections"
import { getArtifactsByCollection } from "@/lib/actions/artifacts"
import { ArtifactCard } from "@/components/artifact-card"
import { DeleteCollectionButton } from "@/components/delete-collection-button"

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()

  const { id } = await params

  if (id === "new") {
    redirect("/collections/new")
  }

  const collection = await getCollection(id)

  if (!collection) {
    notFound()
  }

  const canView = collection.is_public || (user && collection.user_id === user.id)
  const canEdit = user && collection.user_id === user.id

  if (!canView) {
    notFound()
  }

  const artifacts = await getArtifactsByCollection(id)

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Link>
          </Button>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{collection.title}</h1>

            {collection.description && <p className="text-muted-foreground">{collection.description}</p>}

            {canEdit && (
              <div className="flex items-center gap-3">
                <Button asChild>
                  <Link href={`/artifacts/new?collectionId=${id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Artifact
                  </Link>
                </Button>
                <DeleteCollectionButton collectionId={id} collectionTitle={collection.title} />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artifacts.length > 0 ? (
            artifacts.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} />)
          ) : (
            <div className="col-span-full rounded-lg border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">No artifacts in this collection yet.</p>
              {canEdit && (
                <p className="mt-2 text-xs text-muted-foreground">Click "Add Artifact" above to add your first item.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
