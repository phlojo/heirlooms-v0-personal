import { AppLayout } from "@/components/app-layout"
import { NewCollectionForm } from "@/components/new-collection-form"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"

export default async function NewCollectionPage() {
  console.log("[v0] NewCollectionPage rendering")

  const user = await getCurrentUser()
  console.log("[v0] NewCollectionPage user:", user?.email || "no user")

  if (!user) {
    console.log("[v0] NewCollectionPage redirecting to login")
    redirect("/login")
  }

  return (
    <AppLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Collection</h1>
          <p className="mt-1 text-muted-foreground">Start a new collection to organize your heirlooms</p>
        </div>

        <NewCollectionForm />
      </div>
    </AppLayout>
  )
}
