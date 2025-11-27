# Media Cleanup Scripts

Utilities for cleaning up orphaned media files from storage backends.

## Overview

The app uses a hybrid storage architecture:
- **Supabase Storage**: Stores original media files
- **Cloudinary**:
  - **Legacy uploads** (Phase 1): Direct uploads stored in Cloudinary
  - **Fetch cache** (Phase 2): On-demand derivatives fetched from Supabase Storage

When artifacts are deleted, media should be automatically cleaned up from both backends. However, if cleanup fails or you have orphaned media from before the fix was implemented, these scripts help you recover storage space.

## Quick Start

**First time running cleanup? Follow this workflow:**

1. **Check a sample URL** (optional but recommended):
   ```bash
   pnpm tsx scripts/check-url.ts "https://res.cloudinary.com/your/url/here.jpg"
   ```

2. **Preview what will be deleted** (dry run):
   ```bash
   pnpm tsx scripts/cleanup-cloudinary.ts
   ```

3. **Test with limited deletions**:
   ```bash
   pnpm tsx scripts/cleanup-cloudinary.ts --delete --limit=10
   ```

4. **Verify test deletions worked**, then run full cleanup:
   ```bash
   pnpm tsx scripts/cleanup-cloudinary.ts --delete
   ```

5. **Clean Supabase Storage** (same workflow):
   ```bash
   pnpm tsx scripts/cleanup-supabase-storage.ts
   pnpm tsx scripts/cleanup-supabase-storage.ts --delete --limit=10
   pnpm tsx scripts/cleanup-supabase-storage.ts --delete
   ```

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

Finds and deletes orphaned Cloudinary media (both direct uploads AND fetch cache).

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
- Fetches **all** Cloudinary resources:
  - **Upload-type**: Direct uploads from Phase 1 (legacy Cloudinary uploads)
  - **Fetch-type**: Cached derivatives from Phase 2 (Cloudinary fetching from Supabase)
- Compares against all `media_urls` and `thumbnail_url` in artifacts table using **exact URL matching**
- Identifies orphaned media in both categories
- Shows breakdown by type and total storage savings
- Deletes with proper `type` parameter for each resource
- Optionally deletes orphaned media (with 5-second confirmation)

**Important:** This script handles Cloudinary's fetch cache, which can accumulate when:
- Artifacts are deleted but fetch cache remains
- Supabase Storage files are deleted but Cloudinary still has cached versions
- Media reorganization leaves behind old fetch URLs

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

### Dry Run (Preview)
```
🧹 Cloudinary Media Cleanup Script
=====================================

Mode: 👀 DRY RUN (preview only)

📊 Fetching all artifact media URLs from Supabase...
✅ Found 45 Cloudinary URLs in 23 artifacts
☁️  Fetching all media from Cloudinary...
  📷 Uploaded images: 380
  🔗 Fetch-cached images: 52
  🎥 Uploaded videos: 8
  🔗 Fetch-cached videos: 2
✅ Total Cloudinary resources: 442

📋 Analysis:
  - Cloudinary resources: 442
  - Used in artifacts: 45

🗑️  Found 397 orphaned resources (845.32 MB):

  📷 Images: 386
  🎥 Videos: 11

📄 Sample of orphaned resources (first 10):
  1. [image] heirlooms/abc123/photo1.jpg (5.24 MB)
  2. [image] f:https://project.supabase.co/.../img.jpg (3.82 MB)
  ...

💡 To actually delete these resources, run:
   pnpm tsx scripts/cleanup-cloudinary.ts --delete
```

### Real Cleanup Results

Example from actual cleanup session (2025-01-26):

**First cleanup (upload-type resources):**
```
✅ Cleanup complete!
  Deleted: 372
  Errors: 0
  Freed: 701.45 MB
```

**Second cleanup (fetch-type resources):**
```
✅ Cleanup complete!
  Deleted: 54
  Errors: 0
  Freed: 143.87 MB
```

**Total savings:** ~845 MB of orphaned media cleaned from Cloudinary

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

## Troubleshooting

### "Something is deleting but still showing in Cloudinary"
- **Likely cause**: Fetch-type resources being deleted with wrong `type` parameter
- **Fix**: The script now automatically detects and uses the correct type (upload vs fetch)
- **Verify**: Run dry run again to check if resources are still showing as orphaned

### "check-url.ts reports image is used in all artifacts"
- **Likely cause**: Empty string matching bug (fixed in current version)
- **Fix**: Script now uses exact URL matching, not substring matching
- **Test**: Run `pnpm tsx scripts/check-url.ts "your-url"` to verify

### "Counts seem wrong"
- **First**: Run `check-artifact-count.ts` to verify actual artifact count in database
- **Check**: Compare Cloudinary resource count against artifact media URL count
- **Remember**: One artifact can have multiple media URLs
- **Note**: Fetch cache can significantly inflate Cloudinary resource count

## Tips

1. **Always run dry run first** - Review what will be deleted
2. **Spot-check URLs** - Use `check-url.ts` to verify a few sample URLs before deleting
3. **Test with --limit first** - Run `--delete --limit=10` before full cleanup
4. **Run during low-traffic times** - Avoid race conditions with active uploads
5. **Check the counts** - If numbers seem wrong, investigate before deleting
6. **Save the output** - Redirect to a file for records: `pnpm tsx scripts/cleanup-cloudinary.ts > cleanup-report.txt`
7. **Run after major cleanups** - If you deleted many artifacts, these scripts help recover storage
8. **Monitor fetch cache growth** - Fetch cache can accumulate faster than uploads

## Technical Notes

- Uses Supabase service role key to bypass RLS
- Cloudinary script handles both images and videos
- Supabase script recursively walks all folders
- Both scripts process files in batches to avoid API limits
- Deletion operations use `invalidate: true` (Cloudinary) to clear CDN cache

### Key Improvements (2025-01-26)

**1. Fetch-type resource support:**
- Script now fetches BOTH upload-type and fetch-type resources from Cloudinary
- Properly passes `type` parameter to delete API (critical for fetch cache deletion)
- Without this fix, fetch-cached resources would appear to delete but remain in Cloudinary

**2. Exact URL matching:**
- Changed from substring/identifier matching to exact URL matching for safety
- Previous regex-based matching had a bug where failed regex resulted in empty string matching everything
- Exact matching ensures only truly orphaned media is deleted

**3. Alphabetically sorted signatures:**
- Cloudinary API requires parameters to be alphabetically sorted before signing
- Signature generation now properly sorts params to avoid "Invalid Signature" errors

**4. REST API implementation:**
- Uses Cloudinary REST API directly instead of requiring SDK
- Reduces dependencies and gives more control over request formatting
- Uses HTTP Basic Auth for Admin API, SHA-1 signed requests for Destroy API
