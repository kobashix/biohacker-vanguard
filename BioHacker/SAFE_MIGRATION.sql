-- =========================================================
-- VANGUARD PRO: Safe Migration (v1.2/1.3 Combined)
-- Objective: Add columns and tables without deleting data.
-- =========================================================

-- 1. Create Tables safely
CREATE TABLE IF NOT EXISTS public.vials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'powder',
    volume_ml NUMERIC DEFAULT 0,
    remaining_volume_ml NUMERIC DEFAULT 0,
    pill_count INTEGER DEFAULT 0,
    compounds JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vial_id UUID REFERENCES public.vials(id) ON DELETE CASCADE,
    substance TEXT NOT NULL,
    dose_amount NUMERIC NOT NULL,
    units_iu NUMERIC DEFAULT 0,
    timestamp BIGINT NOT NULL,
    injection_site TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vial_id UUID REFERENCES public.vials(id) ON DELETE CASCADE,
    dose_amount NUMERIC NOT NULL,
    frequency_hours NUMERIC NOT NULL,
    days_on INTEGER DEFAULT 7,
    days_off INTEGER DEFAULT 0,
    start_time BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjective_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp BIGINT NOT NULL,
    mood INTEGER,
    energy INTEGER,
    sleep_quality INTEGER,
    soreness INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add columns safely if they were missed
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='protocols' AND column_name='days_on') THEN
        ALTER TABLE public.protocols ADD COLUMN days_on INTEGER DEFAULT 7;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='protocols' AND column_name='days_off') THEN
        ALTER TABLE public.protocols ADD COLUMN days_off INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dose_logs' AND column_name='injection_site') THEN
        ALTER TABLE public.dose_logs ADD COLUMN injection_site TEXT;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.vials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjective_logs ENABLE ROW LEVEL SECURITY;
