/**
 * Test fixtures - reusable test data for all test suites
 */

export const fixtures = {
  users: {
    validUser: {
      id: "11111111-1111-4111-a111-111111111111",
      email: "testuser@example.com",
      displayName: "Test User",
      theme: "light",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    anotherUser: {
      id: "22222222-2222-4222-a222-222222222222",
      email: "anotheruser@example.com",
      displayName: "Another User",
      theme: "dark",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
  },

  collections: {
    publicCollection: {
      id: "c1111111-1111-4111-a111-111111111111",
      title: "My Public Collection",
      description: "A publicly visible collection",
      user_id: "11111111-1111-4111-a111-111111111111",
      cover_image: null,
      is_public: true,
      slug: "my-public-collection-1704067200",
      primary_type_id: null,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
    privateCollection: {
      id: "c2222222-2222-4222-a222-222222222222",
      title: "My Private Collection",
      description: "A private collection",
      user_id: "11111111-1111-4111-a111-111111111111",
      cover_image: null,
      is_public: false,
      slug: "my-private-collection-1704067200",
      primary_type_id: null,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
    withPrimaryType: {
      id: "c3333333-3333-4333-a333-333333333333",
      title: "Car Collection",
      description: "Collection of cars",
      user_id: "11111111-1111-4111-a111-111111111111",
      cover_image: "https://example.com/car-cover.jpg",
      is_public: true,
      slug: "car-collection-1704067200",
      primary_type_id: "d1111111-1111-4111-a111-111111111111",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
  },

  artifacts: {
    imageArtifact: {
      id: "a1111111-1111-4111-a111-111111111111",
      title: "Old Family Photo",
      description: "A photo from the 1980s",
      collection_id: "c1111111-1111-4111-a111-111111111111",
      user_id: "11111111-1111-4111-a111-111111111111",
      media_urls: ["https://example.com/photo.jpg"],
      thumbnail_url: "https://example.com/photo.jpg",
      slug: "old-family-photo-1704067200",
      year_acquired: 1985,
      origin: "Family Estate",
      type_id: null,
      image_captions: {
        "https://example.com/photo.jpg": "Family photo showing three people",
      },
      video_summaries: {},
      audio_transcripts: {},
      audio_summaries: {},
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
    multiMediaArtifact: {
      id: "a2222222-2222-4222-a222-222222222222",
      title: "Wedding Memory",
      description: "Photos and video from wedding",
      collection_id: "c1111111-1111-4111-a111-111111111111",
      user_id: "11111111-1111-4111-a111-111111111111",
      media_urls: [
        "https://example.com/photo1.jpg",
        "https://example.com/video.mp4",
        "https://example.com/photo2.jpg",
      ],
      thumbnail_url: "https://example.com/photo1.jpg",
      slug: "wedding-memory-1704067200",
      year_acquired: 2022,
      origin: "Personal",
      type_id: null,
      image_captions: {
        "https://example.com/photo1.jpg": "Bride and groom at altar",
        "https://example.com/photo2.jpg": "Reception dance",
      },
      video_summaries: {
        "https://example.com/video.mp4": " ceremony and first dance",
      },
      audio_transcripts: {},
      audio_summaries: {},
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
    audioArtifact: {
      id: "a3333333-3333-4333-a333-333333333333",
      title: "Grandpa Interview",
      description: "Audio interview with grandfather",
      collection_id: "c2222222-2222-4222-a222-222222222222",
      user_id: "11111111-1111-4111-a111-111111111111",
      media_urls: ["https://example.com/interview.mp3"],
      thumbnail_url: null,
      slug: "grandpa-interview-1704067200",
      year_acquired: null,
      origin: null,
      type_id: null,
      image_captions: {},
      video_summaries: {},
      audio_transcripts: {
        "https://example.com/interview.mp3": "Transcript of grandfather talking about his life",
      },
      audio_summaries: {
        "https://example.com/interview.mp3":
          "Grandfather shares stories about his military service",
      },
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
  },

  artifactTypes: {
    car: {
      id: "d1111111-1111-4111-a111-111111111111",
      name: "Car Collectors",
      slug: "car-collectors",
      description: "For collecting cars and vehicle photos",
      icon_name: "Car",
      display_order: 1,
      is_active: true,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
    watch: {
      id: "d2222222-2222-4222-a222-222222222222",
      name: "Watch Collectors",
      slug: "watch-collectors",
      description: "For collecting watches and timepieces",
      icon_name: "Watch",
      display_order: 2,
      is_active: true,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
    general: {
      id: "d3333333-3333-4333-a333-333333333333",
      name: "General / Other",
      slug: "general-other",
      description: "General artifacts",
      icon_name: "Package",
      display_order: 0,
      is_active: true,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    },
  },

  forms: {
    validCreateArtifactInput: {
      title: "Test Artifact",
      description: "A test artifact for unit testing",
      collectionId: "c1111111-1111-4111-a111-111111111111",
      yearAcquired: 2020,
      origin: "Test Source",
      mediaUrls: ["https://example.com/image.jpg"],
      thumbnailUrl: "https://example.com/image.jpg",
      typeId: null,
      imageCaptions: {},
      videoSummaries: {},
      audioTranscripts: {},
    },
    invalidCreateArtifactInput: {
      title: "", // Invalid - empty title
      description: "Too long".repeat(500), // Invalid - too long
      collectionId: "invalid-uuid",
      mediaUrls: ["not-a-url"],
    },
  },

  cloudinary: {
    imageUrl:
      "https://res.cloudinary.com/test/image/upload/v1704067200/users/test-user/artifacts/2024/01/image_1704067200.jpg",
    videoUrl:
      "https://res.cloudinary.com/test/video/upload/v1704067200/users/test-user/artifacts/2024/01/video_1704067200.mp4",
    audioUrl:
      "https://res.cloudinary.com/test/video/upload/v1704067200/users/test-user/artifacts/audio/2024/01/audio_1704067200.mp3",
    invalidUrl: "https://example.com/image.jpg",
  },

  auth: {
    validLoginCredentials: {
      email: "testuser@example.com",
      password: "SecurePassword123!",
    },
    invalidLoginCredentials: {
      email: "testuser@example.com",
      password: "WrongPassword",
    },
    signupData: {
      email: "newuser@example.com",
      password: "SecurePassword123!",
      displayName: "New User",
    },
  },

  userMedia: {
    imageMedia: {
      id: "e1111111-1111-4111-a111-111111111111",
      user_id: "11111111-1111-4111-a111-111111111111",
      storage_path: "11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-photo.jpg",
      public_url: "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-photo.jpg",
      filename: "1704067200-photo.jpg",
      mime_type: "image/jpeg",
      file_size_bytes: 1024000,
      width: 1920,
      height: 1080,
      duration_seconds: null,
      media_type: "image" as const,
      upload_source: "gallery" as const,
      is_processed: true,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
    videoMedia: {
      id: "e2222222-2222-4222-a222-222222222222",
      user_id: "11111111-1111-4111-a111-111111111111",
      storage_path: "11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-video.mp4",
      public_url: "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-video.mp4",
      filename: "1704067200-video.mp4",
      mime_type: "video/mp4",
      file_size_bytes: 10240000,
      width: 1920,
      height: 1080,
      duration_seconds: 60,
      media_type: "video" as const,
      upload_source: "gallery" as const,
      is_processed: true,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
    audioMedia: {
      id: "e3333333-3333-4333-a333-333333333333",
      user_id: "11111111-1111-4111-a111-111111111111",
      storage_path: "11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-audio.mp3",
      public_url: "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/11111111-1111-4111-a111-111111111111/a1111111-1111-4111-a111-111111111111/1704067200-audio.mp3",
      filename: "1704067200-audio.mp3",
      mime_type: "audio/mpeg",
      file_size_bytes: 5120000,
      width: null,
      height: null,
      duration_seconds: 180,
      media_type: "audio" as const,
      upload_source: "gallery" as const,
      is_processed: true,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
  },

  artifactMedia: {
    galleryLink: {
      id: "ae111111-1111-4111-a111-111111111111",
      artifact_id: "a1111111-1111-4111-a111-111111111111",
      media_id: "e1111111-1111-4111-a111-111111111111",
      role: "gallery" as const,
      sort_order: 0,
      block_id: null,
      caption_override: null,
      is_primary: true,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    },
  },

  supabaseStorage: {
    validUrl: "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/test-user/test-artifact/image.jpg",
    tempUrl: "https://lfssobatohlllwuieauc.supabase.co/storage/v1/object/public/heirlooms-media/test-user/temp/1704067200-image.jpg",
  },
}

export type Fixtures = typeof fixtures
