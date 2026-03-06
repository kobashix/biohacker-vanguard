-- =========================================================
-- BIOHACKER (by MMM): Demo Account Provisioning Script
-- Objective: Seed a professional test environment for audit.
-- =========================================================

-- 1. Create a Demo User (Manually in Supabase Auth first if needed, or use existing)
-- For this script, we assume a placeholder user_id '00000000-0000-0000-0000-000000000000'
-- Replace this with your actual test user ID after registration.

-- 2. Seed Sample Inventory (Powder, Mixed, and Pills)
INSERT INTO public.vials (id, user_id, name, status, volume_ml, remaining_volume_ml, pill_count, compounds)
VALUES 
    -- Mixed Liquid (Peptide)
    ('vial-bpc-157-demo', '7a2f9b4c-a0b0-43d8-8d98-2565da10cbf2', 'BPC-157 (Recovery)', 'mixed', 2.0, 1.85, 0, '[{"name": "BPC-157", "mass_mg": 5, "unit": "mg"}]'),
    
    -- IU-Based Liquid (HGH)
    ('vial-hgh-demo', '7a2f9b4c-a0b0-43d8-8d98-2565da10cbf2', 'HGH (Performance)', 'mixed', 5.0, 4.5, 0, '[{"name": "Somatropin", "mass_mg": 36, "unit": "IU"}]'),
    
    -- Oral Pills (Anavar)
    ('vial-anavar-demo', '7a2f9b4c-a0b0-43d8-8d98-2565da10cbf2', 'Anavar (Oral)', 'pill', 0, 0, 48, '[{"name": "Oxandrolone", "mass_mg": 10, "unit": "mg"}]'),
    
    -- Strategic Stockpile (Dry Powder)
    ('vial-tb500-stockpile', '7a2f9b4c-a0b0-43d8-8d98-2565da10cbf2', 'TB-500 (Reserve)', 'powder', 0, 0, 0, '[{"name": "TB-500", "mass_mg": 10, "unit": "mg"}]');

-- 3. Seed active Protocols
INSERT INTO public.protocols (id, user_id, vial_id, dose_amount, frequency_hours, days_on, days_off, start_time)
VALUES 
    -- BPC-157: 250mcg every 24h
    ('proto-bpc-demo', '7a2f9b4c-a0b0-43d8-8d98-2565da10cbf2', 'vial-bpc-157-demo', 250, 24, 7, 0, extract(epoch from now())::bigint * 1000),
    
    -- Anavar: 2 pills every 24h
    ('proto-anavar-demo', '7a2f9b4c-a0b0-43d8-8d98-2565da10cbf2', 'vial-anavar-demo', 2, 24, 7, 0, extract(epoch from now())::bigint * 1000);

-- 4. Seed initial Dose Logs
INSERT INTO public.dose_logs (id, user_id, vial_id, substance, dose_amount, units_iu, timestamp, injection_site)
VALUES 
    ('log-bpc-1', '7a2f9b4c-a0b0-43d8-8d98-2565da10cbf2', 'vial-bpc-157-demo', 'BPC-157 (Recovery) (BPC-157)', 250, 10, (extract(epoch from now())::bigint - 86400) * 1000, 'Abdomen (Left)');
