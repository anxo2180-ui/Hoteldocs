# Configuración Resend (Emails) para HotelDocs

> **Tiempo estimado:** 15 minutos  
> **Coste:** Gratuito (100 emails/día)  
> **URL:** https://resend.com

---

## Paso 1: Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com).
2. Haz clic en **"Sign up"**.
3. Regístrate con tu email (puedes usar `admin@hoteldocs.com` o tu email personal).
4. Confirma tu email mediante el enlace que recibirás.

---

## Paso 2: Obtener el dominio de onboarding (resend.dev)

Para empezar rápidamente sin verificar un dominio propio:

1. En el dashboard de Resend, ve a **Domains**.
2. Verás un dominio automático tipo `tudominio.resend.dev` (para pruebas).
3. También puedes verificar tu propio dominio más adelante.

> **Para producción real:** Verifica un dominio propio (ej. `hoteldocs.com`) siguiendo las instrucciones DNS que te dará Resend.

---

## Paso 3: Crear API Key

1. Ve a **API Keys** en la barra lateral de Resend.
2. Haz clic en **"Create API Key"**.
3. Configura:
   - **Name:** `HotelDocs Production`
   - **Permission:** `Sending access` (solo envío, no administración)
   - **Domains:** Selecciona tu dominio
4. Haz clic en **"Create"**.
5. **Copia la API key** (`re_...`). Solo se muestra una vez.

> 🔒 Guarda esta key en tu `.env` como `VITE_RESEND_API_KEY`.

---

## Paso 4: Template de Email para Alarmas

Guarda este HTML como referencia. Se usa en la Edge Function de Supabase:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Documento - HotelDocs</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1e40af; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .content { padding: 32px; color: #333; }
    .content h2 { color: #1e40af; font-size: 18px; margin-top: 0; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .alert-box p { margin: 0; font-weight: 600; color: #92400e; }
    .button { display: inline-block; background: #1e40af; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 16px; font-weight: 600; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏨 HotelDocs</h1>
      <p>Sistema de Gestión Documental</p>
    </div>
    <div class="content">
      <h2>📋 Recordatorio de Documento</h2>
      <p>Hola,</p>
      <p>Este es un recordatorio automático del sistema <strong>HotelDocs</strong>.</p>
      
      <div class="alert-box">
        <p>⚠️ El documento "<strong>{{documentTitle}}</strong>" requiere tu atención.</p>
        <p style="margin-top:8px; font-weight:normal;">Fecha de recordatorio: <strong>{{reminderDate}}</strong></p>
      </div>
      
      <p>Por favor, revisa el documento y toma las acciones necesarias.</p>
      
      <a href="{{appUrl}}/documents/{{documentId}}" class="button">Ver Documento</a>
    </div>
    <div class="footer">
      <p>HotelDocs © {{year}} — Gestión documental para cadenas hoteleras</p>
      <p>Este email fue enviado automáticamente. No respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
```

---

## Paso 5: Edge Function de Supabase para enviar emails

### 5.1 Instalar Supabase CLI (si no lo tienes)

```bash
# macOS
brew install supabase/tap/supabase

# Windows (con scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux (script)
curl -fsSL https://cli.supabase.com/install | sh
```

### 5.2 Inicializar Edge Functions en tu proyecto

```bash
# Dentro del directorio de tu proyecto frontend
supabase login
supabase init
supabase functions new send-alarm-email
```

### 5.3 Código de la Edge Function

Crea/modifica `supabase/functions/send-alarm-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const APP_URL = Deno.env.get('APP_URL') || 'https://hoteldocs.vercel.app'

serve(async (req) => {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { alarmId, documentTitle, reminderDate, emailRecipients, documentId } = await req.json()

  if (!emailRecipients || emailRecipients.length === 0) {
    return new Response('No recipients', { status: 400 })
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recordatorio - HotelDocs</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1e40af; color: #fff; padding: 24px; text-align: center; }
    .content { padding: 32px; color: #333; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
    .button { display: inline-block; background: #1e40af; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>HotelDocs</h1></div>
    <div class="content">
      <h2>Recordatorio de Documento</h2>
      <p>El documento "<strong>${documentTitle}</strong>" requiere tu atención.</p>
      <div class="alert">Fecha de recordatorio: <strong>${new Date(reminderDate).toLocaleDateString('es-ES')}</strong></div>
      <a href="${APP_URL}/documents/${documentId}" class="button">Ver Documento</a>
    </div>
    <div class="footer">
      <p>HotelDocs — Gestión documental para cadenas hoteleras</p>
    </div>
  </div>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'HotelDocs <alarmas@resend.dev>',
      to: emailRecipients,
      subject: `🔔 Recordatorio: ${documentTitle}`,
      html,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Resend error:', data)
    return new Response(JSON.stringify({ error: data }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, id: data.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 5.4 Configurar variables de entorno de la Edge Function

1. Ve al dashboard de Supabase > **Edge Functions** > **Manage secrets**.
2. Añade:
   - `RESEND_API_KEY` = `re_...` (tu API key de Resend)
   - `APP_URL` = `https://hoteldocs.vercel.app` (tu URL de producción)

### 5.5 Desplegar la Edge Function

```bash
supabase functions deploy send-alarm-email --project-ref TU_PROJECT_REF
```

> Tu `PROJECT_REF` es la parte de la URL: `https://TU_PROJECT_REF.supabase.co`

### 5.6 Invocar la Edge Function (desde frontend o cron)

```typescript
const { data, error } = await supabase.functions.invoke('send-alarm-email', {
  body: {
    alarmId: 'uuid-alarm',
    documentTitle: 'Manual de Limpieza',
    reminderDate: '2025-07-01',
    emailRecipients: ['admin@hoteldocs.com'],
    documentId: 'uuid-doc',
  },
})
```

---

## Paso 6: Programar disparo automático de alarmas (opcional avanzado)

Para que las alarmas se envíen automáticamente cuando llega la fecha:

1. **Opción A - Cron job externo:** Usa un servicio como cron-job.org para hacer un POST a una Edge Function diariamente.

2. **Opción B - pg_cron (Supabase Pro):** En planes pagos puedes usar `pg_cron` para ejecutar una función SQL que llame a la Edge Function.

3. **Opción C - Trigger en tabla:** Crea un trigger que se dispare cuando se crea una alarma con fecha próxima.

> En el plan Free, la **Opción A** es la más práctica. Programa un cron gratuito que llame diariamente a tu Edge Function de procesamiento de alarmas.

---

## Límites del plan gratuito de Resend

| Recurso | Límite |
|---------|--------|
| Emails/día | 100 |
| Dominios | 1 (resend.dev) |
| API Keys | 10 |

> **Nota:** 100 emails/día son suficientes para el sistema de alarmas de un hotel o cadena pequeña. Para escalar, verifica tu dominio propio y contrata un plan de pago.

---

## Siguiente paso

Configura las variables de entorno en `.env` y despliega en Vercel siguiendo `DEPLOY.md`.
