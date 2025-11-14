-- Debug script to check uncategorized artifacts for user
-- User ID: 9ee6586e-12c5-4226-b2ba-4e8a03617ed6
-- Uncategorized Collection ID: 4fe8af01-e4c0-4ca7-bfc2-c8ffee3c4dc7

-- Check all artifacts for this user
SELECT 
  id,
  title,
  collection_id,
  user_id,
  created_at
FROM artifacts
WHERE user_id = '9ee6586e-12c5-4226-b2ba-4e8a03617ed6'
ORDER BY created_at DESC;

-- Check artifacts with NULL collection_id
SELECT 
  id,
  title,
  collection_id,
  user_id,
  created_at
FROM artifacts
WHERE user_id = '9ee6586e-12c5-4226-b2ba-4e8a03617ed6'
  AND collection_id IS NULL;

-- Check artifacts in the uncategorized collection
SELECT 
  id,
  title,
  collection_id,
  user_id,
  created_at
FROM artifacts
WHERE user_id = '9ee6586e-12c5-4226-b2ba-4e8a03617ed6'
  AND collection_id = '4fe8af01-e4c0-4ca7-bfc2-c8ffee3c4dc9';

-- Check the uncategorized collection details
SELECT 
  id,
  slug,
  title,
  user_id,
  is_public
FROM collections
WHERE slug = 'uncategorized'
  AND user_id = '9ee6586e-12c5-4226-b2ba-4e8a03617ed6';
