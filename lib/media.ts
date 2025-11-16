/**
 * Media URL utilities for detecting file types and normalizing media arrays.
 */

/**
 * Detects if a URL points to an audio file.
 * Checks for common audio extensions and Cloudinary audio upload paths.
 */
export function isAudioUrl(url: string): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check for audio extensions
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.opus', '.webm'];
  if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  // Check for Cloudinary audio uploads
  if (lowerUrl.includes('/video/upload/') && audioExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  return false;
}

/**
 * Detects if a URL points to a video file.
 * Checks for common video extensions and Cloudinary video upload paths.
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check for Cloudinary video uploads first
  if (lowerUrl.includes('/video/upload/')) {
    // Exclude audio files that might also be in /video/upload/
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.opus'];
    if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
      return false;
    }
    return true;
  }
  
  // Check for video extensions
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.flv', '.wmv'];
  return videoExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Detects if a URL points to an image file.
 * Checks for common image extensions.
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check for image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Returns the primary visual media URL from an array of media URLs.
 * Priority: first image > first video > null
 */
export function getPrimaryVisualMediaUrl(urls?: string[] | null): string | null {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return null;
  
  // Find first image
  const firstImage = urls.find(url => isImageUrl(url));
  if (firstImage) return firstImage;
  
  // Find first video
  const firstVideo = urls.find(url => isVideoUrl(url));
  if (firstVideo) return firstVideo;
  
  return null;
}

/**
 * Normalizes an array of media URLs by:
 * 1. Removing duplicates
 * 2. Filtering out null/undefined/empty strings
 * 3. Ordering as: images → videos → audio
 */
export function normalizeMediaUrls(urls: string[]): string[] {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return [];
  
  // Remove duplicates and filter out empty/null values
  const uniqueUrls = Array.from(
    new Set(urls.filter(url => url && typeof url === 'string' && url.trim() !== ''))
  );
  
  // Separate by type
  const images = uniqueUrls.filter(url => isImageUrl(url));
  const videos = uniqueUrls.filter(url => isVideoUrl(url));
  const audio = uniqueUrls.filter(url => isAudioUrl(url));
  
  // Return in visual-first order: images → videos → audio
  return [...images, ...videos, ...audio];
}
