// src/env.ts
// Optional environment variable validation using Zod
// Import this file where you need validated env vars

import { z } from "zod"

const ServerEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  AI_MODEL_VISION: z.string().optional(),
  AI_MODEL_TEXT: z.string().optional(),
  AI_TRANSCRIBE_MODEL: z.string().optional(),
  AI_MODEL_SUMMARY: z.string().optional(),
})

// Parse and validate environment variables
export const env = ServerEnvSchema.parse(process.env)
