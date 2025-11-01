import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import Link from "next/link"

export function EmptyCollections() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">No collections yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Start preserving your family heirlooms by creating your first collection.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/collections/new">Create Collection</Link>
      </Button>
    </div>
  )
}
