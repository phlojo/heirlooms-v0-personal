import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createSupabaseBrowserClient> | null = null

/**
 * Creates a singleton Supabase client for browser/client-side use
 */
export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase environment variables are not set")
    throw new Error("Supabase configuration is missing. Please check your environment variables.")
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error("[v0] Invalid Supabase URL:", supabaseUrl)
    throw new Error("Invalid Supabase URL configuration")
  }

  client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)

  return client
}

export { createClient as createBrowserClient }
