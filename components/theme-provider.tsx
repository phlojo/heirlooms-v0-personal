"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase/browser-context"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase() // Moved hook call to top level
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load theme preference from database
    const loadTheme = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("theme_preference").eq("id", user.id).single()

        const theme = profile?.theme_preference || "light"
        document.documentElement.classList.toggle("dark", theme === "dark")
      }
    }

    loadTheme()
  }, [])

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
