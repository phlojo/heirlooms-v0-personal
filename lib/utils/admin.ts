"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Check if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    return profile?.is_admin === true
  } catch (error) {
    console.error("[v0] Error checking admin status:", error)
    return false
  }
}

/**
 * Check if a specific user ID is an admin
 * @param userId - The user ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()

    return profile?.is_admin === true
  } catch (error) {
    console.error("[v0] Error checking admin status:", error)
    return false
  }
}
