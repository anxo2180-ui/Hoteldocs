# HotelDocs - Conexión Supabase

## Estado actual
La app funciona 100% con **localStorage** (demo/local). Supabase está preparado pero **no conectado**.

## Qué necesitas para conectar Supabase

### 1. Crear proyecto en Supabase (gratuito)
1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto (nombre: `hoteldocs`)
3. Espera a que termine el provisioning (1-2 minutos)

### 2. Ejecutar el schema SQL
1. En el Dashboard de Supabase, ve a **SQL Editor**
2. Crea una **New query**
3. Pega todo el contenido de `hoteldocs-infra/schema.sql`
4. Ejecuta (Click **Run**)

### 3. Ejecutar el seed SQL
1. Crea otra **New query**
2. Pega todo el contenido de `hoteldocs-infra/seed.sql`
3. Ejecuta

### 4. Configurar Storage Bucket
1. Ve a **Storage** > **New bucket**
2. Nombre: `documents`
3. Marca **Public bucket**
4. Crea las políticas de storage (ver comentarios al final de `schema.sql`)

### 5. Obtener credenciales
1. Ve a **Project Settings** > **API**
2. Copia:
   - **URL** (ej: `https://abcdefgh12345678.supabase.co`)
   - **anon public** key

### 6. Configurar la app

#### A. Instalar dependencia
```bash
cd app
npm install @supabase/supabase-js
```

#### B. Copiar el cliente
```bash
cp hoteldocs-infra/supabase-client.ts app/src/data/supabase-client.ts
```

#### C. Crear `.env`
```bash
cp app/.env.example app/.env
```
Edita `app/.env` y rellena:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

#### D. Cambiar la API a modo dual
Edita `app/src/data/api.ts` y añade al principio:
```typescript
import { isSupabaseConfigured } from './supabase-client'
// ... delegar a Supabase cuando isSupabaseConfigured sea true
```
O usa el archivo `api-dual.ts` (si existe) como drop-in replacement.

### 7. Rebuild y redeploy
```bash
cd app
npm run build
# Subir dist/ a Vercel
```

## Schema actualizado
El schema incluye todas las funcionalidades recientes:
- **Multi-tenant**: tabla `clients` con licencias
- **Jerarquía 4 roles**: `master`, `clientAdmin`, `hotelAdmin`, `user`
- **Departamentos dinámicos**: tabla `departments` por cliente
- **Multi-centro**: `center_ids` JSONB en `users` y `documents`
- **Visibilidad**: `private | all | public`
- **RLS completo**: cada rol ve solo lo que debe ver
- **Triggers**: auto-versionado de documentos, updated_at automático

## Seed incluye
- 2 usuarios master (Anxo Taboada + soporte)
- 2 clientes (Robinson Hotels, TUI Magic Life)
- 8 centros/hoteles (RCJD, RCEZ, RCSN, RCVD, RCQR, RCBT, TMLF, TMLCAL)
- 11 departamentos
- 25 usuarios en total
- 10 documentos de ejemplo
- 3 audit logs + 2 alarmas

