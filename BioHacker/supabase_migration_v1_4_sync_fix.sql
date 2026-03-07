-- =========================================================
-- VANGUARD PRO: Sync & Persistence Migration (v1.4)
-- Objective: Add missing tables and fix Replicache sync reliability
-- =========================================================

-- 1. Supplies table (was missing, causing silent upsert failures)
CREATE TABLE IF NOT EXISTS public.supplies (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    count NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'units',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own supplies"
ON public.supplies FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_supplies_user_id ON public.supplies(user_id);

-- 2. Cycles table (was missing, causing silent upsert failures)
CREATE TABLE IF NOT EXISTS public.cycles (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own cycles"
ON public.cycles FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON public.cycles(user_id);

-- 3. Replicache client tracking table
-- This is critical: tracks the last processed mutation ID per Replicache client,
-- so the pull endpoint can return correct lastMutationIDChanges and prevent
-- Replicache from replaying already-committed mutations after a deploy or page refresh.
CREATE TABLE IF NOT EXISTS public.replicache_clients (
    id TEXT PRIMARY KEY,
    client_group_id TEXT NOT NULL,
    last_mutation_id BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- No RLS needed — server uses service role implicitly; anon key access gated by push/pull auth

-- 4. Ensure protocols table has TEXT id compatibility for nanoid
-- (UUID primary key may reject nanoid strings — alter to TEXT)
ALTER TABLE public.protocols ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.vials ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.dose_logs ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.subjective_logs ALTER COLUMN id TYPE TEXT;
