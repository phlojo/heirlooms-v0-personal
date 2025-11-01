-- Delete all existing collections (artifacts will be cascade deleted if foreign key is set up)
DELETE FROM collections;

-- Create test collections for each registered user
DO $$
DECLARE
    user_record RECORD;
    collection_titles TEXT[] := ARRAY[
        'Family Heirlooms',
        'Vintage Photographs',
        'Antique Furniture',
        'Personal Memorabilia',
        'Historical Documents',
        'Precious Jewelry'
    ];
    collection_descriptions TEXT[] := ARRAY[
        'A curated collection of cherished family heirlooms passed down through generations, each piece telling a unique story of our heritage.',
        'Rare and beautiful vintage photographs capturing moments in time, preserving memories of loved ones and historical events.',
        'Exquisite antique furniture pieces that showcase craftsmanship from bygone eras, each with its own character and history.',
        'Personal items and memorabilia that hold special meaning, from childhood treasures to significant life milestones.',
        'Important historical documents and papers that provide insight into the past and preserve family history for future generations.',
        'A stunning collection of precious jewelry pieces, from inherited family gems to unique vintage finds with timeless beauty.'
    ];
    i INTEGER;
BEGIN
    -- Loop through each user in auth.users
    FOR user_record IN 
        SELECT id FROM auth.users
    LOOP
        -- Create 6 collections for each user (3 public, 3 private)
        FOR i IN 1..6 LOOP
            INSERT INTO collections (
                id,
                user_id,
                title,
                description,
                is_public,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                user_record.id,
                collection_titles[i],
                collection_descriptions[i],
                i <= 3, -- First 3 are public, last 3 are private
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;
