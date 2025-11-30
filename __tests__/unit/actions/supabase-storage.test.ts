import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fixtures } from "@/__tests__/fixtures"
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  getSupabasePublicUrl,
  extractSupabaseStoragePath,
  moveSupabaseFile,
} from "@/lib/actions/supabase-storage"
import * as supabaseModule from "@/lib/supabase/server"

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Supabase Storage Server Actions", () => {
  let mockSupabase: any
  let mockStorage: any

  // Sample URLs
  const tempUrl =
    "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/temp/1704067200-photo.jpg"
  const artifactUrl =
    "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-photo.jpg"

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock storage operations
    mockStorage = {
      upload: vi.fn().mockResolvedValue({ data: { path: "test/path/file.jpg" }, error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
      copy: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/bucket/path" },
      }),
      from: vi.fn().mockReturnThis(),
    }

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
      storage: {
        from: vi.fn().mockReturnValue(mockStorage),
      },
    }

    vi.spyOn(supabaseModule, "createClient").mockResolvedValue(mockSupabase)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("extractSupabaseStoragePath", () => {
    it("should extract path from valid Supabase public URL", async () => {
      const url =
        "https://project.supabase.co/storage/v1/object/public/heirlooms-media/user-id/artifact-id/file.jpg"
      const result = await extractSupabaseStoragePath(url)
      expect(result).toBe("user-id/artifact-id/file.jpg")
    })

    it("should extract path from URL with temp folder", async () => {
      const result = await extractSupabaseStoragePath(tempUrl)
      expect(result).toBe("11111111-1111-4111-a111-111111111111/temp/1704067200-photo.jpg")
    })

    it("should return null for invalid URL", async () => {
      const result = await extractSupabaseStoragePath("https://example.com/not-a-storage-url.jpg")
      expect(result).toBeNull()
    })

    it("should return null for non-Supabase URL", async () => {
      const result = await extractSupabaseStoragePath(
        "https://res.cloudinary.com/demo/image/upload/test.jpg"
      )
      expect(result).toBeNull()
    })
  })

  describe("getSupabasePublicUrl", () => {
    it("should return public URL for given file path", async () => {
      const expectedUrl = "https://project.supabase.co/storage/v1/object/public/bucket/test/path"
      mockStorage.getPublicUrl.mockReturnValue({ data: { publicUrl: expectedUrl } })

      const result = await getSupabasePublicUrl("test/path")

      expect(result).toBe(expectedUrl)
      expect(mockSupabase.storage.from).toHaveBeenCalledWith("heirlooms-media")
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith("test/path")
    })
  })

  describe("uploadToSupabaseStorage", () => {
    const mockFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" })

    describe("authentication", () => {
      it("should return error when user is not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await uploadToSupabaseStorage(mockFile, "user/temp")

        expect(result.error).toBe("Unauthorized")
        expect(result.publicUrl).toBeUndefined()
      })
    })

    describe("successful upload", () => {
      it("should upload file and return public URL", async () => {
        const expectedPath = "user/temp/1234567890-test_image.jpg"
        const expectedUrl =
          "https://project.supabase.co/storage/v1/object/public/heirlooms-media/" + expectedPath
        mockStorage.upload.mockResolvedValue({ data: { path: expectedPath }, error: null })
        mockStorage.getPublicUrl.mockReturnValue({ data: { publicUrl: expectedUrl } })

        const result = await uploadToSupabaseStorage(mockFile, "user/temp")

        expect(result.error).toBeUndefined()
        expect(result.publicUrl).toBe(expectedUrl)
        expect(mockSupabase.storage.from).toHaveBeenCalledWith("heirlooms-media")
      })

      it("should sanitize filename by replacing special characters", async () => {
        const specialFile = new File(["test"], "test file (1).jpg", { type: "image/jpeg" })
        mockStorage.upload.mockResolvedValue({
          data: { path: "folder/test_file__1_.jpg" },
          error: null,
        })

        await uploadToSupabaseStorage(specialFile, "folder")

        // Verify upload was called with sanitized filename
        const uploadCall = mockStorage.upload.mock.calls[0]
        expect(uploadCall[0]).toMatch(/folder\/\d+-test_file__1_.jpg/)
      })
    })

    describe("error handling", () => {
      it("should return user-friendly error for file too large", async () => {
        mockStorage.upload.mockResolvedValue({
          data: null,
          error: { message: "Payload too large" },
        })

        const largeFile = new File(["x".repeat(60 * 1024 * 1024)], "large.jpg", {
          type: "image/jpeg",
        })
        const result = await uploadToSupabaseStorage(largeFile, "folder")

        expect(result.error).toContain("exceeds the storage limit")
        expect(result.error).toContain("50MB")
      })

      it("should return user-friendly error for quota exceeded", async () => {
        mockStorage.upload.mockResolvedValue({
          data: null,
          error: { message: "Storage quota exceeded" },
        })

        const result = await uploadToSupabaseStorage(mockFile, "folder")

        expect(result.error).toBe("Storage quota exceeded. Please contact support.")
      })

      it("should return user-friendly error for permission denied", async () => {
        mockStorage.upload.mockResolvedValue({
          data: null,
          error: { message: "Permission denied" },
        })

        const result = await uploadToSupabaseStorage(mockFile, "folder")

        expect(result.error).toBe("You don't have permission to upload files.")
      })

      it("should include file details in generic errors", async () => {
        mockStorage.upload.mockResolvedValue({
          data: null,
          error: { message: "Unknown error" },
        })

        const result = await uploadToSupabaseStorage(mockFile, "folder")

        expect(result.error).toContain("test-image.jpg")
        expect(result.error).toContain("Unknown error")
      })

      it("should handle unexpected exceptions", async () => {
        mockStorage.upload.mockRejectedValue(new Error("Network error"))

        const result = await uploadToSupabaseStorage(mockFile, "folder")

        expect(result.error).toBe("Failed to upload file to storage")
      })
    })
  })

  describe("deleteFromSupabaseStorage", () => {
    describe("authentication", () => {
      it("should return error when user is not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await deleteFromSupabaseStorage(tempUrl)

        expect(result.success).toBe(false)
        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("validation", () => {
      it("should return error for invalid URL format", async () => {
        const result = await deleteFromSupabaseStorage("https://invalid-url.com/file.jpg")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Invalid storage URL")
      })
    })

    describe("successful deletion", () => {
      it("should delete file from storage", async () => {
        const result = await deleteFromSupabaseStorage(tempUrl)

        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()
        expect(mockStorage.remove).toHaveBeenCalledWith([
          "11111111-1111-4111-a111-111111111111/temp/1704067200-photo.jpg",
        ])
      })
    })

    describe("error handling", () => {
      it("should return error when delete fails", async () => {
        mockStorage.remove.mockResolvedValue({
          error: { message: "File not found" },
        })

        const result = await deleteFromSupabaseStorage(tempUrl)

        expect(result.success).toBe(false)
        expect(result.error).toBe("File not found")
      })

      it("should handle unexpected exceptions", async () => {
        mockStorage.remove.mockRejectedValue(new Error("Network error"))

        const result = await deleteFromSupabaseStorage(tempUrl)

        expect(result.success).toBe(false)
        expect(result.error).toBe("Failed to delete file from storage")
      })
    })
  })

  describe("moveSupabaseFile", () => {
    describe("authentication", () => {
      it("should return error when user is not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await moveSupabaseFile(
          tempUrl,
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )

        expect(result.error).toBe("Unauthorized")
      })

      it("should return error when user ID does not match authenticated user", async () => {
        const result = await moveSupabaseFile(
          tempUrl,
          fixtures.users.anotherUser.id, // Different from authenticated user
          fixtures.artifacts.imageArtifact.id
        )

        expect(result.error).toBe("Unauthorized")
      })
    })

    describe("validation", () => {
      it("should return error for invalid Supabase Storage URL", async () => {
        const result = await moveSupabaseFile(
          "https://invalid-url.com/file.jpg",
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )

        expect(result.error).toBe("Invalid Supabase Storage URL")
      })
    })

    describe("file already in correct location", () => {
      it("should return same URL when file is not in temp folder", async () => {
        const result = await moveSupabaseFile(
          artifactUrl, // Already in artifact folder, not temp
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )

        expect(result.publicUrl).toBe(artifactUrl)
        expect(result.error).toBeUndefined()
        expect(mockStorage.copy).not.toHaveBeenCalled()
      })
    })

    describe("successful move", () => {
      it("should copy file to new location and delete original", async () => {
        const newPublicUrl =
          "https://project.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-photo.jpg"
        mockStorage.getPublicUrl.mockReturnValue({ data: { publicUrl: newPublicUrl } })

        const result = await moveSupabaseFile(
          tempUrl,
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )

        expect(result.publicUrl).toBe(newPublicUrl)
        expect(result.error).toBeUndefined()

        // Verify copy was called with correct paths
        expect(mockStorage.copy).toHaveBeenCalledWith(
          "11111111-1111-4111-a111-111111111111/temp/1704067200-photo.jpg",
          `${fixtures.users.validUser.id}/${fixtures.artifacts.imageArtifact.id}/1704067200-photo.jpg`
        )

        // Verify original was deleted
        expect(mockStorage.remove).toHaveBeenCalledWith([
          "11111111-1111-4111-a111-111111111111/temp/1704067200-photo.jpg",
        ])
      })
    })

    describe("error handling", () => {
      it("should return error when copy fails", async () => {
        mockStorage.copy.mockResolvedValue({
          error: { message: "Copy failed" },
        })

        const result = await moveSupabaseFile(
          tempUrl,
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )

        expect(result.error).toBe("Copy failed")
        expect(result.publicUrl).toBeUndefined()
        // Should not attempt delete if copy failed
        expect(mockStorage.remove).not.toHaveBeenCalled()
      })

      it("should succeed even when delete of original fails (non-fatal)", async () => {
        mockStorage.remove.mockResolvedValue({
          error: { message: "Delete failed" },
        })

        const newPublicUrl = "https://example.supabase.co/storage/v1/object/public/bucket/new/path"
        mockStorage.getPublicUrl.mockReturnValue({ data: { publicUrl: newPublicUrl } })

        const result = await moveSupabaseFile(
          tempUrl,
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )

        // Should still succeed - copy worked
        expect(result.publicUrl).toBe(newPublicUrl)
        expect(result.error).toBeUndefined()
      })

      it("should handle unexpected exceptions", async () => {
        mockStorage.copy.mockRejectedValue(new Error("Network error"))

        const result = await moveSupabaseFile(
          tempUrl,
          fixtures.users.validUser.id,
          fixtures.artifacts.imageArtifact.id
        )

        expect(result.error).toBe("Failed to move file")
      })
    })
  })
})
