## FLUJO DE DATOS LOGIN -> DASHBOARD - INFORME FINAL

### RESUMEN EJECUTIVO

Se completo el rastreo completo del flujo de datos desde login hasta dashboard. Se identificaron **9 problemas** y se aplicaron **correcciones** a todos. La aplicacion compila correctamente (`tsc --noEmit` sin errores).

---

### 1. ESTRUCTURA DE `hoteldocs_auth` EN LOCALSTORAGE

LoginPage guarda el siguiente objeto JSON (estructura PLANA):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nombre Usuario",
  "role": "master|clientAdmin|hotelAdmin|user",
  "clientId": "uuid|null",
  "centerIds": ["uuid", ...],
  "departmentId": "uuid|null"
}
```

**Campos:** id, email, name, role, clientId, centerIds, departmentId

---

### 2. FUNCIONES `getAuthFromStorage()` Y `getAuthUser()`

| Funcion | Ubicacion | Retorno | Maneja no-logueado |
|---------|-----------|---------|-------------------|
| `getAuthFromStorage()` | `api-local.ts:57` | `{id, name, role, clientId?, centerIds?, departmentId?} \| null` | Si, retorna `null` |
| `getAuthUser()` | `api-local.ts:70` | `{id, name, role: UserRole, clientId, centerIds, departmentId} \| null` | Si, retorna `null` |

Ambas validan: `raw` no sea `null`/`undefined`/`'null'`/`'undefined'`, parseo JSON valido, y que `parsed.id` exista.

---

### 3. FLUJO COMPLETO RASTREADO

```
1. LoginPage.handleSubmit()
   -> Si Supabase OK: loginWithSupabase()
      -> Autentica -> Lee perfil public.users -> Guarda hoteldocs_auth
      -> navigate('/dashboard')
   -> Si NO Supabase: loginLocal()
      -> Busca en DEMO_USERS -> Guarda hoteldocs_auth
      -> navigate('/dashboard')

2. App.tsx rutas (AHORA con RequireAuth)
   -> /public/:id siempre accesible
   -> /dashboard requiere auth (cualquier rol)
   -> /admin/* requiere auth + rol admin permitido
   -> /master/* requiere auth + rol 'master'

3. RequireAuth.tsx (nuevo componente)
   -> Si no hay auth -> redirect a /login
   -> Si allowedRoles y rol no permitido -> redirect a /dashboard
   -> Si no cumple -> no renderiza nada (evita flash)

4. AppShell.tsx
   -> Lee role y name de localStorage
   -> Muestra/oculta menus segun rol
   -> Muestra info de usuario + boton Cerrar sesion
   -> Logout: removeItem('hoteldocs_auth') + navigate('/login')

5. DashboardPage.tsx
   -> Carga datos via API (getDocuments, getAlarms, getAuditLog, getTopics)
   -> Muestra KPIs, graficos, actividad reciente, alarmas
```

---

### 4. RUTAS Y ESTADO FINAL

| Ruta | Proteccion | Estado |
|------|-----------|--------|
| / | Publica | Funciona |
| /login | Publica | Funciona |
| /dashboard | RequireAuth (cualquier rol) | Protegida |
| /documents | RequireAuth (cualquier rol) | Protegida |
| /documents/:id | RequireAuth (cualquier rol) | Protegida |
| /admin/centers | RequireAuth + [master,clientAdmin,hotelAdmin] | Protegida |
| /admin/users | RequireAuth + [master,clientAdmin,hotelAdmin] | Protegida |
| /admin/topics | RequireAuth + [master,clientAdmin,hotelAdmin] | Protegida |
| /admin/documents | RequireAuth + [master,clientAdmin,hotelAdmin] | Protegida |
| /admin/documents/:id/edit | RequireAuth + [master,clientAdmin,hotelAdmin] | Protegida |
| /admin/departments | RequireAuth + [master,clientAdmin,hotelAdmin] | Protegida |
| /admin/alarms | RequireAuth + [master,clientAdmin,hotelAdmin] | Protegida |
| /admin/log | RequireAuth (cualquier rol) | Protegida |
| /master/* | RequireAuth + ['master'] | Protegida |
| /public/:id | Publica | Funciona |

---

### 5. PROBLEMAS ENCONTRADOS Y CORREGIDOS

#### PROBLEMA 1: DashboardPage `AuthData` interface INCORRECTA (CORREGIDO)
```typescript
// ANTES: role: 'admin' | 'user', centerId: string
// AHORA: role: 'master'|'clientAdmin'|'hotelAdmin'|'user', clientId, centerIds[], departmentId
```

#### PROBLEMA 2: AdminDocumentsPage `useAdminGuard` estructura incorrecta (CORREGIDO)
```typescript
// ANTES: buscaba auth.user.role === 'admin' (estructura anidada inexistente)
// AHORA: busca auth.role en ['master','clientAdmin','hotelAdmin']
```

#### PROBLEMA 3: AdminAlarmsPage mismo bug que #2 (CORREGIDO)

#### PROBLEMA 4: AdminCentersPage buscaba `role === 'admin'` (CORREGIDO)
```typescript
// ANTES: if (!auth || auth.role !== 'admin') -> bloqueaba a TODOS
// AHORA: if (!auth || !['master','clientAdmin','hotelAdmin'].includes(auth.role))
```

#### PROBLEMA 5: AdminTopicsPage buscaba `role === 'admin'` (CORREGIDO)

#### PROBLEMA 6: AdminLogPage buscaba `role === 'admin'` (CORREGIDO)
```typescript
// ANTES: audit log solo para 'admin'
// AHORA: visible para cualquier usuario logueado (solo requiere auth)
```

#### PROBLEMA 7: App.tsx NO TENIA guards de ruta (CORREGIDO)
```typescript
// ANTES: Todas las rutas eran publicas, cada pagina manejaba su propio guard
// AHORA: Componente RequireAuth centralizado envuelve rutas protegidas
```

#### PROBLEMA 8: No habia funcionalidad de LOGOUT (CORREGIDO)
```typescript
// ANTES: No habia boton de logout, signOut() de Supabase no limpiaba localStorage
// AHORA: Boton "Cerrar sesion" en sidebar + handleLogout() limpia hoteldocs_auth
```

#### PROBLEMA 9: AppShell renderizaba sidebar sin auth (CORREGIDO indirectamente)
```typescript
// ANTES: Acceso directo a /dashboard mostraba AppShell con sidebar vacio antes de redirect
// AHORA: RequireAuth en App.tsx evita renderizar AppShell sin auth (no hay flash)
```

---

### 6. ARCHIVOS MODIFICADOS

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregado RequireAuth en todas las rutas protegidas |
| `src/components/RequireAuth.tsx` | **NUEVO** — Guard de ruta centralizado |
| `src/components/AppShell.tsx` | Agregado logout, info de usuario, imports LogOut/User |
| `src/pages/DashboardPage.tsx` | Corregida interfaz AuthData |
| `src/pages/AdminDocumentsPage.tsx` | Corregido useAdminGuard |
| `src/pages/AdminAlarmsPage.tsx` | Corregido useAdminGuard |
| `src/pages/AdminCentersPage.tsx` | Corregido guard de rol |
| `src/pages/AdminTopicsPage.tsx` | Corregido guard de rol |
| `src/pages/AdminLogPage.tsx` | Corregido guard — ahora accesible para todos logueados |

---

### 7. VERIFICACION DE COMPILACION

```bash
npx tsc --noEmit
# Resultado: sin errores
```

---

### 8. FLUJO CORREGIDO — PASO A PASO

1. **Usuario escribe credenciales** en LoginPage
2. **LoginPage** valida contra Supabase o DEMO_USERS
3. **Guarda** `hoteldocs_auth` con estructura plana `{id, email, name, role, clientId, centerIds, departmentId}`
4. **Navega** a `/dashboard`
5. **App.tsx** — `RequireAuth` verifica localStorage
   - Si no hay auth → redirect a `/login` (sin flash de UI)
   - Si hay auth → renderiza `AppShell` + `DashboardPage`
6. **AppShell** lee `role` y `name` de localStorage
   - Muestra sidebar con menus filtrados por rol
   - Muestra info de usuario + boton Cerrar sesion
7. **DashboardPage** lee auth, carga datos via API, muestra KPIs y contenido
8. **Cierre de sesion** → `localStorage.removeItem('hoteldocs_auth')` → redirect a `/login`
