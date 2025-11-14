-- Add slug column to artifacts table
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing artifacts from their titles
UPDATE artifacts
SET slug = lower(trim(regexp_replace(regexp_replace(regexp_replace(title, '[^\w\s-]', '', 'g'), '[\s_-]+', '-', 'g'), '^-+|-+$', '', 'g')))
WHERE slug IS NULL;

-- Handle duplicates by appending numbers
WITH duplicates AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM artifacts
  WHERE slug IS NOT NULL
)
UPDATE artifacts
SET slug = artifacts.slug || '-' || duplicates.rn
FROM duplicates
WHERE artifacts.id = duplicates.id AND duplicates.rn > 1;

-- Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS artifacts_slug_key ON artifacts(slug);

-- Make slug NOT NULL after backfilling
ALTER TABLE artifacts ALTER COLUMN slug SET NOT NULL;
