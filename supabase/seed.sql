-- ============================================================
-- HotelDocs - Seed Data (Idempotent)
-- ============================================================
-- Run this in Supabase SQL Editor after schema.sql
-- All INSERTs use ON CONFLICT (id) DO NOTHING for idempotency
-- ============================================================

-- ============================================================
-- 1. auth.users (25 total: 2 masters + 23 demo users)
-- ============================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  -- MASTERS (2)
  ('40000000-0000-0000-0000-000000000001'::uuid, 'anxo.taboada@gmail.com', crypt('Z12041984z_', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Anxo Taboada"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000002'::uuid, 'soporte@hoteldocs.com', crypt('HotelDocs2024!', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Master Soporte"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  -- ROBINSON CLIENT ADMIN (1)
  ('40000000-0000-0000-0000-000000000003'::uuid, 'robinson.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Robinson Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  -- ROBINSON HOTEL ADMINS (6)
  ('40000000-0000-0000-0000-000000000004'::uuid, 'rcjd.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"RCJD Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000005'::uuid, 'rcez.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"RCEZ Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000006'::uuid, 'rcsn.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"RCSN Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000007'::uuid, 'rcvd.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"RCVD Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000008'::uuid, 'rcqr.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"RCQR Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000009'::uuid, 'rcbt.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"RCBT Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  -- ROBINSON USERS (9)
  ('40000000-0000-0000-0000-000000000010'::uuid, 'maria.recepcion@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Maria Recepcionista"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000011'::uuid, 'juan.mantenimiento@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Juan Mantenimiento"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000012'::uuid, 'ana.limpieza@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Ana Limpieza"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000013'::uuid, 'pedro.cocina@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Pedro Cocina"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000014'::uuid, 'laura.animacion@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Laura Animacion"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000015'::uuid, 'carlos.rrhh@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Carlos RRHH"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000016'::uuid, 'roberto.seguridad@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Roberto Seguridad"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000017'::uuid, 'elena.cocina@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Elena Cocina"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000018'::uuid, 'beatriz.mantenimiento@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Beatriz Mantenimiento"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  -- TUI CLIENT ADMIN (1)
  ('40000000-0000-0000-0000-000000000019'::uuid, 'tui.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"TUI Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  -- TUI HOTEL ADMINS (2)
  ('40000000-0000-0000-0000-000000000020'::uuid, 'tmlf.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"TMLF Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000021'::uuid, 'tmlcal.admin@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"TMLCAL Admin"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  -- TUI USERS (4)
  ('40000000-0000-0000-0000-000000000022'::uuid, 'lisa.recepcion@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Lisa Recepcionista"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000023'::uuid, 'max.cocina@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Max Cocina"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000024'::uuid, 'sophie.animacion@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"Sophie Animacion"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000025'::uuid, 'david.recepcion@hoteldocs.com', crypt('demo123', gen_salt('bf')), '2024-01-15T10:00:00Z', '{"name":"David Recepcion"}', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. clients (2)
-- ============================================================
INSERT INTO clients (id, name, email, contact_name, contact_phone, license_type, license_expiry, max_hotels, max_users, active_hotels, active_users, status, monthly_fee, notes, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, 'Grupo Robinson Hotels', 'operations@robinson.com', 'Hans Mueller', '+34 928 123 456', 'enterprise', '2026-12-31T23:59:59Z', 10, 200, 6, 89, 'active', 299, '', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'Grupo TUI Magic Life', 'admin@tuimagiclife.com', 'Claudia Schmidt', '+34 928 987 654', 'professional', '2026-06-30T23:59:59Z', 5, 100, 2, 34, 'active', 149, '', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. departments (11 total)
-- ============================================================
INSERT INTO departments (id, client_id, name, code, created_at)
VALUES
  -- Robinson (client-1)
  ('20000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'Cocina', 'COC', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'Recepcion', 'REC', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000003'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'Recursos Humanos', 'RRHH', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000004'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'Limpieza', 'LIM', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000005'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'Mantenimiento', 'MANT', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000006'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'Todos los departamentos', 'TODOS', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000007'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'Animacion', 'ANIM', '2024-01-15T10:00:00Z'),
  -- TUI (client-2)
  ('20000000-0000-0000-0000-000000000008'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'Cocina', 'COC', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000009'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'Recepcion', 'REC', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000010'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'Animacion', 'ANIM', '2024-01-15T10:00:00Z'),
  ('20000000-0000-0000-0000-000000000011'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'Todos los departamentos', 'TODOS', '2024-01-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. centers (8 hotels)
-- ============================================================
INSERT INTO centers (id, client_id, name, code, status, created_at, updated_at)
VALUES
  -- Robinson (6 centers)
  ('30000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'RCJD Jandia', 'RCJD', 'active', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'RCEZ Esquinzo', 'RCEZ', 'active', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000003'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'RCSN Cala Serena', 'RCSN', 'active', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000004'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'RCVD Cabo Verde', 'RCVD', 'active', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000005'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'RCQR Quinta da Ria', 'RCQR', 'active', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000006'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, 'RCBT Boavista', 'RCBT', 'paused', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  -- TUI (2 centers)
  ('30000000-0000-0000-0000-000000000007'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'TMLF Fuerteventura', 'TMLF', 'active', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000008'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, 'TMLCAL Cala Pada', 'TMLCAL', 'active', '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. users (25 profiles — id REFERENCES auth.users(id))
-- ============================================================
INSERT INTO users (id, email, name, role, client_id, center_ids, department_id, is_active, created_at, updated_at)
VALUES
  -- MASTERS (2, no client, empty centers, no department)
  ('40000000-0000-0000-0000-000000000001'::uuid, 'anxo.taboada@gmail.com', 'Anxo Taboada', 'master', NULL, '[]'::jsonb, NULL, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000002'::uuid, 'soporte@hoteldocs.com', 'Master Soporte', 'master', NULL, '[]'::jsonb, NULL, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),

  -- ROBINSON CLIENT ADMIN (1, all 6 centers, dept TODOS)
  ('40000000-0000-0000-0000-000000000003'::uuid, 'robinson.admin@hoteldocs.com', 'Robinson Admin', 'clientAdmin', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000001","30000000-0000-0000-0000-000000000002","30000000-0000-0000-0000-000000000003","30000000-0000-0000-0000-000000000004","30000000-0000-0000-0000-000000000005","30000000-0000-0000-0000-000000000006"]'::jsonb,
   '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),

  -- ROBINSON HOTEL ADMINS (6, each their own center, dept TODOS)
  ('40000000-0000-0000-0000-000000000004'::uuid, 'rcjd.admin@hoteldocs.com', 'RCJD Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000001"]'::jsonb, '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000005'::uuid, 'rcez.admin@hoteldocs.com', 'RCEZ Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000002"]'::jsonb, '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000006'::uuid, 'rcsn.admin@hoteldocs.com', 'RCSN Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000003"]'::jsonb, '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000007'::uuid, 'rcvd.admin@hoteldocs.com', 'RCVD Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000004"]'::jsonb, '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000008'::uuid, 'rcqr.admin@hoteldocs.com', 'RCQR Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000005"]'::jsonb, '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000009'::uuid, 'rcbt.admin@hoteldocs.com', 'RCBT Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000006"]'::jsonb, '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),

  -- ROBINSON USERS (9, various centers and departments)
  ('40000000-0000-0000-0000-000000000010'::uuid, 'maria.recepcion@hoteldocs.com', 'Maria Recepcionista', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000001"]'::jsonb, '20000000-0000-0000-0000-000000000002'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000011'::uuid, 'juan.mantenimiento@hoteldocs.com', 'Juan Mantenimiento', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000002"]'::jsonb, '20000000-0000-0000-0000-000000000005'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000012'::uuid, 'ana.limpieza@hoteldocs.com', 'Ana Limpieza', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000003"]'::jsonb, '20000000-0000-0000-0000-000000000004'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000013'::uuid, 'pedro.cocina@hoteldocs.com', 'Pedro Cocina', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000004"]'::jsonb, '20000000-0000-0000-0000-000000000001'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000014'::uuid, 'laura.animacion@hoteldocs.com', 'Laura Animacion', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000005"]'::jsonb, '20000000-0000-0000-0000-000000000007'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000015'::uuid, 'carlos.rrhh@hoteldocs.com', 'Carlos RRHH', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000006"]'::jsonb, '20000000-0000-0000-0000-000000000003'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000016'::uuid, 'roberto.seguridad@hoteldocs.com', 'Roberto Seguridad', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000001"]'::jsonb, '20000000-0000-0000-0000-000000000006'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000017'::uuid, 'elena.cocina@hoteldocs.com', 'Elena Cocina', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000002"]'::jsonb, '20000000-0000-0000-0000-000000000001'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000018'::uuid, 'beatriz.mantenimiento@hoteldocs.com', 'Beatriz Mantenimiento', 'user', '10000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000003"]'::jsonb, '20000000-0000-0000-0000-000000000005'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),

  -- TUI CLIENT ADMIN (1, both centers, dept TUI TODOS)
  ('40000000-0000-0000-0000-000000000019'::uuid, 'tui.admin@hoteldocs.com', 'TUI Admin', 'clientAdmin', '10000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000007","30000000-0000-0000-0000-000000000008"]'::jsonb,
   '20000000-0000-0000-0000-000000000011'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),

  -- TUI HOTEL ADMINS (2, each their own center, dept TUI TODOS)
  ('40000000-0000-0000-0000-000000000020'::uuid, 'tmlf.admin@hoteldocs.com', 'TMLF Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000007"]'::jsonb, '20000000-0000-0000-0000-000000000011'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000021'::uuid, 'tmlcal.admin@hoteldocs.com', 'TMLCAL Admin', 'hotelAdmin', '10000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000008"]'::jsonb, '20000000-0000-0000-0000-000000000011'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),

  -- TUI USERS (4)
  ('40000000-0000-0000-0000-000000000022'::uuid, 'lisa.recepcion@hoteldocs.com', 'Lisa Recepcionista', 'user', '10000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000007"]'::jsonb, '20000000-0000-0000-0000-000000000009'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000023'::uuid, 'max.cocina@hoteldocs.com', 'Max Cocina', 'user', '10000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000008"]'::jsonb, '20000000-0000-0000-0000-000000000008'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000024'::uuid, 'sophie.animacion@hoteldocs.com', 'Sophie Animacion', 'user', '10000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000007"]'::jsonb, '20000000-0000-0000-0000-000000000010'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000025'::uuid, 'david.recepcion@hoteldocs.com', 'David Recepcion', 'user', '10000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000008"]'::jsonb, '20000000-0000-0000-0000-000000000009'::uuid, true, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. topics (6)
-- ============================================================
INSERT INTO topics (id, name, description, order_index, created_at, updated_at)
VALUES
  ('50000000-0000-0000-0000-000000000001'::uuid, 'Limpieza', 'Protocolos y manuales de limpieza', 1, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('50000000-0000-0000-0000-000000000002'::uuid, 'Recepcion', 'Procedimientos de recepcion y atencion al cliente', 2, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('50000000-0000-0000-0000-000000000003'::uuid, 'Mantenimiento', 'Guias de mantenimiento de instalaciones', 3, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('50000000-0000-0000-0000-000000000004'::uuid, 'Seguridad', 'Protocolos de seguridad y emergencias', 4, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('50000000-0000-0000-0000-000000000005'::uuid, 'RRHH', 'Politicas de recursos humanos', 5, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
  ('50000000-0000-0000-0000-000000000006'::uuid, 'Calidad', 'Estandares de calidad y certificaciones', 6, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. documents (10)
-- ============================================================
INSERT INTO documents (id, title, content, topic_id, center_ids, client_id, department_id, visibility, status, version, approval_date, is_visible, source_type, created_by, created_at, updated_at)
VALUES
  -- Doc 1: Manual Limpieza Habitaciones
  ('60000000-0000-0000-0000-000000000001'::uuid, 'Manual Limpieza Habitaciones',
   '<h1>Manual de Limpieza de Habitaciones</h1><p>Este manual establece los procedimientos estandar para la limpieza diaria y profunda de las habitaciones en todos los centros Robinson.</p><h2>Procedimiento Diario</h2><p>Cada habitacion debe ser revisada y limpiada siguiendo el checklist de 25 puntos: camas, banos, superficies, suelos y reposicion de amenities.</p><h2>Productos Autorizados</h2><p>Utilizar exclusivamente los productos de limpieza eco-certificados proporcionados por el almacen central. Verificar fechas de caducidad antes de cada uso.</p>',
   '50000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000001","30000000-0000-0000-0000-000000000002"]'::jsonb,
   '10000000-0000-0000-0000-000000000001'::uuid,
   '20000000-0000-0000-0000-000000000004'::uuid,
   'private', 'approved', 3, '2024-03-15T14:30:00Z', true, 'manual',
   '40000000-0000-0000-0000-000000000003'::uuid,
   '2024-02-01T09:00:00Z', '2024-03-15T14:30:00Z'),

  -- Doc 2: Protocolo Check-in
  ('60000000-0000-0000-0000-000000000002'::uuid, 'Protocolo Check-in',
   '<h1>Protocolo de Check-in</h1><p>Procedimiento estandar para el registro de huespedes en todos los centros Robinson. El objetivo es garantizar una experiencia de llegada fluida y profesional.</p><h2>Pasos del Proceso</h2><p>1. Verificar reserva en el sistema PMS. 2. Solicitar documentacion de identidad. 3. Procesar pago de deposito si aplica. 4. Entregar llave/tarjeta y mapa del resort. 5. Explicar horarios de restaurantes y actividades.</p><h2>Atencion VIP</h2><p>Para huespedes VIP o con reservas premium, ofrecer welcome drink y acompanamiento personalizado hasta la habitacion.</p>',
   '50000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000001","30000000-0000-0000-0000-000000000002","30000000-0000-0000-0000-000000000003","30000000-0000-0000-0000-000000000004","30000000-0000-0000-0000-000000000005","30000000-0000-0000-0000-000000000006"]'::jsonb,
   '10000000-0000-0000-0000-000000000001'::uuid,
   '20000000-0000-0000-0000-000000000002'::uuid,
   'all', 'approved', 2, '2024-04-10T16:00:00Z', true, 'manual',
   '40000000-0000-0000-0000-000000000003'::uuid,
   '2024-02-05T11:00:00Z', '2024-04-10T16:00:00Z'),

  -- Doc 3: Guia Mantenimiento Aire
  ('60000000-0000-0000-0000-000000000003'::uuid, 'Guia Mantenimiento Aire Acondicionado',
   '<h1>Guia de Mantenimiento de Aire Acondicionado</h1><p>Manual tecnico para el mantenimiento preventivo y correctivo de los sistemas de climatizacion del hotel RCJD Jandia.</p><h2>Mantenimiento Preventivo</h2><p>Realizar limpieza de filtros cada 15 dias. Verificar niveles de refrigerante mensualmente. Inspeccionar ductos y registros trimestralmente.</p><h2>Procedimiento de Emergencia</h2><p>En caso de fallo total, activar ventiladores de emergencia y contactar al proveedor autorizado dentro de las 2 horas siguientes.</p>',
   '50000000-0000-0000-0000-000000000003'::uuid,
   '["30000000-0000-0000-0000-000000000001"]'::jsonb,
   '10000000-0000-0000-0000-000000000001'::uuid,
   '20000000-0000-0000-0000-000000000005'::uuid,
   'private', 'pending', 1, NULL, false, 'manual',
   '40000000-0000-0000-0000-000000000011'::uuid,
   '2024-03-01T08:00:00Z', '2024-03-01T08:00:00Z'),

  -- Doc 4: Protocolo Emergencia Incendio
  ('60000000-0000-0000-0000-000000000004'::uuid, 'Protocolo Emergencia Incendio',
   '<h1>Protocolo de Emergencia por Incendio</h1><p>Documento critico que establece las acciones a seguir en caso de incendio en cualquiera de los centros Robinson. Debe conocerse por todo el personal.</p><h2>Activacion de Alarma</h2><p>Al detectar fuego o humo, activar inmediatamente la alarma general y llamar al numero de emergencias interno. Nunca asumir que ya ha sido reportado.</p><h2>Evacuacion</h2><p>Seguir las rutas de evacuacion senalizadas. Priorizar la evacuacion de huespedes con movilidad reducida. Reunirse en el punto de encuentro designado y realizar censo.</p><h2>Comunicacion</h2><p>El director de centro comunicara oficialmente con bomberos y autoridades. Ningun otro empleado debe hablar con medios.</p>',
   '50000000-0000-0000-0000-000000000004'::uuid,
   '["30000000-0000-0000-0000-000000000001","30000000-0000-0000-0000-000000000002","30000000-0000-0000-0000-000000000003","30000000-0000-0000-0000-000000000004","30000000-0000-0000-0000-000000000005","30000000-0000-0000-0000-000000000006"]'::jsonb,
   '10000000-0000-0000-0000-000000000001'::uuid,
   '20000000-0000-0000-0000-000000000006'::uuid,
   'public', 'approved', 4, '2024-05-01T12:00:00Z', true, 'manual',
   '40000000-0000-0000-0000-000000000003'::uuid,
   '2024-01-20T10:00:00Z', '2024-05-01T12:00:00Z'),

  -- Doc 5: Politica Vacaciones
  ('60000000-0000-0000-0000-000000000005'::uuid, 'Politica de Vacaciones',
   '<h1>Politica de Vacaciones del Personal</h1><p>Regulacion de los dias de vacaciones, permisos y ausencias para todo el personal de Grupo Robinson Hotels.</p><h2>Derechos</h2><p>Cada empleado tiene derecho a 22 dias laborables de vacaciones al ano. El periodo debe solicitarse con al menos 30 dias de antelacion.</p><h2>Restricciones Temporada Alta</h2><p>Durante los meses de julio y agosto, las solicitudes de vacaciones estan sujetas a aprobacion del director de RRHH debido a la alta ocupacion.</p>',
   '50000000-0000-0000-0000-000000000005'::uuid,
   '["30000000-0000-0000-0000-000000000001","30000000-0000-0000-0000-000000000002","30000000-0000-0000-0000-000000000003","30000000-0000-0000-0000-000000000004","30000000-0000-0000-0000-000000000005","30000000-0000-0000-0000-000000000006"]'::jsonb,
   '10000000-0000-0000-0000-000000000001'::uuid,
   '20000000-0000-0000-0000-000000000003'::uuid,
   'private', 'approved', 2, '2024-03-20T11:00:00Z', true, 'manual',
   '40000000-0000-0000-0000-000000000015'::uuid,
   '2024-02-10T09:30:00Z', '2024-03-20T11:00:00Z'),

  -- Doc 6: Estandares ISO 9001
  ('60000000-0000-0000-0000-000000000006'::uuid, 'Estandares ISO 9001',
   '<h1>Estandares de Calidad ISO 9001</h1><p>Documento de referencia para la certificacion y mantenimiento de los estandares de calidad ISO 9001 en todos los centros Robinson.</p><h2>Principios</h2><p>Enfoque al cliente, liderazgo, involucramiento del personal, enfoque basado en procesos, mejora continua, toma de decisiones basada en evidencia y gestion de relaciones.</p><h2>Auditorias</h2><p>Las auditorias internas se realizan semestralmente. La proxima auditoria externa esta programada para el Q4 2025.</p>',
   '50000000-0000-0000-0000-000000000006'::uuid,
   '["30000000-0000-0000-0000-000000000001","30000000-0000-0000-0000-000000000002","30000000-0000-0000-0000-000000000003","30000000-0000-0000-0000-000000000004","30000000-0000-0000-0000-000000000005","30000000-0000-0000-0000-000000000006"]'::jsonb,
   '10000000-0000-0000-0000-000000000001'::uuid,
   '20000000-0000-0000-0000-000000000006'::uuid,
   'private', 'draft', 1, NULL, false, 'manual',
   '40000000-0000-0000-0000-000000000003'::uuid,
   '2024-04-01T10:00:00Z', '2024-04-01T10:00:00Z'),

  -- Doc 7: Manual Limpieza Cocina
  ('60000000-0000-0000-0000-000000000007'::uuid, 'Manual Limpieza Cocina',
   '<h1>Manual de Limpieza de Cocina</h1><p>Protocolos de higiene y limpieza para las cocinas del hotel RCJD Jandia. Cumplimiento obligatorio de normativas HACCP.</p><h2>Limpieza Diaria</h2><p>Limpiar y desinfectar todas las superficies de trabajo, utensilios y equipos despues de cada servicio. Registrar temperaturas de neveras dos veces al dia.</p><h2>Desinfeccion Semanal</h2><p>Realizar limpieza profunda de campanas extractores, suelos y zonas dificiles de acceso. Usar productos desengrasantes autorizados.</p>',
   '50000000-0000-0000-0000-000000000001'::uuid,
   '["30000000-0000-0000-0000-000000000001"]'::jsonb,
   '10000000-0000-0000-0000-000000000001'::uuid,
   '20000000-0000-0000-0000-000000000001'::uuid,
   'private', 'approved', 2, '2024-03-10T09:00:00Z', true, 'manual',
   '40000000-0000-0000-0000-000000000013'::uuid,
   '2024-02-15T08:00:00Z', '2024-03-10T09:00:00Z'),

  -- Doc 8: Manual Animacion TUI
  ('60000000-0000-0000-0000-000000000008'::uuid, 'Manual de Animacion TUI Magic Life',
   '<h1>Manual de Animacion TUI Magic Life</h1><p>Guia completa para el equipo de animacion de los centros TUI Magic Life Fuerteventura y Cala Pada.</p><h2>Programacion Diaria</h2><p>El equipo de animacion debe ofrecer un minimo de 6 actividades diarias: aquagym, yoga, waterpolo, miniclub, espectaculo nocturno y juegos de grupo.</p><h2>Interaccion con Huespedes</h2><p>Mantener una actitud positiva, inclusiva y respetuosa. Recordar que la animacion es uno de los pilares diferenciadores de la experiencia TUI.</p>',
   '50000000-0000-0000-0000-000000000006'::uuid,
   '["30000000-0000-0000-0000-000000000007","30000000-0000-0000-0000-000000000008"]'::jsonb,
   '10000000-0000-0000-0000-000000000002'::uuid,
   '20000000-0000-0000-0000-000000000010'::uuid,
   'all', 'approved', 1, '2024-03-05T10:00:00Z', true, 'manual',
   '40000000-0000-0000-0000-000000000019'::uuid,
   '2024-03-05T10:00:00Z', '2024-03-05T10:00:00Z'),

  -- Doc 9: Manual Atencion VIP
  ('60000000-0000-0000-0000-000000000009'::uuid, 'Manual de Atencion VIP',
   '<h1>Manual de Atencion a Clientes VIP</h1><p>Protocolo exclusivo para la atencion de huespedes VIP en TUI Magic Life Fuerteventura.</p><h2>Identificacion</h2><p>Los huespedes VIP son identificados automaticamente en el PMS. El jefe de recepcion debe ser notificado antes de la llegada.</p><h2>Servicios Incluidos</h2><p>Check-in privado, upgrade de habitacion cuando disponible, late checkout gratuito, reserva prioritaria en restaurantes a la carta y amenities premium en la habitacion.</p>',
   '50000000-0000-0000-0000-000000000002'::uuid,
   '["30000000-0000-0000-0000-000000000007"]'::jsonb,
   '10000000-0000-0000-0000-000000000002'::uuid,
   '20000000-0000-0000-0000-000000000009'::uuid,
   'private', 'pending', 1, NULL, false, 'manual',
   '40000000-0000-0000-0000-000000000022'::uuid,
   '2024-04-10T11:00:00Z', '2024-04-10T11:00:00Z'),

  -- Doc 10: Protocolo COVID-19 (global, all centers, no client, no dept)
  ('60000000-0000-0000-0000-000000000010'::uuid, 'Protocolo COVID-19',
   '<h1>Protocolo COVID-19 - Uso General</h1><p>Protocolo sanitario aplicable a todos los centros HotelDocs para la prevencion y gestion de brotes de COVID-19.</p><h2>Medidas Generales</h2><p>Mantenimiento de distancia social en areas comunes, disponibilidad de gel hidroalcoholico en todas las zonas, ventilacion natural preferente y limpieza reforzada de superficies de alto contacto.</p><h2>En caso de Positivo</h2><p>Aislar inmediatamente al huesped o empleado afectado. Activar protocolo de desinfeccion de la habitacion o area. Notificar a autoridades sanitarias locales siguiendo la normativa vigente.</p>',
   '50000000-0000-0000-0000-000000000004'::uuid,
   '["30000000-0000-0000-0000-000000000001","30000000-0000-0000-0000-000000000002","30000000-0000-0000-0000-000000000003","30000000-0000-0000-0000-000000000004","30000000-0000-0000-0000-000000000005","30000000-0000-0000-0000-000000000006","30000000-0000-0000-0000-000000000007","30000000-0000-0000-0000-000000000008"]'::jsonb,
   NULL, NULL,
   'public', 'approved', 5, '2024-06-01T10:00:00Z', true, 'manual',
   '40000000-0000-0000-0000-000000000001'::uuid,
   '2024-01-10T09:00:00Z', '2024-06-01T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 8. audit_logs (3)
-- ============================================================
INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details, created_at)
VALUES
  ('70000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000003'::uuid, 'Robinson Admin', 'created', 'document', '60000000-0000-0000-0000-000000000001'::uuid,
   '{"title":"Manual Limpieza Habitaciones"}'::jsonb, '2024-02-01T09:00:00Z'),
  ('70000000-0000-0000-0000-000000000002'::uuid, '40000000-0000-0000-0000-000000000001'::uuid, 'Anxo Taboada', 'created', 'client', '10000000-0000-0000-0000-000000000002'::uuid,
   '{"name":"Grupo TUI Magic Life"}'::jsonb, '2024-01-15T10:30:00Z'),
  ('70000000-0000-0000-0000-000000000003'::uuid, '40000000-0000-0000-0000-000000000003'::uuid, 'Robinson Admin', 'approved', 'document', '60000000-0000-0000-0000-000000000002'::uuid,
   '{"title":"Protocolo Check-in","previous_status":"pending"}'::jsonb, '2024-02-10T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. alarms (2)
-- ============================================================
INSERT INTO alarms (id, document_id, document_title, reminder_date, email_recipients, is_triggered, created_at, updated_at)
VALUES
  ('80000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'Manual Limpieza Habitaciones', '2025-07-01T00:00:00Z',
   '["robinson.admin@hoteldocs.com","maria.recepcion@hoteldocs.com"]'::jsonb, false, '2024-02-01T09:00:00Z', '2024-02-01T09:00:00Z'),
  ('80000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000004'::uuid, 'Protocolo Emergencia Incendio', '2025-06-15T00:00:00Z',
   '["robinson.admin@hoteldocs.com"]'::jsonb, false, '2024-01-20T10:00:00Z', '2024-01-20T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed complete
-- ============================================================
