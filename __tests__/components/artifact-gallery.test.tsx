"use client"

import type React from "react"

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { fixtures } from "../fixtures"

// Mock dependencies
vi.mock("@/lib/cloudinary", () => ({
  getDetailUrl: (url: string) => url,
}))

vi.mock("@/lib/supabase/browser-context", () => ({
  useSupabase: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null })),
        })),
      })),
    })),
  })),
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}))

// Mock child components to simplify testing
vi.mock("@/components/audio-player", () => ({
  AudioPlayer: ({ src, title }: { src: string; title: string }) => (
    <div data-testid="audio-player" data-src={src}>
      {title}
    </div>
  ),
}))

vi.mock("@/components/artifact-image-with-viewer", () => ({
  ArtifactImageWithViewer: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="artifact-image" src={src || "/placeholder.svg"} alt={alt} />
  ),
}))

vi.mock("@/components/artifact-swipe-wrapper", () => ({
  ArtifactSwipeWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/artifact-sticky-nav", () => ({
  ArtifactStickyNav: () => <div data-testid="sticky-nav">Sticky Nav</div>,
}))

vi.mock("@/components/add-media-modal", () => ({
  AddMediaModal: () => <div data-testid="add-media-modal">Add Media Modal</div>,
}))

vi.mock("@/components/artifact-type-selector", () => ({
  ArtifactTypeSelector: () => <div>Type Selector</div>,
}))

vi.mock("@/components/transcription-input", () => ({
  TranscriptionInput: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string
    onChange: (val: string) => void
    placeholder: string
  }) => (
    <input
      data-testid="transcription-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}))

// All AI generation buttons mocked
vi.mock("@/components/artifact/GenerateImageCaptionButton", () => ({
  GenerateImageCaptionButton: () => <button>Generate Caption</button>,
}))

vi.mock("@/components/artifact/GenerateVideoSummaryButton", () => ({
  GenerateVideoSummaryButton: () => <button>Generate Summary</button>,
}))

vi.mock("@/components/artifact/TranscribeAudioButtonPerMedia", () => ({
  TranscribeAudioButtonPerMedia: () => <button>Transcribe Audio</button>,
}))

// Import component after mocks
import { ArtifactDetailView } from "@/components/artifact-detail-view"

describe("ArtifactGallery (Media Rendering)", () => {
  const baseProps = {
    previous: null,
    next: null,
    currentPosition: 1,
    totalCount: 5,
    collectionHref: "/collections/test-collection",
    canEdit: false,
    isEditMode: false,
    previousUrl: null,
    nextUrl: null,
  }

  describe("Primary Thumbnail Display", () => {
    it("should render the first image as the primary thumbnail", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.jpg",
          "https://example.com/photo3.jpg",
        ],
        thumbnail_url: "https://example.com/photo1.jpg",
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const images = screen.getAllByTestId("artifact-image")
      expect(images).toHaveLength(3)
      // First image should be rendered first
      expect(images[0]).toHaveAttribute("src", "https://example.com/photo1.jpg")
    })

    it("should render the first video as primary when no images exist", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [
          "https://res.cloudinary.com/test/video/upload/v123/video1.mp4",
          "https://res.cloudinary.com/test/video/upload/v123/video2.mp4",
        ],
        thumbnail_url: "https://res.cloudinary.com/test/video/upload/v123/video1.mp4",
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const videos = screen.getAllByRole("application", { hidden: true })
      expect(videos).toHaveLength(2)
      // First video should be the primary
      expect(videos[0]).toHaveAttribute("src", "https://res.cloudinary.com/test/video/upload/v123/video1.mp4")
    })
  })

  describe("Media Type Rendering", () => {
    it("should render images with <img> tags", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: ["https://example.com/photo.jpg", "https://example.com/photo2.png"],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const images = screen.getAllByTestId("artifact-image")
      expect(images).toHaveLength(2)
      expect(images[0]).toHaveAttribute("src", "https://example.com/photo.jpg")
      expect(images[1]).toHaveAttribute("src", "https://example.com/photo2.png")
    })

    it("should render videos with <video> tags", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [
          "https://res.cloudinary.com/test/video/upload/v123/video1.mp4",
          "https://res.cloudinary.com/test/video/upload/v123/video2.mov",
        ],
        video_summaries: {},
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const videos = screen.getAllByRole("application", { hidden: true })
      expect(videos).toHaveLength(2)
      expect(videos[0]).toHaveAttribute("src", "https://res.cloudinary.com/test/video/upload/v123/video1.mp4")
      expect(videos[1]).toHaveAttribute("src", "https://res.cloudinary.com/test/video/upload/v123/video2.mov")
    })

    it("should render audio with AudioPlayer component", () => {
      const artifact = {
        ...fixtures.artifacts.audioArtifact,
        media_urls: ["https://example.com/audio1.mp3", "https://example.com/audio2.wav"],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const audioPlayers = screen.getAllByTestId("audio-player")
      expect(audioPlayers).toHaveLength(2)
      expect(audioPlayers[0]).toHaveAttribute("data-src", "https://example.com/audio1.mp3")
      expect(audioPlayers[1]).toHaveAttribute("data-src", "https://example.com/audio2.wav")
    })
  })

  describe("Media Order Preservation", () => {
    it("should render media in the exact order stored in artifact.media_urls", () => {
      const artifact = {
        ...fixtures.artifacts.multiMediaArtifact,
        media_urls: [
          "https://example.com/audio.mp3",
          "https://example.com/photo1.jpg",
          "https://res.cloudinary.com/test/video/upload/v123/video.mp4",
          "https://example.com/photo2.jpg",
          "https://example.com/audio2.wav",
        ],
        image_captions: {
          "https://example.com/photo1.jpg": "First photo",
          "https://example.com/photo2.jpg": "Second photo",
        },
        video_summaries: {
          "https://res.cloudinary.com/test/video/upload/v123/video.mp4": "Video summary",
        },
        audio_transcripts: {
          "https://example.com/audio.mp3": "First audio transcript",
          "https://example.com/audio2.wav": "Second audio transcript",
        },
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      // Get all media elements in order
      const allMedia = screen
        .getByRole("main", { hidden: true })
        .querySelectorAll('[data-testid="audio-player"], [data-testid="artifact-image"], video')

      // Verify order matches artifact.media_urls order
      expect(allMedia[0]).toHaveAttribute("data-testid", "audio-player")
      expect(allMedia[0]).toHaveAttribute("data-src", "https://example.com/audio.mp3")

      expect(allMedia[1]).toHaveAttribute("data-testid", "artifact-image")
      expect(allMedia[1]).toHaveAttribute("src", "https://example.com/photo1.jpg")

      expect(allMedia[2].tagName).toBe("VIDEO")
      expect(allMedia[2]).toHaveAttribute("src", "https://res.cloudinary.com/test/video/upload/v123/video.mp4")

      expect(allMedia[3]).toHaveAttribute("data-testid", "artifact-image")
      expect(allMedia[3]).toHaveAttribute("src", "https://example.com/photo2.jpg")

      expect(allMedia[4]).toHaveAttribute("data-testid", "audio-player")
      expect(allMedia[4]).toHaveAttribute("data-src", "https://example.com/audio2.wav")
    })

    it("should not sort or reorder media by type", () => {
      const artifact = {
        ...fixtures.artifacts.multiMediaArtifact,
        // Intentionally mixed order: video, audio, image
        media_urls: [
          "https://res.cloudinary.com/test/video/upload/v123/video.mp4",
          "https://example.com/audio.mp3",
          "https://example.com/photo.jpg",
        ],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const container = screen.getByRole("main", { hidden: true })
      const mediaElements = container.querySelectorAll(
        '[data-testid="audio-player"], [data-testid="artifact-image"], video',
      )

      // First should be video
      expect(mediaElements[0].tagName).toBe("VIDEO")
      // Second should be audio
      expect(mediaElements[1]).toHaveAttribute("data-testid", "audio-player")
      // Third should be image
      expect(mediaElements[2]).toHaveAttribute("data-testid", "artifact-image")
    })
  })

  describe("Mixed Media Artifacts", () => {
    it("should render all media types in one artifact", () => {
      const artifact = {
        ...fixtures.artifacts.multiMediaArtifact,
        media_urls: [
          "https://example.com/photo.jpg",
          "https://res.cloudinary.com/test/video/upload/v123/video.mp4",
          "https://example.com/audio.mp3",
        ],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      expect(screen.getByTestId("artifact-image")).toBeInTheDocument()
      expect(screen.getByRole("application", { hidden: true })).toBeInTheDocument()
      expect(screen.getByTestId("audio-player")).toBeInTheDocument()
    })

    it("should handle multiple items of the same type", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.jpg",
          "https://example.com/photo3.jpg",
          "https://example.com/photo4.jpg",
        ],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const images = screen.getAllByTestId("artifact-image")
      expect(images).toHaveLength(4)
    })
  })

  describe("Empty and Edge Cases", () => {
    it("should handle artifacts with no media", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      expect(screen.queryByTestId("artifact-image")).not.toBeInTheDocument()
      expect(screen.queryByTestId("audio-player")).not.toBeInTheDocument()
      expect(screen.queryByRole("application")).not.toBeInTheDocument()
    })

    it("should handle null media_urls gracefully", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: null,
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      expect(screen.queryByTestId("artifact-image")).not.toBeInTheDocument()
      expect(screen.queryByTestId("audio-player")).not.toBeInTheDocument()
    })

    it("should filter out duplicate URLs", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [
          "https://example.com/photo.jpg",
          "https://example.com/photo.jpg", // duplicate
          "https://example.com/photo2.jpg",
        ],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      const images = screen.getAllByTestId("artifact-image")
      // Should only render 2 unique images
      expect(images).toHaveLength(2)
    })
  })

  describe("Media Metadata Display", () => {
    it("should display image captions when available", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: ["https://example.com/photo.jpg"],
        image_captions: {
          "https://example.com/photo.jpg": "Family reunion 1985",
        },
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      expect(screen.getByText("Family reunion 1985")).toBeInTheDocument()
    })

    it("should display video summaries when available", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: ["https://res.cloudinary.com/test/video/upload/v123/video.mp4"],
        video_summaries: {
          "https://res.cloudinary.com/test/video/upload/v123/video.mp4": "Wedding ceremony highlights",
        },
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      expect(screen.getByText("Wedding ceremony highlights")).toBeInTheDocument()
    })

    it("should display audio transcripts when available", () => {
      const artifact = {
        ...fixtures.artifacts.audioArtifact,
        media_urls: ["https://example.com/interview.mp3"],
        audio_transcripts: {
          "https://example.com/interview.mp3": "My grandfather talks about his childhood...",
        },
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      expect(screen.getByText("My grandfather talks about his childhood...")).toBeInTheDocument()
    })

    it("should handle media without captions/summaries/transcripts", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: ["https://example.com/photo.jpg", "https://res.cloudinary.com/test/video/upload/v123/video.mp4"],
        image_captions: {},
        video_summaries: {},
        audio_transcripts: {},
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} />)

      // Media should still render without metadata
      expect(screen.getByTestId("artifact-image")).toBeInTheDocument()
      expect(screen.getByRole("application", { hidden: true })).toBeInTheDocument()
    })
  })

  describe("Media Numbering", () => {
    it("should number multiple audio files correctly", () => {
      const artifact = {
        ...fixtures.artifacts.audioArtifact,
        media_urls: ["https://example.com/audio1.mp3", "https://example.com/audio2.mp3"],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} canEdit={true} isEditMode={true} />)

      expect(screen.getByText("Audio 1")).toBeInTheDocument()
      expect(screen.getByText("Audio 2")).toBeInTheDocument()
    })

    it("should number multiple videos correctly in edit mode", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [
          "https://res.cloudinary.com/test/video/upload/v123/video1.mp4",
          "https://res.cloudinary.com/test/video/upload/v123/video2.mp4",
          "https://res.cloudinary.com/test/video/upload/v123/video3.mp4",
        ],
        video_summaries: {},
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} canEdit={true} isEditMode={true} />)

      expect(screen.getByText("Video 1")).toBeInTheDocument()
      expect(screen.getByText("Video 2")).toBeInTheDocument()
      expect(screen.getByText("Video 3")).toBeInTheDocument()
    })

    it("should number multiple photos correctly in edit mode", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.jpg",
          "https://example.com/photo3.jpg",
        ],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} canEdit={true} isEditMode={true} />)

      expect(screen.getByText("Photo 1")).toBeInTheDocument()
      expect(screen.getByText("Photo 2")).toBeInTheDocument()
      expect(screen.getByText("Photo 3")).toBeInTheDocument()
    })

    it("should not number single media items", () => {
      const artifact = {
        ...fixtures.artifacts.imageArtifact,
        media_urls: ["https://example.com/photo.jpg"],
      }

      render(<ArtifactDetailView {...baseProps} artifact={artifact} canEdit={true} isEditMode={true} />)

      expect(screen.getByText("Photo")).toBeInTheDocument()
      expect(screen.queryByText("Photo 1")).not.toBeInTheDocument()
    })
  })
})
