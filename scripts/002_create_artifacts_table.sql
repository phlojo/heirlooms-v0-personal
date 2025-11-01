-- Create artifacts table
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  year_acquired INTEGER,
  origin TEXT,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artifacts_collection_id ON artifacts(collection_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON artifacts(user_id);

-- Enable Row Level Security
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view artifacts in their collections
CREATE POLICY "Users can view own artifacts"
  ON artifacts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view artifacts in public collections
CREATE POLICY "Users can view public artifacts"
  ON artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = artifacts.collection_id
      AND collections.is_public = true
    )
  );

-- Policy: Users can insert artifacts in their collections
CREATE POLICY "Users can insert own artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own artifacts
CREATE POLICY "Users can update own artifacts"
  ON artifacts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own artifacts
CREATE POLICY "Users can delete own artifacts"
  ON artifacts FOR DELETE
  USING (auth.uid() = user_id);
