import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkCounts() {
  // Get total artifact count
  const { count: totalCount, error: countError } = await supabase
    .from("artifacts")
    .select("*", { count: "exact", head: true })

  if (countError) {
    console.error("Error counting artifacts:", countError)
    return
  }

  console.log(`Total artifacts in database: ${totalCount}`)

  // Now search for the specific URL
  const urlToFind = "1764190737444-20131119_MSFT_SWEATER_A001_IMG_0908"

  const { data: artifacts, error } = await supabase
    .from("artifacts")
    .select("id, title, media_urls")

  if (error) {
    console.error("Error fetching artifacts:", error)
    return
  }

  const artifactsWithUrl = artifacts?.filter(a =>
    a.media_urls?.some((url: string) => url.includes(urlToFind))
  ) || []

  console.log(`\nArtifacts containing "${urlToFind}":`)
  console.log(`  Found: ${artifactsWithUrl.length}`)

  if (artifactsWithUrl.length > 0 && artifactsWithUrl.length <= 5) {
    console.log(`\n  Examples:`)
    artifactsWithUrl.forEach(a => {
      console.log(`    - "${a.title}" (${a.id})`)
    })
  }
}

checkCounts()
