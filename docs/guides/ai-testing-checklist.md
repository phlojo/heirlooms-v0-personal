# AI Analysis Feature Testing Checklist

This document outlines test cases and expected behaviors for the AI-powered artifact analysis features.

---

## Test Cases

### 1. Audio Only → Transcript Generated

**Setup:**
- Artifact has `media_urls` containing at least one audio file (`.mp3`, `.wav`, `.m4a`, etc.)
- No images in `media_urls`

**Steps:**
1. Click "Transcribe Audio" button
2. Wait for processing to complete

**Expected Behavior:**
- Status badge changes: `idle` → `processing` → `done`
- Transcript section appears with collapsible content
- Toast notification: "Audio transcribed successfully"
- `analysis_status` = `'done'`
- `transcript` field populated with text
- `analysis_error` = `null`

**UI Elements:**
- ✅ Collapsible transcript section visible
- ✅ "Generate Description" button becomes enabled
- ✅ Status badge shows green "done"

---

### 2. Images Only → Captions Generated

**Setup:**
- Artifact has `media_urls` containing 1-5 image files (`.jpg`, `.png`, `.gif`, `.webp`)
- No audio files in `media_urls`

**Steps:**
1. Click "Caption Photos" button
2. Wait for processing to complete

**Expected Behavior:**
- Status badge changes: `idle` → `processing` → `done`
- Image captions section appears with numbered list
- Toast notification: "Images captioned successfully"
- `analysis_status` = `'done'`
- `image_captions` field populated with JSON object mapping URLs to captions
- `analysis_error` = `null`

**UI Elements:**
- ✅ Numbered list of captions (max 5)
- ✅ Each caption is 7-20 words
- ✅ "Generate Description" button becomes enabled
- ✅ Status badge shows green "done"

---

### 3. Both Audio and Images → All Steps Run Successfully

**Setup:**
- Artifact has both audio and image files in `media_urls`

**Steps:**
1. Click "Run All" button
2. Wait for all steps to complete sequentially

**Expected Behavior:**
- Status badge changes: `idle` → `processing` → `done`
- All three sections appear:
  - Collapsible transcript
  - Numbered image captions list
  - AI-generated description (markdown)
- Toast notification: "All analysis completed successfully"
- `analysis_status` = `'done'`
- `transcript`, `image_captions`, and `ai_description` all populated
- `analysis_error` = `null`

**UI Elements:**
- ✅ All three content sections visible
- ✅ AI description rendered as markdown with highlights, people, places, etc.
- ✅ "Regenerate" button appears next to description
- ✅ Status badge shows green "done"

---

### 4. Missing audio_url → 400 Error

**Setup:**
- Artifact has no audio files in `media_urls`
- User attempts to transcribe audio

**Steps:**
1. Click "Transcribe Audio" button

**Expected Behavior:**
- Request returns immediately with 400 status
- Toast notification: "No audio file found in this artifact"
- `analysis_status` remains unchanged (likely `idle`)
- `analysis_error` = `null` (validation error, not processing error)

**UI Elements:**
- ✅ Error toast appears
- ✅ Status badge unchanged
- ✅ No transcript section appears

---

### 5. Broken Image URL → Captions Skip Gracefully

**Setup:**
- Artifact has `media_urls` with mix of valid and invalid/broken image URLs
- Invalid URLs may be: malformed, unreachable (404), or non-image content

**Steps:**
1. Click "Caption Photos" button
2. Wait for processing to complete

**Expected Behavior:**
- Status badge changes: `idle` → `processing` → `done`
- Valid images get captions
- Invalid images show: "Caption generation failed"
- Toast notification: "Images captioned successfully" (partial success)
- `analysis_status` = `'done'`
- `image_captions` contains entries for all attempted images
- `analysis_error` = `null`

**UI Elements:**
- ✅ Numbered list shows all images (up to 5)
- ✅ Failed images show error message instead of caption
- ✅ At least one valid caption exists
- ✅ Status badge shows green "done" (partial success is still success)

---

### 6. Summary Without Inputs → 400 Error

**Setup:**
- Artifact has neither `transcript` nor `image_captions` populated
- User attempts to generate description

**Steps:**
1. Click "Generate Description" button

**Expected Behavior:**
- Request returns immediately with 400 status
- Toast notification: "No transcript or image captions available. Please run audio or image analysis first."
- `analysis_status` remains unchanged
- `analysis_error` = `null` (validation error, not processing error)

**UI Elements:**
- ✅ Error toast appears with helpful message
- ✅ Status badge unchanged
- ✅ No description section appears
- ✅ User is guided to run prerequisite steps

---

## Status Badge Color Reference

| Status | Badge Variant | Color | Meaning |
|--------|--------------|-------|---------|
| `idle` | `secondary` | Gray | No analysis has been run |
| `queued` | `outline` | Gray outline | Queued for processing (future use) |
| `processing` | `default` | Blue | Currently analyzing |
| `done` | `default` (green) | Green | Analysis completed successfully |
| `error` | `destructive` | Red | Analysis failed with error |

---

## Success Messages Reference

| Action | Success Toast Message |
|--------|----------------------|
| Transcribe Audio | "Audio transcribed successfully" |
| Caption Photos | "Images captioned successfully" |
| Generate Description | "Description generated successfully" |
| Run All | "All analysis completed successfully" |
| Regenerate Description | "Description regenerated successfully" |

---

## Error Handling

### Processing Errors
When an error occurs during processing (API failure, timeout, etc.):
- `analysis_status` = `'error'`
- `analysis_error` = descriptive error message
- Error badge appears in red
- Error message displayed in UI
- Toast notification shows error

### Validation Errors
When validation fails before processing starts:
- `analysis_status` unchanged
- `analysis_error` remains `null`
- Toast notification shows validation error
- No database updates occur

---

## Retry Behavior

All analysis routes are **idempotent** and safe to re-run:
- Re-running will overwrite previous results
- No duplicate data is created
- Status resets to `processing` during re-run
- Previous errors are cleared on success

The "Run All" orchestrator includes automatic retry logic:
- Each step retries once on failure
- 500-1500ms random delay between retries
- 45-second timeout per step
- Fails fast if a step fails twice

---

## Notes for Developers

1. **Audio transcription** uses OpenAI Whisper (`whisper-1` model)
2. **Image captioning** uses GPT-4o vision model
3. **Description generation** uses GPT-4o-mini (or configured summary model)
4. **Transcript cleanup** is optional and uses GPT-4o-mini to improve readability
5. **Max transcript length** for processing: 10,000 characters (full transcript is saved)
6. **Max images processed**: 5 images per artifact
7. **Caption length**: 7-20 words per image

---

## Future Enhancements

- [ ] Batch processing for multiple artifacts
- [ ] Background job queue for long-running analysis
- [ ] Webhook notifications when analysis completes
- [ ] Language detection and multi-language support
- [ ] Custom prompt templates for descriptions
- [ ] Audio speaker diarization
- [ ] Video frame extraction and analysis
