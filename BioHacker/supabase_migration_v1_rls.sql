-- =========================================================
-- VANGUARD PRO: Core Database Migration (v1.1)
-- Objective: Enable Zero-Knowledge Multi-Tenant Isolation via RLS
-- =========================================================

-- 1. Create Tables with User Context
-- Note: Sensitive data (name, substance, metrics) will be stored as JWE strings (text)

CREATE TABLE IF NOT EXISTS public.vials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_payload TEXT NOT NULL, -- JWE: { name, concentration, total_volume }
    remaining_volume_ml NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vial_id UUID REFERENCES public.vials(id) ON DELETE SET NULL,
    encrypted_payload TEXT NOT NULL, -- JWE: { substance, dose_mcg, units_iu, timestamp }
    dosage_iu NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bio_markers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_payload TEXT NOT NULL, -- JWE: { marker_type, value, unit, source }
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Performance Optimization: User Context Indexing
-- Essential for O(log n) lookups as we scale past 1,000+ users
CREATE INDEX IF NOT EXISTS idx_vials_user_id ON public.vials(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_user_id ON public.dose_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bio_markers_user_id ON public.bio_markers(user_id);

-- 3. Enable Row-Level Security (RLS)
-- Deny all by default
ALTER TABLE public.vials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_markers ENABLE ROW LEVEL SECURITY;

-- 4. Implement Multi-Tenant Access Policies
-- Using (auth.uid() = user_id) for sub-millisecond session validation

-- Vials Policies
CREATE POLICY "Users can only manage their own vials" ON public.vials
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Dose_Logs Policies
CREATE POLICY "Users can only manage their own dose logs" ON public.dose_logs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Bio_Markers Policies
CREATE POLICY "Users can only manage their own bio markers" ON public.bio_markers
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Realtime Replication (Optional, for Replicache/Supabase Realtime)
-- ALTER PUBLICATION supabase_realtime ADD TABLE vials, dose_logs, bio_markers;
