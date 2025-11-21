import { type LucideIcon, Package } from "lucide-react"
import * as LucideIcons from "lucide-react"

/**
 * Dynamic Icon Resolver
 *
 * Dynamically loads any Lucide icon by name from the database.
 * This allows artifact types to be fully managed in Supabase without code changes.
 *
 * Usage:
 * - Store the exact Lucide icon name in the database (e.g., "Package", "Car", "Sparkles")
 * - The icon will be automatically resolved at runtime
 * - Falls back to Package icon if the icon name is invalid or not found
 *
 * Example:
 * - Database: icon_name = "Sparkles"
 * - This function returns the Sparkles icon component from lucide-react
 */
export function getDynamicLucideIcon(iconName: string): LucideIcon {
  // Handle empty or invalid icon names
  if (!iconName || typeof iconName !== "string") {
    console.warn("[v0] Invalid icon name provided:", iconName, "- falling back to Package")
    return Package
  }

  // Try to get the icon from the lucide-react exports
  const IconComponent = (LucideIcons as Record<string, LucideIcon>)[iconName]

  if (!IconComponent) {
    console.warn(`[v0] Icon "${iconName}" not found in lucide-react - falling back to Package`)
    return Package
  }

  // Verify it's actually a valid Lucide icon component
  if (typeof IconComponent !== "function" && typeof IconComponent !== "object") {
    console.warn(`[v0] Icon "${iconName}" is not a valid Lucide icon component - falling back to Package`)
    return Package
  }

  return IconComponent as LucideIcon
}
