-- 🚀 Automated SQL Script to Create Supabase Auth Logins & Identities for All Employees
-- (Excluding stanleyboshoff@gmail.com as requested)
-- Run this script in your Supabase SQL Editor

DO $$
DECLARE
    emp RECORD;
    new_auth_id UUID;
BEGIN
    -- Ensure pgcrypto extension is available for bcrypt password hashing
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    FOR emp IN SELECT id, email, first_name, last_name FROM employees WHERE email != 'stanleyboshoff@gmail.com' LOOP
        -- Check if auth user already exists
        SELECT id INTO new_auth_id FROM auth.users WHERE email = emp.email;

        IF new_auth_id IS NULL THEN
            -- Generate new UUID for auth user
            new_auth_id := gen_random_uuid();

            -- 1. Insert into auth.users
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                new_auth_id,
                'authenticated',
                'authenticated',
                emp.email,
                crypt('password123', gen_salt('bf')),
                NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                jsonb_build_object('first_name', emp.first_name, 'last_name', emp.last_name),
                NOW(),
                NOW()
            );
        END IF;

        -- 2. Insert into auth.identities (include provider_id set to employee email)
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            new_auth_id,
            new_auth_id,
            emp.email,
            jsonb_build_object('sub', new_auth_id::text, 'email', emp.email),
            'email',
            NOW(),
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;

        -- Ensure employee record has auth_id linked
        UPDATE employees SET auth_id = new_auth_id WHERE id = emp.id;
    END LOOP;
END $$;

-- Verify all employees have auth logins & identities
SELECT e.first_name, e.last_name, e.role, e.email,
       CASE WHEN u.id IS NOT NULL AND i.id IS NOT NULL THEN '✅ Fully Active' ELSE '❌ Issue Detected' END as login_status
FROM employees e
LEFT JOIN auth.users u ON e.email = u.email
LEFT JOIN auth.identities i ON u.id = i.user_id
ORDER BY e.employee_number;
