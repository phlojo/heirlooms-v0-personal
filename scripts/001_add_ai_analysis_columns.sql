-- Migration: Add AI analysis columns to artifacts table
-- Safe to run multiple times (idempotent)

DO $$ 
BEGIN
    -- Add transcript column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artifacts' 
        AND column_name = 'transcript'
    ) THEN
        ALTER TABLE public.artifacts ADD COLUMN transcript TEXT NULL;
    END IF;

    -- Add ai_description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artifacts' 
        AND column_name = 'ai_description'
    ) THEN
        ALTER TABLE public.artifacts ADD COLUMN ai_description TEXT NULL;
    END IF;

    -- Add image_captions column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artifacts' 
        AND column_name = 'image_captions'
    ) THEN
        ALTER TABLE public.artifacts ADD COLUMN image_captions JSONB NULL;
    END IF;

    -- Add analysis_status column with CHECK constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artifacts' 
        AND column_name = 'analysis_status'
    ) THEN
        ALTER TABLE public.artifacts ADD COLUMN analysis_status TEXT NULL;
    END IF;

    -- Add analysis_error column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artifacts' 
        AND column_name = 'analysis_error'
    ) THEN
        ALTER TABLE public.artifacts ADD COLUMN analysis_error TEXT NULL;
    END IF;

    -- Add language_hint column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'artifacts' 
        AND column_name = 'language_hint'
    ) THEN
        ALTER TABLE public.artifacts ADD COLUMN language_hint TEXT NULL;
    END IF;

    -- Add CHECK constraint for analysis_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_schema = 'public' 
        AND table_name = 'artifacts' 
        AND constraint_name = 'artifacts_analysis_status_check'
    ) THEN
        ALTER TABLE public.artifacts 
        ADD CONSTRAINT artifacts_analysis_status_check 
        CHECK (analysis_status IN ('idle', 'queued', 'processing', 'done', 'error'));
    END IF;

END $$;
