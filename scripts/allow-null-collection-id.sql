-- Remove NOT NULL constraint from artifacts.collection_id to allow unsorted artifacts
ALTER TABLE artifacts 
ALTER COLUMN collection_id DROP NOT NULL;

-- Verify the change
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'artifacts' 
  AND column_name = 'collection_id';
