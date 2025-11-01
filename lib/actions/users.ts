"use server"

import { createClient } from "@supabase/supabase-js"

export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    if (!userId) {
      console.error("[v0] getUserEmail: No userId provided")
      return null
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[v0] getUserEmail: Missing Supabase environment variables")
      return null
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Query the auth.users table using the admin API
    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
      console.error("[v0] Error fetching user:", error.message)
      return null
    }

    if (!data.user) {
      console.error("[v0] No user found for userId:", userId)
      return null
    }

    return data.user.email || null
  } catch (error) {
    console.error("[v0] Error in getUserEmail:", error)
    return null
  }
}
