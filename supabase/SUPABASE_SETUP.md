# Guía de Configuración Supabase para HotelDocs

> **Tiempo estimado:** 20 minutos  
> **Coste:** Gratuito (plan Free)  
> **URL:** https://supabase.com

---

## Paso 1: Crear cuenta y proyecto gratuito

1. Ve a [https://supabase.com](https://supabase.com) y haz clic en **"Start your project"**.
2. Inicia sesión con GitHub (recomendado) o crea una cuenta con email.
3. Haz clic en **"New project"**.
4. Configura el proyecto:
   - **Organization:** Personal (o crea una nueva)
   - **Project name:** `hoteldocs-prod`
   - **Database password:** Genera una contraseña segura y guárdala en un gestor de contraseñas
   - **Region:** `West Europe (Ireland)` o `West Europe (London)` (más cercano a España)
   - **Pricing plan:** **Free tier** (0 EUR/mes)
5. Haz clic en **"Create new project"**.
6. Espera ~2 minutos a que se aprovisione la base de datos.

---

## Paso 2: Ejecutar el Schema SQL

1. En el panel de Supabase, ve a **SQL Editor** (barra lateral izquierda).
2. Haz clic en **"New query"**.
3. Copia y pega TODO el contenido del archivo `schema.sql`.
4. Haz clic en **"Run"** (botón verde arriba a la derecha).
5. Verifica que no hay errores. Deberías ver mensajes de éxito.

> **Nota:** Si ves errores de "duplicate_object" en los enums, son normales si ejecutas varias veces. El schema está preparado para ser idempotente.

---

## Paso 3: Crear el Storage Bucket "documents"

1. Ve a **Storage** en la barra lateral.
2. Haz clic en **"New bucket"**.
3. Configura:
   - **Name:** `documents`
   - **Public bucket:** ✅ **Marcar como público** (necesario para acceso directo a URLs de archivos)
   - **File size limit:** 50 MB (recomendado)
   - **Allowed MIME types:** `image/*, application/pdf` (opcional)
4. Haz clic en **"Save"**.

### Configurar políticas del bucket (CRÍTICO)

1. Dentro del bucket `documents`, ve a la pestaña **"Policies"**.
2. Crea estas 3 políticas:

#### Política 1: Lectura pública
- **Policy name:** `Public read access`
- **Allowed operation:** `SELECT`
- **Target:** `objects`
- **Policy definition:** `true`
- **Role:** `anon` y `authenticated`

#### Política 2: Escritura autenticados
- **Policy name:** `Authenticated upload`
- **Allowed operation:** `INSERT`
- **Target:** `objects`
- **Policy definition:** `true`
- **Role:** `authenticated`

#### Política 3: Borrado autenticados
- **Policy name:** `Authenticated delete`
- **Allowed operation:** `DELETE`
- **Target:** `objects`
- **Policy definition:** `true`
- **Role:** `authenticated`

> ⚠️ En producción real, restringe estas políticas con checks de rol de admin.

---

## Paso 4: Configurar Autenticación (Auth)

1. Ve a **Authentication** > **Providers** en la barra lateral.
2. Asegúrate de que **Email** está habilitado.
3. Configura Email:
   - **Confirm email:** ❌ **Desactivar** (para demo, los usuarios no necesitan confirmar email)
   - **Secure email change:** Sí (recomendado)
   - **Double confirm to change:** Sí
4. Desactiva todos los demás providers (Google, GitHub, etc.) si no los necesitas.

---

## Paso 5: Obtener las credenciales de conexión

1. Ve al icono de **engranaje (Settings)** en la barra lateral inferior.
2. Ve a **API** (bajo Project Settings).
3. Copia estos valores:
   - **Project URL:** `https://xxxx.supabase.co` → tu `SUPABASE_URL`
   - **Project API keys** → Anon public: `eyJ...` → tu `SUPABASE_ANON_KEY`

> 🔒 **IMPORTANTE:** El `SUPABASE_ANON_KEY` es seguro para el frontend. Nunca expongas el `service_role` key.

---

## Paso 6: Crear usuario admin inicial

### Opción A: Por SQL (rápido para demo)

1. Ve a **SQL Editor** > **New query**.
2. Ejecuta el seed SQL del archivo `seed.sql` (o al menos la parte de usuarios y centros).

### Opción B: Por interfaz de Auth

1. Ve a **Authentication** > **Users**.
2. Haz clic en **"Add user"** > **"Create new user"**.
3. Introduce:
   - **Email:** `admin@hoteldocs.com`
   - **Password:** `HotelAdmin123!`
   - **Auto-confirm:** ✅ Marcar
4. Haz clic en **"Create user"**.
5. Copia el **UUID** del usuario creado (aparece en la lista de usuarios).
6. Ve a **SQL Editor** y ejecuta:

```sql
-- Reemplaza 'UUID-AQUI' con el UUID real del usuario creado
INSERT INTO public.users (id, email, name, role, center_id, is_active)
VALUES (
    'UUID-AQUI',
    'admin@hoteldocs.com',
    'Administrador HotelDocs',
    'admin',
    (SELECT id FROM public.centers WHERE code = 'HMB'),
    true
);
```

> **Nota:** También puedes ejecutar todo el `seed.sql` de una vez para poblar centros, temas, usuarios y documentos de ejemplo.

---

## Paso 7: Verificar la configuración

1. Ve a **Table Editor** y comprueba que las tablas existen:
   - `centers`, `users`, `topics`, `documents`, `document_attachments`, `document_versions`, `audit_logs`, `alarms`
2. Ve a **Authentication** > **Policies** y verifica que las políticas RLS están activas.
3. Comprueba que la función `handle_updated_at()` existe en **Database** > **Functions**.

---

## Límites del plan Free de Supabase

| Recurso | Límite |
|---------|--------|
| Base de datos | 500 MB |
| Storage | 1 GB |
| Transferencia | 2 GB/mes |
| Edge Functions | 2M invocaciones/mes |
| Usuarios autenticados | Ilimitados |
| Conexiones simultáneas | 30 |

> **Para empezar:** Estos límites son más que suficientes para un sistema de gestión documental con varios hoteles y cientos de documentos.

---

## Solución de problemas comunes

### "permission denied for schema public"
- Asegúrate de ejecutar el SQL como `postgres` o con permisos de administrador.
- En Supabase Cloud, el SQL Editor siempre tiene permisos suficientes.

### "relation does not exist"
- Ejecuta el schema.sql completo antes de hacer queries.
- Verifica que estás en el schema `public`.

### RLS bloquea SELECT inesperadamente
- Verifica que el usuario está autenticado (la columna `id` en `public.users` coincide con `auth.uid()`).
- Comprueba que el usuario tiene `role = 'admin'` o está en el centro correcto.

---

## Siguiente paso

Dirígete a `RESEND_SETUP.md` para configurar el envío de emails de alarmas.
