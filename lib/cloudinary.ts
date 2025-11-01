/**
 * Cloudinary image transformation utilities
 * Generates optimized image URLs for different use cases
 */

/**
 * Transforms a Cloudinary URL with specified parameters
 * @param url - Original Cloudinary URL
 * @param transformations - Cloudinary transformation string (e.g., "w_400,h_400,c_fill")
 * @returns Transformed URL or original if not a Cloudinary URL
 */
export function getCloudinaryUrl(url: string, transformations: string): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url
  }

  // Replace "heirloom/artifacts/images/heirloom/artifacts/images/" with single path
  const cleanedUrl = url.replace(
    /heirloom\/artifacts\/images\/heirloom\/artifacts\/images\//g,
    "heirloom/artifacts/images/",
  )

  // Split URL at /upload/ and insert transformations
  const parts = cleanedUrl.split("/upload/")
  if (parts.length !== 2) {
    return cleanedUrl
  }

  return `${parts[0]}/upload/${transformations}/${parts[1]}`
}

/**
 * Get thumbnail version of image (400x400, cropped to fill)
 * Perfect for: artifact cards, collection cards, grid views
 */
export function getThumbnailUrl(url: string): string {
  return getCloudinaryUrl(url, "w_400,h_400,c_fill,q_auto,f_auto")
}

/**
 * Get card-sized version of image (800x600, fit within bounds)
 * Perfect for: larger cards, list views
 */
export function getCardUrl(url: string): string {
  return getCloudinaryUrl(url, "w_800,h_600,c_fit,q_auto,f_auto")
}

/**
 * Get detail view version of image (1200x1200, limit max dimensions)
 * Perfect for: artifact detail pages, full-screen views
 */
export function getDetailUrl(url: string): string {
  return getCloudinaryUrl(url, "w_1200,h_1200,c_limit,q_auto,f_auto")
}

/**
 * Get full-resolution version (original, but with auto quality/format)
 * Perfect for: download, print, high-res viewing
 */
export function getFullResUrl(url: string): string {
  return getCloudinaryUrl(url, "q_auto,f_auto")
}
