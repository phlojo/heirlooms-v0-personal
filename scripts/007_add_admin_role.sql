-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create a helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin_user() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Update Collections RLS Policies for admin access

-- Drop existing SELECT policies first
DROP POLICY IF EXISTS "Users can view own collections" ON collections;
DROP POLICY IF EXISTS "Users can view public collections" ON collections;

-- Recreate with admin access
CREATE POLICY "Users can view own collections or admin can view all"
  ON collections FOR SELECT
  USING (is_admin_user() OR auth.uid() = user_id OR is_public = true);

-- Update INSERT policy (admins can insert as any user, but we keep ownership rules)
DROP POLICY IF EXISTS "Users can insert own collections" ON collections;
CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update UPDATE policy to allow admins
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
CREATE POLICY "Users can update own collections or admin can update all"
  ON collections FOR UPDATE
  USING (is_admin_user() OR auth.uid() = user_id);

-- Update DELETE policy to allow admins
DROP POLICY IF EXISTS "Users can delete own collections" ON collections;
CREATE POLICY "Users can delete own collections or admin can delete all"
  ON collections FOR DELETE
  USING (is_admin_user() OR auth.uid() = user_id);

-- Update Artifacts RLS Policies for admin access

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own artifacts" ON artifacts;
DROP POLICY IF EXISTS "Users can view public artifacts" ON artifacts;

-- Recreate with admin access
CREATE POLICY "Users can view own artifacts or admin can view all"
  ON artifacts FOR SELECT
  USING (
    is_admin_user() 
    OR auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = artifacts.collection_id
      AND collections.is_public = true
    )
  );

-- Update INSERT policy
DROP POLICY IF EXISTS "Users can insert own artifacts" ON artifacts;
CREATE POLICY "Users can insert own artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update UPDATE policy to allow admins
DROP POLICY IF EXISTS "Users can update own artifacts" ON artifacts;
CREATE POLICY "Users can update own artifacts or admin can update all"
  ON artifacts FOR UPDATE
  USING (is_admin_user() OR auth.uid() = user_id);

-- Update DELETE policy to allow admins
DROP POLICY IF EXISTS "Users can delete own artifacts" ON artifacts;
CREATE POLICY "Users can delete own artifacts or admin can delete all"
  ON artifacts FOR DELETE
  USING (is_admin_user() OR auth.uid() = user_id);

-- Create an admin check function for server-side use
COMMENT ON FUNCTION is_admin_user() IS 'Returns true if the current authenticated user has admin privileges';
