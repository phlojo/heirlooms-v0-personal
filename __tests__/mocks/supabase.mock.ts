import { vi } from "vitest"

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
  rpc: vi.fn(),
  channel: vi.fn(),
}

export const mockSupabaseServer = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

/**
 * Mock helper for database queries
 */
export const mockDatabaseQuery = (data: any[], error: any = null) => {
  return {
    data,
    error,
    count: data.length,
    status: error ? 400 : 200,
  }
}

/**
 * Mock helper for single row operations
 */
export const mockSingleRowOperation = (data: any = null, error: any = null) => {
  return {
    data,
    error,
    status: error ? 400 : 201,
  }
}

/**
 * Setup common Supabase mock patterns
 */
export const setupSupabaseMocks = () => {
  // Mock select queries
  mockSupabaseClient.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue(mockDatabaseQuery([])),
  })

  // Mock auth state
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: {
      user: {
        id: "test-user-id",
        email: "test@example.com",
        user_metadata: { displayName: "Test User" },
      },
    },
    error: null,
  })

  return mockSupabaseClient
}
