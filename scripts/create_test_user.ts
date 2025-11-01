import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUser() {
  console.log("[v0] Creating test user account...")

  // First, try to delete the user if they already exist
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users.find((u) => u.email === "test@test.com")

  if (existingUser) {
    console.log("[v0] Test user already exists, deleting old account...")
    await supabase.auth.admin.deleteUser(existingUser.id)
  }

  // Create the test user
  const { data, error } = await supabase.auth.admin.createUser({
    email: "test@test.com",
    password: "test",
    email_confirm: true, // Auto-confirm email so they can log in immediately
    user_metadata: {
      name: "Test User",
    },
  })

  if (error) {
    console.error("[v0] Error creating test user:", error)
    throw error
  }

  console.log("[v0] ✅ Test user created successfully!")
  console.log("[v0] Email: test@test.com")
  console.log("[v0] Password: test")
  console.log("[v0] User ID:", data.user.id)

  return data.user
}

createTestUser()
  .then(() => {
    console.log("[v0] Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Failed:", error)
    process.exit(1)
  })
