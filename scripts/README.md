# Media Cleanup Scripts

Utilities for cleaning up orphaned media files from storage backends.

## Scripts

### 1. Check URL (`check-url.ts`)

**Quick spot-check** to verify if a specific media URL is still in use before running cleanup.

**Usage:**
```bash
pnpm tsx scripts/check-url.ts "https://res.cloudinary.com/your/url/here.jpg"
```

**What it does:**
- Searches all artifacts for the given URL
- Checks both `media_urls` and `thumbnail_url` fields
- Shows which artifact(s) are using the URL
- Tells you if it would be deleted by the cleanup script

**Example output:**
```
✅ FOUND in artifacts:
  - "Red glasses 2" (ed0e970b-...) in media_urls
  - "Red glasses 2" (ed0e970b-...) in thumbnail_url

🛡️  This image is SAFE - it will NOT be deleted
```

**Tip:** Use this to spot-check a few URLs from the cleanup preview before running with `--delete`.

---

### 2. Cloudinary Cleanup (`cleanup-cloudinary.ts`)

Finds and deletes Cloudinary media that isn't referenced in any artifact.

**Dry run (preview only):**
```bash
pnpm tsx scripts/cleanup-cloudinary.ts
```

**Test with limited deletions (recommended first time):**
```bash
pnpm tsx scripts/cleanup-cloudinary.ts --delete --limit=10
```

**Actually delete all orphaned media:**
```bash
pnpm tsx scripts/cleanup-cloudinary.ts --delete
```

**What it does:**
- Fetches all media from Cloudinary (images and videos)
- Compares against all `media_urls` and `thumbnail_url` in artifacts table
- Identifies orphaned media
- Shows total count and storage savings
- Optionally deletes orphaned media (with 5-second confirmation)

### 3. Supabase Storage Cleanup (`cleanup-supabase-storage.ts`)

Finds and deletes Supabase Storage media that isn't referenced in any artifact.

**Dry run (preview only):**
```bash
pnpm tsx scripts/cleanup-supabase-storage.ts
```

**Test with limited deletions (recommended first time):**
```bash
pnpm tsx scripts/cleanup-supabase-storage.ts --delete --limit=10
```

**Actually delete all orphaned files:**
```bash
pnpm tsx scripts/cleanup-supabase-storage.ts --delete
```

**What it does:**
- Recursively fetches all files from `heirlooms-media` bucket
- Compares against all `media_urls` and `thumbnail_url` in artifacts table
- Identifies orphaned files
- Groups results by folder
- Optionally deletes orphaned files in batches (with 5-second confirmation)

## Parameters

### `--delete`
Actually perform deletions (without this flag, runs in dry-run mode)

### `--limit=N`
Limit deletions to N files (useful for testing)

**Example:**
```bash
# Delete only the first 10 orphaned files
pnpm tsx scripts/cleanup-cloudinary.ts --delete --limit=10
```

## Safety Features

Both scripts include:

1. **Dry run by default** - Preview what will be deleted without actually deleting
2. **5-second confirmation** - Time to cancel before deletion starts
3. **Detailed logging** - See exactly what's being deleted
4. **Error handling** - Continues on errors and reports them at the end
5. **Storage savings** - Shows how much space will be freed

## Example Output

```
🧹 Cloudinary Media Cleanup Script
=====================================

Mode: 👀 DRY RUN (preview only)

📊 Fetching all artifact media URLs from Supabase...
✅ Found 45 Cloudinary URLs in 23 artifacts
☁️  Fetching all media from Cloudinary...
  📷 Found 60 images
  🎥 Found 8 videos
✅ Total Cloudinary resources: 68

📋 Analysis:
  - Cloudinary resources: 68
  - Used in artifacts: 45

🗑️  Found 23 orphaned resources (145.32 MB):

  📷 Images: 20
  🎥 Videos: 3

📄 Sample of orphaned resources (first 10):
  1. [image] heirlooms/abc123/photo1.jpg (5.24 MB)
  2. [image] heirlooms/abc123/photo2.jpg (4.82 MB)
  ...

💡 To actually delete these resources, run:
   pnpm tsx scripts/cleanup-cloudinary.ts --delete
```

## When to Use

### Use these scripts when:
- You've deleted artifacts and want to clean up leftover media
- You suspect orphaned media is taking up storage space
- You're migrating between storage backends
- You want to audit what media is actually in use

### Don't use if:
- You're not sure if the media is truly orphaned (always dry run first!)
- You haven't backed up your data
- The app is actively being used (could race with new uploads)

## Environment Variables Required

Both scripts need:
```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Cloudinary script also needs:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Tips

1. **Always run dry run first** - Review what will be deleted
2. **Spot-check URLs** - Use `check-url.ts` to verify a few sample URLs before deleting
3. **Run during low-traffic times** - Avoid race conditions with active uploads
4. **Check the counts** - If numbers seem wrong, investigate before deleting
5. **Save the output** - Redirect to a file for records: `pnpm tsx scripts/cleanup-cloudinary.ts > cleanup-report.txt`
6. **Run after major cleanups** - If you deleted many artifacts, these scripts help recover storage

## Technical Notes

- Uses Supabase service role key to bypass RLS
- Cloudinary script handles both images and videos
- Supabase script recursively walks all folders
- Both scripts process files in batches to avoid API limits
- Deletion operations use `invalidate: true` (Cloudinary) to clear CDN cache
