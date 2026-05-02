-- ============================================================
-- HotelDocs - Fix Definitivo para Login con Supabase
-- ============================================================
-- Ejecutar esto en Supabase SQL Editor después de schema.sql y seed.sql
-- Resuelve: inconsistencia de contraseñas, sync auth.users↔public.users,
-- y asegura que el flujo completo de autenticación funcione.
-- ============================================================

-- ============================================================
-- 1. NORMALIZAR CONTRASEÑAS (todos los usuarios demo → 'demo123')
-- ============================================================
-- Problema: los usuarios master tenían contraseñas diferentes
-- ('Z12041984z_' y 'HotelDocs2024!') mientras el frontend asumía 'demo123'.
-- Esto causaba que Supabase Auth rechazara el login y el código caía
-- silenciosamente al fallback localStorage (o mostraba "credenciales incorrectas").

UPDATE auth.users
SET encrypted_password = crypt('demo123', gen_salt('bf'))
WHERE email IN (
  'anxo.taboada@gmail.com',
  'soporte@hoteldocs.com',
  'robinson.admin@hoteldocs.com',
  'rcjd.admin@hoteldocs.com',
  'rcez.admin@hoteldocs.com',
  'rcsn.admin@hoteldocs.com',
  'rcvd.admin@hoteldocs.com',
  'rcqr.admin@hoteldocs.com',
  'rcbt.admin@hoteldocs.com',
  'maria.recepcion@hoteldocs.com',
  'juan.mantenimiento@hoteldocs.com',
  'ana.limpieza@hoteldocs.com',
  'pedro.cocina@hoteldocs.com',
  'laura.animacion@hoteldocs.com',
  'carlos.rrhh@hoteldocs.com',
  'roberto.seguridad@hoteldocs.com',
  'elena.cocina@hoteldocs.com',
  'beatriz.mantenimiento@hoteldocs.com',
  'tui.admin@hoteldocs.com',
  'tmlf.admin@hoteldocs.com',
  'tmlcal.admin@hoteldocs.com',
  'lisa.recepcion@hoteldocs.com',
  'max.cocina@hoteldocs.com',
  'sophie.animacion@hoteldocs.com',
  'david.recepcion@hoteldocs.com'
);

-- ============================================================
-- 2. ASEGURAR CAMPOS MÍNIMOS EN auth.users (GoTrue compatibility)
-- ============================================================
-- GoTrue (Supabase Auth) espera ciertos valores por defecto para
-- que signInWithPassword funcione correctamente cuando se insertan
-- usuarios directamente en la tabla.

UPDATE auth.users
SET
  confirmation_sent_at = COALESCE(confirmation_sent_at, created_at),
  confirmed_at         = COALESCE(confirmed_at, email_confirmed_at, created_at),
  is_sso_user          = COALESCE(is_sso_user, false),
  role                 = COALESCE(role, 'authenticated'),
  aud                  = COALESCE(aud, 'authenticated'),
  raw_app_meta_data    = COALESCE(raw_app_meta_data, '{}'),
  confirmation_token   = COALESCE(confirmation_token, ''),
  recovery_token       = COALESCE(recovery_token, ''),
  email_change_token_new     = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token   = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 0)
WHERE email LIKE '%@hoteldocs.com'
   OR email = 'anxo.taboada@gmail.com';

-- ============================================================
-- 3. SINCRONIZACIÓN AUTOMÁTICA: auth.users → public.users
-- ============================================================
-- Cada vez que se cree un usuario en auth.users (vía signUp,
-- invite o inserción directa), esta función crea/actualiza
-- automáticamente su perfil en public.users.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_role TEXT;
BEGIN
  -- Extraer nombre desde raw_user_meta_data o usar email como fallback
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  -- Rol por defecto: 'user' (a menos que venga en metadata)
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    client_id,
    center_ids,
    department_id,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    (NEW.raw_user_meta_data->>'client_id')::uuid,
    COALESCE((NEW.raw_user_meta_data->'center_ids')::jsonb, '[]'::jsonb),
    (NEW.raw_user_meta_data->>'department_id')::uuid,
    true,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    name         = EXCLUDED.name,
    role         = EXCLUDED.role,
    updated_at   = NOW();

  RETURN NEW;
END;
$$;

-- Trigger: se ejecuta después de INSERT en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. FORZAR SYNC DE USUARIOS EXISTENTES (por si el trigger no corrió)
-- ============================================================
-- Asegura que TODO usuario en auth.users tenga su fila en public.users.
-- Si el seed.sql se ejecutó correctamente, esto no hará nada (ON CONFLICT).
-- Si algún usuario falta, lo crea con valores por defecto seguros.

INSERT INTO public.users (id, email, name, role, client_id, center_ids, department_id, is_active, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1), 'Usuario'),
  COALESCE(au.raw_user_meta_data->>'role', 'user'),
  (au.raw_user_meta_data->>'client_id')::uuid,
  COALESCE((au.raw_user_meta_data->'center_ids')::jsonb, '[]'::jsonb),
  (au.raw_user_meta_data->>'department_id')::uuid,
  true,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. VERIFICACIÓN RÁPIDA (puedes comentar esto en producción)
-- ============================================================
-- SELECT email, name, role, is_active
-- FROM public.users
-- ORDER BY role, email;

-- ============================================================
-- Fix complete — login debería funcionar ahora
-- ============================================================
