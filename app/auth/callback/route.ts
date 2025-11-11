import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get("next") || "/collections"

  console.log("[v0] Auth callback received", { code: !!code, next })

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Error exchanging code for session:", error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    console.log("[v0] Successfully exchanged code for session", {
      hasSession: !!data.session,
      hasUser: !!data.user,
    })

    const redirectResponse = NextResponse.redirect(`${origin}${next}`)

    return redirectResponse
  }

  console.log("[v0] No code in callback, redirecting to login")
  return NextResponse.redirect(`${origin}/login?error=No+authorization+code+provided`)
}
