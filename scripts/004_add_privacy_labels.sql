-- Add (Priv) or (Pub) labels to collection titles for easier testing

-- Update public collections to add (Pub) suffix
UPDATE collections
SET title = title || ' (Pub)'
WHERE is_public = true
  AND title NOT LIKE '%(Pub)%'
  AND title NOT LIKE '%(Priv)%';

-- Update private collections to add (Priv) suffix
UPDATE collections
SET title = title || ' (Priv)'
WHERE is_public = false
  AND title NOT LIKE '%(Pub)%'
  AND title NOT LIKE '%(Priv)%';
