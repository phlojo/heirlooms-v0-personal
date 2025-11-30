/**
 * List all files in Supabase Storage temp folders
 * and check if they're referenced by any artifact
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const STORAGE_BUCKET = "heirlooms-media"

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function listTempFiles() {
  console.log("\n📂 Scanning Supabase Storage for temp folder files...\n")

  // Get all users who have temp folders by querying user_media for temp URLs
  const { data: tempMedia, error: mediaError } = await supabase
    .from("user_media")
    .select("user_id, public_url")
    .like("public_url", "%/temp/%")

  if (mediaError) {
    console.error("Failed to query user_media:", mediaError)
  }

  // Also check pending_uploads
  const { data: pendingUploads, error: pendingError } = await supabase
    .from("pending_uploads")
    .select("user_id, cloudinary_url")
    .like("cloudinary_url", "%/temp/%")

  if (pendingError) {
    console.error("Failed to query pending_uploads:", pendingError)
  }

  // Get unique user IDs that have temp content
  const userIds = new Set<string>()
  tempMedia?.forEach(m => userIds.add(m.user_id))
  pendingUploads?.forEach(p => userIds.add(p.user_id))

  console.log(`Found ${userIds.size} users with temp folder references in DB`)
  console.log(`  - user_media with temp URLs: ${tempMedia?.length || 0}`)
  console.log(`  - pending_uploads with temp URLs: ${pendingUploads?.length || 0}`)

  // Now list actual storage contents for each user
  const userFolders = Array.from(userIds)
  console.log(`\nScanning storage for ${userFolders.length} users...\n`)

  let totalTempFiles = 0
  const orphanedFiles: { path: string; userId: string; inPending: boolean }[] = []
  const referencedFiles: { path: string; userId: string }[] = []

  for (const userId of userFolders) {
    // List temp folder contents for this user
    const { data: tempFiles, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`${userId}/temp`, { limit: 1000 })

    if (listError) {
      console.log(`\n👤 User: ${userId}`)
      console.log(`   Error listing temp folder: ${listError.message}`)
      continue
    }

    if (!tempFiles || tempFiles.length === 0) {
      console.log(`\n👤 User: ${userId}`)
      console.log(`   Temp folder empty or doesn't exist`)
      continue
    }

    const actualFiles = tempFiles.filter(f => f.name && f.name.includes("."))
    if (actualFiles.length === 0) {
      console.log(`\n👤 User: ${userId}`)
      console.log(`   No files in temp folder (only subfolders)`)
      continue
    }

    console.log(`\n👤 User: ${userId}`)
    console.log(`   Temp files: ${actualFiles.length}`)

    for (const file of actualFiles) {
      const filePath = `${userId}/temp/${file.name}`
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`

      // Check if this URL is referenced anywhere
      const { data: inUserMedia } = await supabase
        .from("user_media")
        .select("id")
        .eq("public_url", publicUrl)
        .limit(1)

      const { data: inArtifacts } = await supabase
        .from("artifacts")
        .select("id")
        .contains("media_urls", [publicUrl])
        .limit(1)

      const { data: inThumbnails } = await supabase
        .from("artifacts")
        .select("id")
        .eq("thumbnail_url", publicUrl)
        .limit(1)

      const { data: inPending } = await supabase
        .from("pending_uploads")
        .select("id")
        .eq("cloudinary_url", publicUrl)
        .limit(1)

      const isReferenced =
        (inUserMedia && inUserMedia.length > 0) ||
        (inArtifacts && inArtifacts.length > 0) ||
        (inThumbnails && inThumbnails.length > 0)

      const isPending = inPending && inPending.length > 0

      if (!isReferenced) {
        orphanedFiles.push({ path: filePath, userId: userId, inPending: isPending })
        const pendingNote = isPending ? " (in pending_uploads)" : ""
        console.log(`   ❌ ORPHANED: ${file.name}${pendingNote}`)
      } else {
        referencedFiles.push({ path: filePath, userId: userId })
        console.log(`   ✓ Referenced: ${file.name}`)
      }

      totalTempFiles++
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`   Total temp files: ${totalTempFiles}`)
  console.log(`   Orphaned (not referenced by artifacts): ${orphanedFiles.length}`)
  console.log(`   Referenced (DB points to missing file): ${referencedFiles.length}`)

  if (orphanedFiles.length > 0) {
    console.log("\n🗑️  Orphaned files (can be safely deleted):")
    for (const f of orphanedFiles) {
      const note = f.inPending ? " [pending_uploads]" : ""
      console.log(`   ${f.path}${note}`)
    }
  }

  if (referencedFiles.length > 0) {
    console.log("\n⚠️  Referenced files still in temp (DB needs cleanup):")
    for (const f of referencedFiles) {
      console.log(`   ${f.path}`)
    }
  }
}

listTempFiles()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1) })
