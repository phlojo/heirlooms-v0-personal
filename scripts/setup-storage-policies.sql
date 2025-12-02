-- Supabase Storage RLS Policies for heirlooms-media bucket
-- Run this in Supabase SQL Editor to enable file uploads
--
-- This script sets up the necessary Row Level Security policies for the
-- heirlooms-media storage bucket to allow authenticated users to upload,
-- read, and delete their own files.

-- Policy 1: Allow authenticated users to upload their own media
-- Users can only upload to folders that start with their user ID
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'heirlooms-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow public read access to all files in the bucket
-- This allows anyone to view uploaded media
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'heirlooms-media');

-- Policy 3: Allow users to delete their own media
-- Users can only delete files in folders that start with their user ID
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'heirlooms-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to update their own media (for moves/renames)
-- Users can only update files in folders that start with their user ID
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'heirlooms-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
