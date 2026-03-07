-- =========================================================
-- VANGUARD PRO: Sync & Persistence Migration (v1.4)
-- Objective: Add missing tables for sync reliability
-- NOTE: Existing tables keep their UUID primary keys.
--       Client code uses crypto.randomUUID() for compatibility.
-- =========================================================

-- 1. Supplies table (was missing, causing silent upsert failures)
CREATE TABLE IF NOT EXISTS public.supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    count NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'units',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplies' AND policyname = 'Users can only access their own supplies'
  ) THEN
    CREATE POLICY "Users can only access their own supplies"
    ON public.supplies FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_supplies_user_id ON public.supplies(user_id);

-- 2. Cycles table (was missing, causing silent upsert failures)
CREATE TABLE IF NOT EXISTS public.cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cycles' AND policyname = 'Users can only access their own cycles'
  ) THEN
    CREATE POLICY "Users can only access their own cycles"
    ON public.cycles FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON public.cycles(user_id);

-- 3. Replicache client tracking table
-- Tracks the last processed mutation ID per client so the pull endpoint
-- can return correct lastMutationIDChanges and stop Replicache from
-- replaying already-committed mutations after a deploy or refresh.
CREATE TABLE IF NOT EXISTS public.replicache_clients (
    id TEXT PRIMARY KEY,
    client_group_id TEXT NOT NULL,
    last_mutation_id BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add skip_weekends and time_buckets columns to protocols if missing
ALTER TABLE public.protocols
  ADD COLUMN IF NOT EXISTS skip_weekends BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS time_buckets TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes TEXT;
