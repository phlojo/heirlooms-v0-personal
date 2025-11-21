import { Package, Car, Watch, Wine, Dices, Atom as Toy, type LucideIcon } from "lucide-react"

/**
 * Artifact Type Icon Configuration
 *
 * Maps icon names from the database to Lucide icon components.
 * Used by both the type selector and animated icon components.
 */
export const artifactTypeIcons: Record<string, LucideIcon> = {
  Package: Package,
  Car: Car,
  Watch: Watch,
  Wine: Wine,
  Toy: Toy,
  Dices: Dices,
}

/**
 * Get icon component for a given icon name from the database
 * Falls back to Package icon if icon name not found
 */
export function getArtifactTypeIcon(iconName: string): LucideIcon {
  return artifactTypeIcons[iconName] || Package
}
