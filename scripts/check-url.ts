import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkUrl(urlToCheck: string) {
  console.log("Checking URL:", urlToCheck)
  console.log("Searching for exact URL match...\n")

  // Search for this URL in artifacts
  const { data: artifacts, error } = await supabase
    .from("artifacts")
    .select("id, title, media_urls, thumbnail_url")

  if (error) {
    console.error("Error:", error)
    process.exit(1)
  }

  let foundInArtifacts: Array<{ id: string; title: string; field: string }> = []

  for (const artifact of artifacts || []) {
    // Check if exact URL is in any media_urls
    if (artifact.media_urls && artifact.media_urls.some((url: string) => url === urlToCheck)) {
      foundInArtifacts.push({ id: artifact.id, title: artifact.title, field: "media_urls" })
    }

    // Check if exact URL is thumbnail_url
    if (artifact.thumbnail_url === urlToCheck) {
      foundInArtifacts.push({ id: artifact.id, title: artifact.title, field: "thumbnail_url" })
    }
  }

  console.log(`\nSearched ${artifacts?.length || 0} artifacts\n`)

  if (foundInArtifacts.length > 0) {
    console.log("✅ FOUND in artifacts:")
    foundInArtifacts.forEach(a => {
      console.log(`  - "${a.title}" (${a.id}) in ${a.field}`)
    })
    console.log("\n🛡️  This image is SAFE - it will NOT be deleted")
  } else {
    console.log("⚠️  NOT FOUND in any artifact")
    console.log("🗑️  This image WOULD BE DELETED by the cleanup script")
  }
}

const urlFromArgs = process.argv[2]
if (!urlFromArgs) {
  console.error("Usage: pnpm tsx scripts/check-url.ts <url>")
  process.exit(1)
}

checkUrl(urlFromArgs)
