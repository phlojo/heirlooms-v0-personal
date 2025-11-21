import { getDynamicLucideIcon } from "@/lib/utils/dynamic-icon"

/**
 * Artifact Type Icon Configuration
 *
 * This file provides a dynamic icon resolver that works with any Lucide icon.
 * Icons are now fully maintained in the Supabase database - no code changes needed.
 *
 * To add or change icons:
 * 1. Go to your Supabase dashboard
 * 2. Open the artifact_types table
 * 3. Update the icon_name column with any valid Lucide icon name
 * 4. Changes will reflect immediately in the app
 *
 * Valid icon names: https://lucide.dev/icons/
 * Examples: "Package", "Car", "Watch", "Wine", "Atom", "Dices", "Sparkles", "Heart", etc.
 */

/**
 * Get icon component for a given icon name from the database
 * Dynamically resolves any Lucide icon - no hardcoded mapping needed
 * Falls back to Package icon if icon name not found
 */
export function getArtifactTypeIcon(iconName: string) {
  return getDynamicLucideIcon(iconName)
}
