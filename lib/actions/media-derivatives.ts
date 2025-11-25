"use server"

import { createClient } from "@/lib/supabase/server"
import { generateDerivativesMap, type MediaDerivatives } from "@/lib/utils/media-derivatives"

// Re-export the type for convenience
export type { MediaDerivatives }

/**
 * Updates an artifact's media_derivatives field
 * This should be called after media is uploaded and stored
 */
export async function updateArtifactDerivatives(
  artifactId: string,
  mediaUrls: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Generate derivatives for all media URLs
    const derivativesMap = generateDerivativesMap(mediaUrls)

    // Update the artifact
    const { error } = await supabase
      .from("artifacts")
      .update({ media_derivatives: derivativesMap })
      .eq("id", artifactId)
      .eq("user_id", user.id) // Ensure user owns the artifact

    if (error) {
      console.error("[media-derivatives] Failed to update artifact derivatives:", error)
      return { success: false, error: "Failed to update media derivatives" }
    }

    console.log("[media-derivatives] Successfully updated derivatives for artifact:", artifactId, {
      mediaCount: mediaUrls.length,
      derivativeCount: Object.keys(derivativesMap).length,
    })

    return { success: true }
  } catch (error) {
    console.error("[media-derivatives] Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Gets derivative URL for a media item from the derivatives map
 * Falls back to null if not found
 *
 * Note: Not exported because it's in a "use server" file.
 * Use the utility functions in lib/cloudinary.ts instead.
 */
function getDerivativeUrl(
  mediaDerivatives: Record<string, MediaDerivatives> | null,
  originalUrl: string,
  size: "thumb" | "medium" | "large"
): string | null {
  if (!mediaDerivatives || !originalUrl) {
    return null
  }

  const derivatives = mediaDerivatives[originalUrl]
  if (!derivatives) {
    return null
  }

  return derivatives[size] || null
}
