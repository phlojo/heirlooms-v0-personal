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
      primary_type_id: "t1111111-1111-4111-a111-111111111111",
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
      id: "t1111111-1111-4111-a111-111111111111",
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
      id: "t2222222-2222-4222-a222-222222222222",
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
      id: "t3333333-3333-4333-a333-333333333333",
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
}

export type Fixtures = typeof fixtures
