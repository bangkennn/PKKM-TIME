-- Database Schema for PPKM_stmik_time on Supabase PostgreSQL

-- 1. Create table ppkm_entries
CREATE TABLE IF NOT EXISTS public.ppkm_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    description TEXT,
    student_id VARCHAR(50),
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ppkm_entries_category ON public.ppkm_entries(category);
CREATE INDEX IF NOT EXISTS idx_ppkm_entries_student_id ON public.ppkm_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_ppkm_entries_created_at ON public.ppkm_entries(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.ppkm_entries ENABLE ROW LEVEL SECURITY;

-- 4. Basic policies
CREATE POLICY "Allow public read access to ppkm_entries"
    ON public.ppkm_entries
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to ppkm_entries"
    ON public.ppkm_entries
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update to ppkm_entries"
    ON public.ppkm_entries
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow delete to ppkm_entries"
    ON public.ppkm_entries
    FOR DELETE
    USING (true);

