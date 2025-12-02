import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fixtures } from "@/__tests__/fixtures"
import { reorganizeArtifactMedia } from "@/lib/actions/media-reorganize"
import * as supabaseModule from "@/lib/supabase/server"
import * as supabaseStorageModule from "@/lib/actions/supabase-storage"
import * as mediaModule from "@/lib/media"

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// Mock supabase-storage module
vi.mock("@/lib/actions/supabase-storage", () => ({
  moveSupabaseFile: vi.fn(),
}))

// Mock media module
vi.mock("@/lib/media", () => ({
  isSupabaseStorageUrl: vi.fn(),
}))

describe("Media Reorganize Server Actions", () => {
  let mockSupabase: any
  const mockMoveSupabaseFile = supabaseStorageModule.moveSupabaseFile as any
  const mockIsSupabaseStorageUrl = mediaModule.isSupabaseStorageUrl as any

  // Sample URLs
  const tempUrl1 =
    "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/temp/1704067200-photo.jpg"
  const tempUrl2 =
    "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/temp/1704067200-video.mp4"
  const movedUrl1 =
    "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-photo.jpg"
  const movedUrl2 =
    "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-video.mp4"
  const cloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/v1234/test.jpg"

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: fixtures.users.validUser.id,
              email: fixtures.users.validUser.email,
            },
          },
          error: null,
        }),
      },
      from: vi.fn(),
    }

    vi.spyOn(supabaseModule, "createClient").mockResolvedValue(mockSupabase)

    // Default: URLs are identified as Supabase Storage URLs
    mockIsSupabaseStorageUrl.mockImplementation((url: string) => url.includes("supabase"))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("reorganizeArtifactMedia", () => {
    describe("authentication", () => {
      it("should return error when user is not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("artifact validation", () => {
      it("should return error when artifact is not found", async () => {
        mockSupabase.from.mockImplementation(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Not found" },
              }),
            }),
          }),
        }))

        const result = await reorganizeArtifactMedia("nonexistent-id")

        expect(result.error).toBe("Artifact not found")
      })

      it("should return error when user does not own the artifact", async () => {
        const anotherUsersArtifact = {
          ...fixtures.artifacts.imageArtifact,
          user_id: fixtures.users.anotherUser.id,
          media_urls: [tempUrl1],
        }

        mockSupabase.from.mockImplementation(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: anotherUsersArtifact,
                error: null,
              }),
            }),
          }),
        }))

        const result = await reorganizeArtifactMedia(anotherUsersArtifact.id)

        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("no media", () => {
      it("should return success with 0 moved count when artifact has no media", async () => {
        const artifactWithNoMedia = {
          ...fixtures.artifacts.imageArtifact,
          media_urls: [],
        }

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithNoMedia,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(0)
        expect(mockMoveSupabaseFile).not.toHaveBeenCalled()
      })

      it("should return success when media_urls is null", async () => {
        const artifactWithNullMedia = {
          ...fixtures.artifacts.imageArtifact,
          media_urls: null,
        }

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithNullMedia,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(0)
      })
    })

    describe("Cloudinary URLs (no reorganization)", () => {
      it("should skip Cloudinary URLs and not try to move them", async () => {
        mockIsSupabaseStorageUrl.mockReturnValue(false)

        const artifactWithCloudinary = {
          ...fixtures.artifacts.imageArtifact,
          media_urls: [cloudinaryUrl],
          image_captions: {},
          video_summaries: {},
          audio_transcripts: {},
        }

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithCloudinary,
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(0)
        expect(mockMoveSupabaseFile).not.toHaveBeenCalled()
      })
    })

    describe("successful reorganization", () => {
      it("should move Supabase Storage files from temp to artifact folder", async () => {
        const artifactWithTempMedia = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [tempUrl1],
          thumbnail_url: tempUrl1,
          image_captions: { [tempUrl1]: "Caption for photo" },
          video_summaries: {},
          audio_transcripts: {},
        }

        mockMoveSupabaseFile.mockResolvedValue({
          publicUrl: movedUrl1,
          error: null,
        })

        let updateCalled = false
        let updateData: any = null

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithTempMedia,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((data) => {
                updateCalled = true
                updateData = data
                return {
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "user_media") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(1)
        expect(mockMoveSupabaseFile).toHaveBeenCalledWith(
          tempUrl1,
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )
        expect(updateCalled).toBe(true)
        expect(updateData.media_urls).toEqual([movedUrl1])
        expect(updateData.thumbnail_url).toBe(movedUrl1)
        expect(updateData.image_captions).toEqual({ [movedUrl1]: "Caption for photo" })
      })

      it("should move multiple files and update all references", async () => {
        const artifactWithMultipleMedia = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [tempUrl1, tempUrl2],
          thumbnail_url: tempUrl1,
          image_captions: { [tempUrl1]: "Photo caption" },
          video_summaries: { [tempUrl2]: "Video summary" },
          audio_transcripts: {},
        }

        mockMoveSupabaseFile
          .mockResolvedValueOnce({ publicUrl: movedUrl1, error: null })
          .mockResolvedValueOnce({ publicUrl: movedUrl2, error: null })

        let updateData: any = null

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithMultipleMedia,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((data) => {
                updateData = data
                return {
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "user_media") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(2)
        expect(updateData.media_urls).toEqual([movedUrl1, movedUrl2])
        expect(updateData.image_captions).toEqual({ [movedUrl1]: "Photo caption" })
        expect(updateData.video_summaries).toEqual({ [movedUrl2]: "Video summary" })
      })

      it("should handle mixed Supabase and Cloudinary URLs", async () => {
        mockIsSupabaseStorageUrl.mockImplementation((url: string) => url.includes("supabase"))

        const artifactWithMixedMedia = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [tempUrl1, cloudinaryUrl],
          thumbnail_url: tempUrl1,
          image_captions: { [tempUrl1]: "Supabase photo", [cloudinaryUrl]: "Cloudinary photo" },
          video_summaries: {},
          audio_transcripts: {},
        }

        mockMoveSupabaseFile.mockResolvedValue({ publicUrl: movedUrl1, error: null })

        let updateData: any = null

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithMixedMedia,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((data) => {
                updateData = data
                return {
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "user_media") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(1)
        // Cloudinary URL should be preserved as-is
        expect(updateData.media_urls).toEqual([movedUrl1, cloudinaryUrl])
        // Caption keys should be updated for moved URL, preserved for Cloudinary
        expect(updateData.image_captions).toEqual({
          [movedUrl1]: "Supabase photo",
          [cloudinaryUrl]: "Cloudinary photo",
        })
      })
    })

    describe("error handling", () => {
      it("should continue with other files when one move fails", async () => {
        const artifactWithMultipleMedia = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [tempUrl1, tempUrl2],
          thumbnail_url: null,
          image_captions: {},
          video_summaries: {},
          audio_transcripts: {},
        }

        // First move fails, second succeeds
        mockMoveSupabaseFile
          .mockResolvedValueOnce({ publicUrl: null, error: "Storage error" })
          .mockResolvedValueOnce({ publicUrl: movedUrl2, error: null })

        let updateData: any = null

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithMultipleMedia,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((data) => {
                updateData = data
                return {
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "user_media") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(1)
        expect(result.errors).toBeDefined()
        expect(result.errors).toHaveLength(1)
        expect(result.errors?.[0]).toContain("Failed to move")
        // First URL kept as-is (failed), second URL is moved
        expect(updateData.media_urls).toEqual([tempUrl1, movedUrl2])
      })

      it("should return error when artifact update fails", async () => {
        const artifactWithTempMedia = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [tempUrl1],
          thumbnail_url: null,
          image_captions: {},
          video_summaries: {},
          audio_transcripts: {},
        }

        mockMoveSupabaseFile.mockResolvedValue({ publicUrl: movedUrl1, error: null })

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithTempMedia,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  error: { message: "Database update failed" },
                }),
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.error).toBe("Failed to update artifact with new URLs")
        expect(result.details).toBe("Database update failed")
      })

      it("should continue when user_media update fails (non-fatal)", async () => {
        const artifactWithTempMedia = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [tempUrl1],
          thumbnail_url: null,
          image_captions: {},
          video_summaries: {},
          audio_transcripts: {},
        }

        mockMoveSupabaseFile.mockResolvedValue({ publicUrl: movedUrl1, error: null })

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithTempMedia,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "user_media") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    error: { message: "user_media update failed" },
                  }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        // Should still succeed - user_media update failure is non-fatal
        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(1)
      })
    })

    describe("file already in correct location", () => {
      it("should not count as moved when file is already in artifact folder", async () => {
        const artifactWithOrganizedMedia = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [movedUrl1], // Already in artifact folder
          thumbnail_url: null,
          image_captions: {},
          video_summaries: {},
          audio_transcripts: {},
        }

        // moveSupabaseFile returns the same URL (file already in place)
        mockMoveSupabaseFile.mockResolvedValue({ publicUrl: movedUrl1, error: null })

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithOrganizedMedia,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(result.movedCount).toBe(0) // File was already in place
      })
    })

    describe("AI metadata preservation", () => {
      it("should update audio_transcripts keys when files are moved", async () => {
        const audioUrl =
          "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/temp/1704067200-audio.mp3"
        const movedAudioUrl =
          "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-audio.mp3"

        const artifactWithAudio = {
          id: fixtures.artifacts.imageArtifact.id,
          user_id: fixtures.users.validUser.id,
          media_urls: [audioUrl],
          thumbnail_url: null,
          image_captions: {},
          video_summaries: {},
          audio_transcripts: { [audioUrl]: "Transcript of the audio recording" },
        }

        mockMoveSupabaseFile.mockResolvedValue({ publicUrl: movedAudioUrl, error: null })

        let updateData: any = null

        mockSupabase.from.mockImplementation((table: string) => {
          if (table === "artifacts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: artifactWithAudio,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((data) => {
                updateData = data
                return {
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }
              }),
            }
          }
          if (table === "artifact_media") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "user_media") {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            }
          }
          return {}
        })

        const result = await reorganizeArtifactMedia(fixtures.artifacts.imageArtifact.id)

        expect(result.success).toBe(true)
        expect(updateData.audio_transcripts).toEqual({
          [movedAudioUrl]: "Transcript of the audio recording",
        })
      })
    })
  })
})
