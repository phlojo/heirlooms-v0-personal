import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  console.log("[v0] Auth callback triggered", { code: !!code, origin })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.log("[v0] Error exchanging code for session:", error)
      return NextResponse.redirect(`${origin}/login?error=${error.message}`)
    }

    console.log("[v0] Successfully exchanged code for session, redirecting to /collections")
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/collections`)
}
