-- =========================================================
-- VANGUARD PRO: Seamless Data Migration (v1.2)
-- Objective: Transition from JWE Blobs to Structured Secure Data
-- =========================================================

-- 1. Drop old blob-based tables
DROP TABLE IF EXISTS public.dose_logs;
DROP TABLE IF EXISTS public.vials;
DROP TABLE IF EXISTS public.bio_markers;

-- 2. Create Structured Tables (Encrypted at rest by Supabase)
CREATE TABLE public.vials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('powder', 'mixed', 'pill')),
    volume_ml NUMERIC DEFAULT 0,
    remaining_volume_ml NUMERIC DEFAULT 0,
    pill_count INTEGER DEFAULT 0,
    compounds JSONB NOT NULL DEFAULT '[]', -- [{name: "BPC", mass: 5, unit: "mg"}]
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vial_id UUID REFERENCES public.vials(id) ON DELETE CASCADE,
    substance TEXT NOT NULL,
    dose_amount NUMERIC NOT NULL,
    units_iu NUMERIC DEFAULT 0,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vial_id UUID REFERENCES public.vials(id) ON DELETE CASCADE,
    dose_amount NUMERIC NOT NULL,
    frequency_hours NUMERIC NOT NULL,
    start_time BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Performance Indexing
CREATE INDEX idx_vials_user_id ON public.vials(user_id);
CREATE INDEX idx_dose_logs_user_id ON public.dose_logs(user_id);
CREATE INDEX idx_protocols_user_id ON public.protocols(user_id);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE public.vials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

-- 5. Multi-Tenant Access Policies
CREATE POLICY "Users can only access their own vials" ON public.vials FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only access their own logs" ON public.dose_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only access their own protocols" ON public.protocols FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
