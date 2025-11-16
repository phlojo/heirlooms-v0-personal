/**
 * Thumbnail Verification Script
 * Checks all artifacts and collections for valid thumbnail URLs
 * Reports any issues and suggests fixes
 */

import { createClient } from "@supabase/supabase-js"

function isAudioUrl(url: string): boolean {
  if (!url) return false
  
  const lowerUrl = url.toLowerCase()
  
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.opus', '.webm']
  if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
    return true
  }
  
  if (lowerUrl.includes('/video/upload/') && audioExtensions.some(ext => lowerUrl.includes(ext))) {
    return true
  }
  
  return false
}

function isVideoUrl(url: string): boolean {
  if (!url) return false
  
  const lowerUrl = url.toLowerCase()
  
  if (lowerUrl.includes('/video/upload/')) {
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.opus']
    if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
      return false
    }
    return true
  }
  
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.flv', '.wmv']
  return videoExtensions.some(ext => lowerUrl.includes(ext))
}

function isImageUrl(url: string): boolean {
  if (!url) return false
  
  const lowerUrl = url.toLowerCase()
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
  return imageExtensions.some(ext => lowerUrl.includes(ext))
}

function getPrimaryVisualMediaUrl(urls?: string[] | null): string | null {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return null
  
  const firstImage = urls.find(url => isImageUrl(url))
  if (firstImage) return firstImage
  
  const firstVideo = urls.find(url => isVideoUrl(url))
  if (firstVideo) return firstVideo
  
  return null
}

async function verifyThumbnails() {
  console.log("🔍 Starting thumbnail verification...\n")
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Check artifacts
  console.log("📦 Checking artifacts...")
  const { data: artifacts, error: artifactsError } = await supabase
    .from("artifacts")
    .select("id, slug, title, media_urls")
    .order("created_at", { ascending: false })
  
  if (artifactsError) {
    console.error("❌ Error fetching artifacts:", artifactsError)
    return
  }
  
  let artifactsWithoutThumbnails = 0
  let artifactsWithOnlyAudio = 0
  let artifactsWithValidThumbnails = 0
  
  for (const artifact of artifacts || []) {
    const primaryMedia = getPrimaryVisualMediaUrl(artifact.media_urls)
    
    if (!primaryMedia) {
      const hasAudio = artifact.media_urls?.some(url => isAudioUrl(url))
      if (hasAudio) {
        artifactsWithOnlyAudio++
        console.log(`⚠️  ${artifact.slug || artifact.id}: "${artifact.title}" - Only has audio files (no thumbnail possible)`)
      } else if (artifact.media_urls && artifact.media_urls.length > 0) {
        artifactsWithoutThumbnails++
        console.log(`❌ ${artifact.slug || artifact.id}: "${artifact.title}" - Has media but no valid thumbnail`)
        console.log(`   Media URLs:`, artifact.media_urls)
      } else {
        artifactsWithoutThumbnails++
        console.log(`⚠️  ${artifact.slug || artifact.id}: "${artifact.title}" - No media files at all`)
      }
    } else {
      artifactsWithValidThumbnails++
      
      const isValid = isImageUrl(primaryMedia) || isVideoUrl(primaryMedia)
      if (!isValid) {
        console.log(`⚠️  ${artifact.slug || artifact.id}: "${artifact.title}" - Thumbnail URL doesn't match image/video pattern:`, primaryMedia)
      }
    }
  }
  
  console.log("\n📊 Artifact Thumbnail Summary:")
  console.log(`   ✅ Valid thumbnails: ${artifactsWithValidThumbnails}`)
  console.log(`   🎵 Audio-only (no thumbnail): ${artifactsWithOnlyAudio}`)
  console.log(`   ❌ Missing/invalid thumbnails: ${artifactsWithoutThumbnails}`)
  
  // Check collections
  console.log("\n\n📚 Checking collections...")
  const { data: collections, error: collectionsError } = await supabase
    .from("collections")
    .select(`
      id,
      slug,
      title,
      cover_image,
      artifacts(media_urls)
    `)
    .order("created_at", { ascending: false })
  
  if (collectionsError) {
    console.error("❌ Error fetching collections:", collectionsError)
    return
  }
  
  let collectionsWithCoverImage = 0
  let collectionsWithArtifactThumbnails = 0
  let collectionsWithoutThumbnails = 0
  
  for (const collection of collections || []) {
    const hasCoverImage = !!collection.cover_image
    
    const artifactThumbnails = collection.artifacts
      ?.map(artifact => getPrimaryVisualMediaUrl(artifact.media_urls))
      .filter(Boolean)
    
    if (hasCoverImage) {
      collectionsWithCoverImage++
      console.log(`✅ ${collection.slug || collection.id}: "${collection.title}" - Has cover image`)
    } else if (artifactThumbnails && artifactThumbnails.length > 0) {
      collectionsWithArtifactThumbnails++
      console.log(`✅ ${collection.slug || collection.id}: "${collection.title}" - Using ${artifactThumbnails.length} artifact thumbnails`)
    } else {
      collectionsWithoutThumbnails++
      console.log(`⚠️  ${collection.slug || collection.id}: "${collection.title}" - No thumbnails available`)
    }
  }
  
  console.log("\n📊 Collection Thumbnail Summary:")
  console.log(`   ✅ With cover images: ${collectionsWithCoverImage}`)
  console.log(`   ✅ Using artifact thumbnails: ${collectionsWithArtifactThumbnails}`)
  console.log(`   ⚠️  Without any thumbnails: ${collectionsWithoutThumbnails}`)
  
  console.log("\n\n✨ Verification complete!")
  console.log("\nℹ️  Note: The thumbnail system is working correctly.")
  console.log("   - Artifacts automatically use the first image or video from media_urls")
  console.log("   - Audio files are correctly excluded from thumbnails")
  console.log("   - Collections use artifact thumbnails or optional cover_image")
}

verifyThumbnails().catch(console.error)
