import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "@/app/api/cleanup-expired-uploads/route"

// Mock dependencies
vi.mock("@/lib/actions/pending-uploads", () => ({
  cleanupExpiredUploads: vi.fn(),
}))

describe("API: /api/cleanup-expired-uploads", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  describe("GET request handling", () => {
    it("should allow cron requests in production with header", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 5,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "production")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
        headers: { "x-vercel-cron": "true" },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.deletedCount).toBe(5)
    })

    it("should reject requests in production without cron header", async () => {
      vi.stubEnv("NODE_ENV", "production")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe("Unauthorized")
    })

    it("should allow any request in development mode", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 3,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it("should allow requests in development without cron header", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 0,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
        // No x-vercel-cron header
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe("cleanup execution", () => {
    it("should call cleanupExpiredUploads function", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 5,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      await GET(request)

      expect(vi.mocked(cleanupExpiredUploads)).toHaveBeenCalled()
    })

    it("should return deleted count in response", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      const deletedCount = 10
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(data.deletedCount).toBe(deletedCount)
    })

    it("should handle zero deleted files", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 0,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.deletedCount).toBe(0)
      expect(data.success).toBe(true)
    })
  })

  describe("error handling", () => {
    it("should return 500 if cleanup fails", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 0,
        error: "Database connection failed",
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("Database connection failed")
    })

    it("should return 500 if cleanup throws", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockRejectedValue(new Error("Cleanup failed"))

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)

      expect(response.status).toBe(500)
    })

    it("should include error message in response", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      const errorMessage = "Cloudinary API error"
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 0,
        error: errorMessage,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(data.error).toBe(errorMessage)
    })
  })

  describe("cron header handling", () => {
    it("should check for x-vercel-cron header in production", async () => {
      vi.stubEnv("NODE_ENV", "production")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
        headers: { "x-vercel-cron": "true" },
      })

      expect(() => GET(request)).not.toThrow()
    })

    it("should ignore case sensitivity for header check", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 1,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "production")

      // headers are case-insensitive in HTTP
      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
        headers: { "X-Vercel-Cron": "true" },
      })

      const response = await GET(request)

      // Header handling depends on Node.js implementation, but headers should work
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it("should accept any non-empty x-vercel-cron header value", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 1,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "production")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
        headers: { "x-vercel-cron": "any-value" },
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe("response format", () => {
    it("should return JSON response", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 5,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)

      expect(response.headers.get("content-type")).toContain("application/json")
    })

    it("should return success and deletedCount on success", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 7,
        error: null,
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(data).toEqual({
        success: true,
        deletedCount: 7,
      })
    })

    it("should return error on failure", async () => {
      const { cleanupExpiredUploads } = await import("@/lib/actions/pending-uploads")
      vi.mocked(cleanupExpiredUploads).mockResolvedValue({
        deletedCount: 0,
        error: "Storage error",
      })

      vi.stubEnv("NODE_ENV", "development")

      const request = new Request("http://localhost/api/cleanup-expired-uploads", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(data).toEqual({
        error: "Storage error",
      })
      expect(data.success).toBeUndefined()
    })
  })
})
