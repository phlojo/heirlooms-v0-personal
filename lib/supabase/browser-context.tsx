"use client"

import { createContext, useContext, type ReactNode } from "react"
import { createClient } from "./client"
import type { SupabaseClient } from "@supabase/supabase-js"

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within SupabaseProvider")
  }
  return context
}
