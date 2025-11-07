import { type NextRequest, NextResponse } from "next/server"
import { getClosestCollection } from "@/lib/actions/collections"
import { getCurrentUser } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentCollectionId, currentCreatedAt, targetMode } = await request.json()

    const collection = await getClosestCollection(currentCollectionId, currentCreatedAt, user.id, targetMode)

    if (!collection) {
      return NextResponse.json({ error: "No collections found" }, { status: 404 })
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error("[v0] Error finding closest collection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
