-- Migration: Add payroll_cycle_start_day to company_payroll_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='company_payroll_settings'
        AND column_name='payroll_cycle_start_day'
    ) THEN
        ALTER TABLE company_payroll_settings
        ADD COLUMN payroll_cycle_start_day INTEGER DEFAULT 21;
    END IF;
END $$;
