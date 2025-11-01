import Link from "next/link"
import { Plus } from "lucide-react"

interface HomeCardProps {
  title: string
  description: string
  href?: string
}

export function HomeCard({ title, description, href }: HomeCardProps) {
  const content = (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div className="col-span-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground bg-primary">
          <Plus className="h-8 w-8" />
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block rounded-lg border bg-card p-6 transition-colors hover:bg-accent py-4">
        {content}
      </Link>
    )
  }

  return <div className="rounded-lg border bg-card p-6">{content}</div>
}
