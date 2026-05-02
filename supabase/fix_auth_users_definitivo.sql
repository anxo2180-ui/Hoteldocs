-- ============================================================
-- HOTELDOCS - FIX AUTH.USERS + AUTH.IDENTITIES (DEFINITIVO)
-- ============================================================
-- Ejecutar en Supabase SQL Editor como superuser / postgres role
--
-- PROBLEMA RAIZ VERIFICADO:
--   1. El seed.sql inserta en auth.users usando crypt('pass', gen_salt('bf'))
--      que genera hashes bcrypt $2a$06$ (cost 6 por defecto en pgcrypto).
--      GoTrue (Supabase Auth) genera hashes $2b$10$ (cost 10).
--      Aunque bcrypt es un estandar, hay reportes masivos en la comunidad
--      (supabase/discussions/28367, supabase/discussions/5248,
--       supabase-community/seed#208) de que crypt() de pgcrypto NO produce
--      hashes que GoTrue pueda verificar en versiones recientes.
--   2. Faltan campos obligatorios en auth.users: instance_id, aud, role,
--      raw_app_meta_data. GoTrue los necesita para no crashear con
--      "Database error querying schema" (supabase/auth#1940).
--   3. Faltan auth.identities. Desde versiones recientes GoTrue REQUIERE
--      un registro en auth.identities para cada login por email/password.
--   4. Los campos token (confirmation_token, recovery_token, etc.) deben ser
--      '' (string vacio) no NULL.
--
-- SOLUCION:
--   - UPDATE auth.users con todos los campos obligatorios + nuevo hash
--     bcrypt en formato $2b$10$ (generado con libreria bcrypt de Python,
--     misma familia que usa GoTrue internamente).
--   - INSERT de auth.identities para cada usuario.
--   - COALESCE() preserva datos existentes y solo rellena los faltantes.
-- ============================================================

-- ============================================================
-- PASO 1: UPDATE auth.users — corregir campos faltantes + rehash
-- ============================================================

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$uUy2N9JtQ8KyKD6/ZoTTIeOfmhke6WtwLwpCpHjQppFYfje.40VUa',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Anxo Taboada"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000001'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$/NG0cuMK8Nfnl1wClnWx7ez0VjO21oBuA1/PSmAh2XVWAPCqgg3hC',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Master Soporte"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000002'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$QerhfM/.neweORLTse/u8OGmOkwpbEah0sUNrDKYmxMzebtsla5dO',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Robinson Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000003'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$kFqfFmOlIqDcsBevUUpJWOW/abu1X7fR7R9g9RHS4zQVuw7gtL8MS',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"RCJD Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000004'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$26rEqiwOyi9gXScqoyvnWeljZ3dJQdF7aMhFA2j7Q3SzlpPJFuoue',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"RCEZ Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000005'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$.gtuLC0dXhxCHh1m/DCNMuBvOdslpPQvaT/3oqg1roWxa81Cs32c2',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"RCSN Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000006'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$7OAMlYsMTIy0gLl3E10Seuag9pCGn6Qu4Zbp8Lc1x6lzsxqvC.HNe',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"RCVD Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000007'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$1uGsAzM0sRLj6jHK15U1teryv9S167UBiKYlQrkB9gjPHFRrQ.5GW',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"RCQR Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000008'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$2GkM/OXPYAZjW9206QSthOL65vw1MOIjiziQomcYyGjCbmi4n5z3S',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"RCBT Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000009'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$z9ZmJZiWSU2.iXIs9W2ode3SdS0QIOzOn3FZUNCMqYaByWlCMe3w6',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Maria Recepcionista"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000010'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$HW0dr/L.QvAhEIYRXmk.O.eJkwuzkCGHIudShUvk.LOTSl1lQpJhi',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Juan Mantenimiento"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000011'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$MP8dSkNl1C1cJsjmyn/oZudASZRZJGiy43IEIpgfoRTc3qPDm/JpS',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Ana Limpieza"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000012'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$eUs1wvQiZrJb2rLB6o6COO/U33Xsf2mRwKy0YCTb0axXz4nVDJC1S',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Pedro Cocina"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000013'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$s/hQSRclnZ.qBS8yo6zzduf938GtHgr/BeP4CQbYaFJ.nQuHTy5tG',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Laura Animacion"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000014'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$U3f4zJ2lCHYmaKCfZ6Tz/etB33RQxdciHFkkjfDbYUUzNwRGtCH.a',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Carlos RRHH"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000015'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$YpDeuSdU2hJ7jlIOOJJGouOI0rcMLhO44dCUer1XLZ0gUxJXvzIEa',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Roberto Seguridad"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000016'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$fp1c/OZMV0M2dKW5vefnd.tL55sl9kQ.LKshhDF7vasdslm9jH1..',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Elena Cocina"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000017'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$qMvmfWnXCBAJEVZ/KrKjZ.bQaoAPtrr.iw20sNEWTj9.6DIQflKI2',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Beatriz Mantenimiento"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000018'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$gL0ekyIXc293tbGLKIFq9OTUxIRgrO77M.WljBkDIgksKjEzaa5pC',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"TUI Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000019'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$KnVzmfGzJdI/Ym4irAT3m.dfxXZYp9AKuTJVePqOh0uwrOnIJTH.K',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"TMLF Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000020'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$FIPxCMTG.96wnnxuzfiWuOIGATaFIRKIACx8GPUqvh2Qm.k3OTuxu',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"TMLCAL Admin"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000021'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$pjW1FuIuQQmyYnqLzlSnWeZNIfHsdSRi6JhB81Xe.CAshxukcC8MG',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Lisa Recepcionista"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000022'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$cnCS5QZr6kO1C3z.DH.UsOL6jxWDqtpKuh4dBawRyT6jxFL.93t8m',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Max Cocina"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000023'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$qBmJ0gmDoDG/Dv8.obLagebydWUt00NboWmSOEF0hPai380Cutp42',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"Sophie Animacion"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000024'::uuid;

UPDATE auth.users SET
  instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = '$2b$10$bczTmjRUm/OBlJZETfaZSeO0xoRwnWt2qaLbnIC76ep0XMuCxV3EW',
  email_confirmed_at = COALESCE(email_confirmed_at, '2024-01-15T10:00:00Z'::timestamptz),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{"name":"David Recepcion"}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE id = '40000000-0000-0000-0000-000000000025'::uuid;

-- ============================================================
-- PASO 2: auth.identities — borrar duplicados + recrear
-- ============================================================

DELETE FROM auth.identities
WHERE user_id IN (
  '40000000-0000-0000-0000-000000000001'::uuid,
  '40000000-0000-0000-0000-000000000002'::uuid,
  '40000000-0000-0000-0000-000000000003'::uuid,
  '40000000-0000-0000-0000-000000000004'::uuid,
  '40000000-0000-0000-0000-000000000005'::uuid,
  '40000000-0000-0000-0000-000000000006'::uuid,
  '40000000-0000-0000-0000-000000000007'::uuid,
  '40000000-0000-0000-0000-000000000008'::uuid,
  '40000000-0000-0000-0000-000000000009'::uuid,
  '40000000-0000-0000-0000-000000000010'::uuid,
  '40000000-0000-0000-0000-000000000011'::uuid,
  '40000000-0000-0000-0000-000000000012'::uuid,
  '40000000-0000-0000-0000-000000000013'::uuid,
  '40000000-0000-0000-0000-000000000014'::uuid,
  '40000000-0000-0000-0000-000000000015'::uuid,
  '40000000-0000-0000-0000-000000000016'::uuid,
  '40000000-0000-0000-0000-000000000017'::uuid,
  '40000000-0000-0000-0000-000000000018'::uuid,
  '40000000-0000-0000-0000-000000000019'::uuid,
  '40000000-0000-0000-0000-000000000020'::uuid,
  '40000000-0000-0000-0000-000000000021'::uuid,
  '40000000-0000-0000-0000-000000000022'::uuid,
  '40000000-0000-0000-0000-000000000023'::uuid,
  '40000000-0000-0000-0000-000000000024'::uuid,
  '40000000-0000-0000-0000-000000000025'::uuid
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000001'::uuid, '{"sub":"40000000-0000-0000-0000-000000000001","email":"anxo.taboada@gmail.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000002'::uuid, '40000000-0000-0000-0000-000000000002'::uuid, '{"sub":"40000000-0000-0000-0000-000000000002","email":"soporte@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000003'::uuid, '40000000-0000-0000-0000-000000000003'::uuid, '{"sub":"40000000-0000-0000-0000-000000000003","email":"robinson.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000004'::uuid, '40000000-0000-0000-0000-000000000004'::uuid, '{"sub":"40000000-0000-0000-0000-000000000004","email":"rcjd.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000005'::uuid, '40000000-0000-0000-0000-000000000005'::uuid, '{"sub":"40000000-0000-0000-0000-000000000005","email":"rcez.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000006'::uuid, '40000000-0000-0000-0000-000000000006'::uuid, '{"sub":"40000000-0000-0000-0000-000000000006","email":"rcsn.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000007'::uuid, '40000000-0000-0000-0000-000000000007'::uuid, '{"sub":"40000000-0000-0000-0000-000000000007","email":"rcvd.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000008'::uuid, '40000000-0000-0000-0000-000000000008'::uuid, '{"sub":"40000000-0000-0000-0000-000000000008","email":"rcqr.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000009'::uuid, '40000000-0000-0000-0000-000000000009'::uuid, '{"sub":"40000000-0000-0000-0000-000000000009","email":"rcbt.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000010'::uuid, '40000000-0000-0000-0000-000000000010'::uuid, '{"sub":"40000000-0000-0000-0000-000000000010","email":"maria.recepcion@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000011'::uuid, '40000000-0000-0000-0000-000000000011'::uuid, '{"sub":"40000000-0000-0000-0000-000000000011","email":"juan.mantenimiento@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000012'::uuid, '40000000-0000-0000-0000-000000000012'::uuid, '{"sub":"40000000-0000-0000-0000-000000000012","email":"ana.limpieza@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000013'::uuid, '40000000-0000-0000-0000-000000000013'::uuid, '{"sub":"40000000-0000-0000-0000-000000000013","email":"pedro.cocina@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000014'::uuid, '40000000-0000-0000-0000-000000000014'::uuid, '{"sub":"40000000-0000-0000-0000-000000000014","email":"laura.animacion@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000015'::uuid, '40000000-0000-0000-0000-000000000015'::uuid, '{"sub":"40000000-0000-0000-0000-000000000015","email":"carlos.rrhh@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000016'::uuid, '40000000-0000-0000-0000-000000000016'::uuid, '{"sub":"40000000-0000-0000-0000-000000000016","email":"roberto.seguridad@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000017'::uuid, '40000000-0000-0000-0000-000000000017'::uuid, '{"sub":"40000000-0000-0000-0000-000000000017","email":"elena.cocina@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000018'::uuid, '40000000-0000-0000-0000-000000000018'::uuid, '{"sub":"40000000-0000-0000-0000-000000000018","email":"beatriz.mantenimiento@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000019'::uuid, '40000000-0000-0000-0000-000000000019'::uuid, '{"sub":"40000000-0000-0000-0000-000000000019","email":"tui.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000020'::uuid, '40000000-0000-0000-0000-000000000020'::uuid, '{"sub":"40000000-0000-0000-0000-000000000020","email":"tmlf.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000021'::uuid, '40000000-0000-0000-0000-000000000021'::uuid, '{"sub":"40000000-0000-0000-0000-000000000021","email":"tmlcal.admin@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000022'::uuid, '40000000-0000-0000-0000-000000000022'::uuid, '{"sub":"40000000-0000-0000-0000-000000000022","email":"lisa.recepcion@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000023'::uuid, '40000000-0000-0000-0000-000000000023'::uuid, '{"sub":"40000000-0000-0000-0000-000000000023","email":"max.cocina@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000024'::uuid, '40000000-0000-0000-0000-000000000024'::uuid, '{"sub":"40000000-0000-0000-0000-000000000024","email":"sophie.animacion@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz),
  (gen_random_uuid(), '40000000-0000-0000-0000-000000000025'::uuid, '40000000-0000-0000-0000-000000000025'::uuid, '{"sub":"40000000-0000-0000-0000-000000000025","email":"david.recepcion@hoteldocs.com"}'::jsonb, 'email', '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz, '2024-01-15T10:00:00Z'::timestamptz);

-- ============================================================
-- FIN DEL SCRIPT DEFINITIVO
-- ============================================================