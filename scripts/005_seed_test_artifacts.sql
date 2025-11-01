-- Seed test artifacts for all collections
-- This script adds 3-5 test artifacts to each collection in the database

DO $$
DECLARE
  collection_record RECORD;
  artifact_count INTEGER;
  artifact_titles TEXT[] := ARRAY[
    'Antique Pocket Watch',
    'Victorian Era Brooch',
    'Handwritten Letter from 1920',
    'Silver Tea Set',
    'Vintage Photograph Album',
    'Gold Wedding Ring',
    'Military Medal',
    'Porcelain Vase',
    'Leather-Bound Journal',
    'Crystal Chandelier',
    'Wooden Music Box',
    'Brass Compass',
    'Silk Embroidered Shawl',
    'Ivory Chess Set',
    'Bronze Sculpture',
    'Ceramic Figurine',
    'Antique Clock',
    'Pearl Necklace',
    'Vintage Camera',
    'Oil Painting Portrait'
  ];
  artifact_descriptions TEXT[] := ARRAY[
    'A beautifully preserved piece with intricate details and craftsmanship.',
    'This item has been passed down through generations of our family.',
    'Discovered in an old trunk in the attic, still in excellent condition.',
    'A cherished heirloom with significant sentimental value.',
    'Carefully maintained and restored to its original glory.',
    'Features unique design elements characteristic of its era.',
    'Accompanied by original documentation and provenance.',
    'A rare find that represents an important period in history.',
    'Shows minimal wear despite its age, testament to its quality.',
    'Contains fascinating details that tell a story of the past.'
  ];
  artifact_origins TEXT[] := ARRAY[
    'London, England',
    'Paris, France',
    'New York, USA',
    'Vienna, Austria',
    'Florence, Italy',
    'Boston, USA',
    'Edinburgh, Scotland',
    'Berlin, Germany',
    'Amsterdam, Netherlands',
    'Prague, Czech Republic'
  ];
  random_title TEXT;
  random_description TEXT;
  random_origin TEXT;
  random_year INTEGER;
BEGIN
  -- Loop through all collections
  FOR collection_record IN 
    SELECT id, user_id, title FROM collections
  LOOP
    -- Generate 3-5 artifacts per collection
    artifact_count := 3 + floor(random() * 3)::INTEGER; -- Random number between 3 and 5
    
    FOR i IN 1..artifact_count LOOP
      -- Select random data for each artifact
      random_title := artifact_titles[1 + floor(random() * array_length(artifact_titles, 1))::INTEGER];
      random_description := artifact_descriptions[1 + floor(random() * array_length(artifact_descriptions, 1))::INTEGER];
      random_origin := artifact_origins[1 + floor(random() * array_length(artifact_origins, 1))::INTEGER];
      random_year := 1850 + floor(random() * 150)::INTEGER; -- Random year between 1850 and 2000
      
      -- Insert the artifact
      INSERT INTO artifacts (
        title,
        description,
        collection_id,
        user_id,
        year_acquired,
        origin,
        media_urls
      ) VALUES (
        random_title || ' #' || i,
        random_description || ' This particular piece was acquired in ' || random_year || '.',
        collection_record.id,
        collection_record.user_id,
        random_year,
        random_origin,
        ARRAY['/placeholder.svg?height=400&width=400&query=' || replace(random_title, ' ', '+')]
      );
    END LOOP;
    
    RAISE NOTICE 'Added % artifacts to collection: %', artifact_count, collection_record.title;
  END LOOP;
  
  RAISE NOTICE 'Artifact seeding completed successfully!';
END $$;
