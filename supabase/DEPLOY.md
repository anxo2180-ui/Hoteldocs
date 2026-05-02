# Guía de Deploy - Vercel + GitHub

> **Tiempo estimado:** 10 minutos  
> **Coste:** Gratuito (100 GB bandwidth/mes)  
> **URLs:** https://vercel.com | https://github.com

---

## Paso 1: Crear repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new).
2. Configura:
   - **Repository name:** `hoteldocs` (o el nombre que prefieras)
   - **Description:** `Sistema de gestión documental para cadenas hoteleras`
   - **Visibility:** Public (gratuito)
   - ✅ **Add a README file** (opcional)
   - **.gitignore:** Node
   - **License:** MIT (opcional)
3. Haz clic en **"Create repository"**.

---

## Paso 2: Subir el código al repositorio

### Si tienes el código localmente:

```bash
# 1. Inicializar Git (si no está inicializado)
cd /ruta/a/tu/proyecto-hoteldocs
git init

# 2. Añadir el remoto de GitHub
git remote add origin https://github.com/TU_USUARIO/hoteldocs.git

# 3. Añadir todos los archivos
git add .

# 4. Primer commit
git commit -m "feat: inicializa HotelDocs - gestión documental hotelera"

# 5. Subir a GitHub
git branch -M main
git push -u origin main
```

### Si empiezas desde cero:

1. Clona el repositorio:
```bash
git clone https://github.com/TU_USUARIO/hoteldocs.git
cd hoteldocs
```

2. Copia tu código al directorio.
3. Sigue los pasos 3-5 de arriba.

---

## Paso 3: Conectar Vercel al repositorio

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New Project"** (botón azul).
3. En **Import Git Repository**, busca `hoteldocs`.
4. Haz clic en **"Import"**.

---

## Paso 4: Configurar el deploy

1. **Project Name:** `hoteldocs` (o el que prefieras)
2. **Framework Preset:** Selecciona **Vite** (debe detectarse automáticamente)
3. **Root Directory:** `./` (raíz del proyecto)
4. **Build and Output Settings:**
   - **Build Command:** `npm run build` (o `vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Haz clic en **"Deploy"**.

Vercel comenzará el build. Espera ~1-2 minutos.

---

## Paso 5: Configurar variables de entorno en Vercel

1. Una vez desplegado, ve al dashboard de Vercel > tu proyecto.
2. Ve a la pestaña **Settings** > **Environment Variables**.
3. Añade las variables una por una:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://abcdefghijklmnop.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon public key | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_RESEND_API_KEY` | API key de Resend | `re_xxxxxxxxxxxxxxxx...` |
| `VITE_APP_URL` | URL de la app en Vercel | `https://hoteldocs.vercel.app` |

4. Haz clic en **"Save"**.
5. Ve a **Deployments** y haz clic en los tres puntos (...) > **"Redeploy"** para aplicar las variables.

---

## Paso 6: Verificar el deploy

1. Abre la URL que Vercel te proporciona (ej. `https://hoteldocs.vercel.app`).
2. Comprueba que:
   - La app carga correctamente
   - Puedes iniciar sesión con el usuario admin
   - Los documentos se cargan desde Supabase
   - Las alarmas funcionan

---

## Paso 7: Dominio personalizado (Opcional)

### Configurar dominio propio en Vercel:

1. Dashboard de Vercel > tu proyecto > **Settings** > **Domains**.
2. Escribe tu dominio: `docs.tuhotel.com` (ejemplo).
3. Haz clic en **"Add"**.
4. Vercel te dará registros DNS (CNAME o A).
5. Ve a tu proveedor de dominios (Namecheap, GoDaddy, Cloudflare...) y añade los registros.
6. Espera a la propagación DNS (puede tardar hasta 24 horas, normalmente 5 minutos).

> **Ventajas del dominio personalizado:**
> - Imagen profesional para la cadena hotelera
> - Mejor para emails (evita spam)
> - SSL gratuito incluido en Vercel

---

## Límites del plan Free de Vercel

| Recurso | Límite |
|---------|--------|
| Despliegues | Ilimitados |
| Bandwidth | 100 GB/mes |
| Funciones Serverless | 100 GB-hrs/mes |
| Build time | 6000 min/mes |
| Dominios personalizados | 1 gratis |
| SSL | Gratuito e ilimitado |

> **Para un sistema de gestión documental:** Estos límites son más que suficientes. 100 GB de bandwidth equivalen a ~millones de visitas mensuales.

---

## Actualizaciones futuras (CI/CD automático)

Una vez configurado, cualquier `git push` a la rama `main` desencadena automáticamente un nuevo deploy en Vercel:

```bash
# Trabaja en una rama de feature
git checkout -b feature/nuevo-modulo
# ... haz cambios ...
git add .
git commit -m "feat: añade módulo de reportes"
git push origin feature/nuevo-modulo

# Crea Pull Request en GitHub
# Vercel despliega una Preview URL automáticamente

# Mergea a main
git checkout main
git merge feature/nuevo-modulo
git push origin main

# 🚀 Vercel despliega automáticamente a producción
```

---

## Solución de problemas comunes

### "Build failed" en Vercel
- Verifica que `vite` está en `devDependencies` o `dependencies`.
- Comprueba que `npm run build` funciona localmente.
- Revisa que las variables de entorno están correctamente configuradas.

### "Cannot find module" o errores de import
- Verifica que `tsconfig.json` tiene los `paths` configurados correctamente.
- Asegúrate de que `@/` apunta a `./src`.

### App en blanco / 404
- Verifica que `vercel.json` no redirige incorrectamente.
- Comprueba que `dist/index.html` existe tras el build.
- En Vercel > Settings > General > Framework Preset debe ser **Vite**.

### Errores de CORS con Supabase
- Ve al dashboard de Supabase > Authentication > URL Configuration.
- Añade tu dominio de Vercel en **Site URL** y **Redirect URLs**.

---

## Resumen del flujo de deploy

```
GitHub (código)
    ↓ push
Vercel (build + deploy automático)
    ↓ conecta
Supabase (datos + auth + storage)
    ↓ envía emails
Resend (notificaciones de alarmas)
```

---

## Coste total (infraestructura gratuita)

| Servicio | Plan | Coste mensual |
|----------|------|---------------|
| GitHub | Public repos | **0 EUR** |
| Vercel | Hobby | **0 EUR** |
| Supabase | Free tier | **0 EUR** |
| Resend | Free tier | **0 EUR** |
| **TOTAL** | | **0 EUR/mes** |

> Escalable cuando crezca: Supabase Pro (~25 EUR/mes), Resend Pro (~20 EUR/mes).
