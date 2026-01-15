-- ==============================================================================
-- SEARCH OPTIMIZATION MIGRATION
-- Run this in your Supabase SQL Editor to enable high-performance case-insensitive search
-- ==============================================================================

-- 1. Enable the pg_trgm extension
-- This is REQUIRED for efficient ILIKE searches (e.g. title ilike '%term%')
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create GIN Indexes for Notes Table
-- These indexes effectively speed up queries like: 
-- SELECT * FROM notes WHERE title ILIKE '%search%'
CREATE INDEX IF NOT EXISTS notes_title_trgm_idx ON notes USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS notes_subject_trgm_idx ON notes USING GIN (subject gin_trgm_ops);
CREATE INDEX IF NOT EXISTS notes_description_trgm_idx ON notes USING GIN (description gin_trgm_ops);

-- 3. Create GIN Indexes for Study Circles Table
CREATE INDEX IF NOT EXISTS study_circles_name_trgm_idx ON study_circles USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS study_circles_subject_area_trgm_idx ON study_circles USING GIN (subject_area gin_trgm_ops);

-- 4. Create GIN Indexes for Thoughts Table
CREATE INDEX IF NOT EXISTS thoughts_title_trgm_idx ON thoughts USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS thoughts_content_trgm_idx ON thoughts USING GIN (content gin_trgm_ops);

-- ==============================================================================
-- EXPLANATION
-- ==============================================================================
-- Without these indexes, an ILIKE '%query%' search forces the database to scan 
-- every match row (submit Sequence Scan), which is slow.
-- With GIN indexes and pg_trgm, Postgres can jump directly to the matching matching 
-- records, making your search lightning fast and scalable.
