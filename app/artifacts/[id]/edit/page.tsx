import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { getArtifactById } from "@/lib/actions/artifacts"
import { EditArtifactForm } from "@/components/edit-artifact-form"

export default async function EditArtifactPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const artifact = await getArtifactById(id)

  if (!artifact) {
    notFound()
  }

  // Only the owner can edit
  if (artifact.user_id !== user.id) {
    notFound()
  }

  return (
    <AppLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/artifacts/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Artifact
            </Link>
          </Button>

          <h1 className="text-3xl font-bold tracking-tight">Edit Artifact</h1>
          <p className="mt-1 text-muted-foreground">Update the details and photos of your heirloom</p>
        </div>

        <EditArtifactForm artifact={artifact} userId={user.id} />
      </div>
    </AppLayout>
  )
}
