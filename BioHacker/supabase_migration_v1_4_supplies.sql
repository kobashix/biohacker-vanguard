-- =========================================================
-- VANGUARD PRO: Supplies and Advanced Scheduling (v1.4)
-- Objective: Support Supplies tracking and enhanced Protocol logic
-- =========================================================

-- 1. Create Supplies Table
CREATE TABLE IF NOT EXISTS public.supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Needles, Wipes, BAC Water
    count INTEGER DEFAULT 0,
    unit TEXT, -- pieces, mL, etc.
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own supplies" ON public.supplies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_supplies_user_id ON public.supplies(user_id);

-- 2. Update Protocols for Advanced Timing
ALTER TABLE public.protocols 
ADD COLUMN IF NOT EXISTS skip_weekends BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS time_buckets JSONB DEFAULT '[]'; -- ['morning', 'afternoon', 'night']

-- 3. Cycle Dates Support
CREATE TABLE IF NOT EXISTS public.cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own cycles" ON public.cycles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON public.cycles(user_id);
