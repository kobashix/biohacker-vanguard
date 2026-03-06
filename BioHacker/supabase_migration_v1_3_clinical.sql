-- =========================================================
-- VANGUARD PRO: Clinical Features Migration (v1.3)
-- Objective: Support X Days On/Off, Subjective Logging, and Site Rotation
-- =========================================================

-- 1. Update Protocols for Pattern Support
ALTER TABLE public.protocols 
ADD COLUMN IF NOT EXISTS days_on INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS days_off INTEGER DEFAULT 0;

-- 2. Update Dose Logs for Site Rotation
ALTER TABLE public.dose_logs 
ADD COLUMN IF NOT EXISTS injection_site TEXT;

-- 3. Create Subjective Logs Table
CREATE TABLE IF NOT EXISTS public.subjective_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp BIGINT NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    energy INTEGER CHECK (energy >= 1 AND energy <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    soreness INTEGER CHECK (soreness >= 1 AND soreness <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS and Policies for new table
ALTER TABLE public.subjective_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own subjective logs" 
ON public.subjective_logs FOR ALL TO authenticated 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_subjective_logs_user_id ON public.subjective_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subjective_logs_timestamp ON public.subjective_logs(timestamp);
