
# INFORME DE REVISIÓN: Sistema de Internacionalización (i18n)

## 1. ESTRUCTURA DE ARCHIVOS i18n

### Archivos existentes
| Archivo | Descripción |
|---------|-------------|
| `src/i18n/index.tsx` | Provider + hooks (I18nProvider, useI18n, useTranslation) |
| `src/i18n/types.ts` | Tipos: Lang, Translations, Namespace, I18nContextType |
| `src/i18n/locales/es.ts` | Español (idioma primario) |
| `src/i18n/locales/en.ts` | Inglés |
| `src/i18n/locales/de.ts` | Alemán |

**Total: 5 archivos** (3 archivos de traducción + 2 de infraestructura)

### Namespaces cubiertos
| Namespace | es.ts | en.ts | de.ts | ¿Completo? |
|-----------|-------|-------|-------|------------|
| `common` | 24 keys | 24 keys | 24 keys | Parcial |
| `navigation` | 14 keys | 14 keys | 14 keys | Parcial |
| `login` | 12 keys | 12 keys | 12 keys | Parcial |
| `dashboard` | 6 keys | 6 keys | 6 keys | Parcial |

**Total keys por idioma: 56**

---

## 2. ESTADO DEL SISTEMA i18n: **INCOMPLETO**

### LoginPage.tsx
| Aspecto | Estado |
|---------|--------|
| Usa `useTranslation('login')` | ✅ Sí |
| Keys usadas cubiertas por traducciones | ✅ Sí (title, emailLabel, emailPlaceholder, passwordLabel, passwordPlaceholder, submitButton, demoCredentials, masterAdmin, groupAdmin, hotelAdmin, user) |

### AppShell.tsx
| Aspecto | Estado |
|---------|--------|
| Selector ES/EN/DE presente | ✅ Sí (líneas 170-184) |
| Usa `useTranslation('navigation')` | ✅ Sí |
| Usa `useTranslation('common')` | ✅ Sí |

---

## 3. TEXTOS HARDCODED ENCONTRADOS (CRÍTICO)

### LoginPage.tsx — 15 textos hardcoded
```
Línea 124: "Supabase URL o Anon Key no están definidos en las variables de entorno."
Línea 146: "Credenciales incorrectas. Verifica tu email y contraseña."
Línea 147: "Error de autenticación: ..."
Línea 152: "No se pudo obtener el usuario después de la autenticación."
Línea 164: "No se pudo cargar tu perfil de usuario. Contacta al administrador."
Línea 171-172: "Tu cuenta de autenticación existe pero no tiene perfil asociado..."
Línea 178: "Tu cuenta está desactivada. Contacta al administrador."
Línea 207: "Credenciales incorrectas."
Línea 245: "Error inesperado al iniciar sesión."
Línea 277: "HotelDocs" (nombre de app — aceptable)
Línea 392-394: "Conectado a Supabase" / "Modo demo offline (sin Supabase)"
```

### AppShell.tsx — 2 keys faltantes en traducciones
```
Línea 100: tCommon('close') → NO existe en common namespace
Línea 150: tCommon('open') → NO existe en common namespace
```

### DashboardPage.tsx — ~40+ textos hardcoded
```
Línea 186: "Documentos totales"
Línea 195: "Aprobados en vigor"
Línea 204: "Pendientes"
Línea 213: "Alarmas esta semana"
Línea 192, 201, 210: Trend textos hardcoded ("+12 este mes", "92% del total", "Revisar →")
Línea 249: "Uso de almacenamiento"
Línea 268-269: t('spaceUsage'), t('spaceUsed') → USAN traducción ✅
Línea 296: "Documentos por estado"
Línea 299: "Aprobado", "Pendiente", "Borrador", "Descatalogado"
Línea 325: "Documentos por temática"
Línea 340: "Sin datos"
Línea 358: "Nuevo documento"
Línea 365: "Gestionar usuarios"
Línea 372: "Crear centro"
Línea 379: "Ver log"
Línea 391: "Actividad reciente"
Línea 396: "Sin actividad reciente"
Línea 402-405: Columnas "Fecha", "Usuario", "Acción", "Documento/Entidad"
Línea 442: "Ver todo el log →"
Línea 458: "Alarmas próximas"
Línea 461: "Ver todas →"
Línea 466: "No hay alarmas configuradas"
Línea 474: "Hoy", "En X días"
Línea 509: "Documentos recientes"
Línea 514: "No hay documentos"
Línea 515: "Empieza creando un nuevo documento"
Línea 521-524: Columnas "Título", "Estado", "Versión", "Modificado"
Línea 47-65: formatDate/formatDateTime usan hardcoded 'es-ES' locale
```

### DocumentsPage.tsx — NO usa i18n (0 traducciones, todo hardcoded)
```
Línea 223: "Documentos"
Línea 225: "Gestiona y consulta todos los manuales y procedimientos"
Línea 234: "Nuevo documento"
Línea 253: "Buscar por título..."
Línea 265: "Todos los temas"
Línea 283: "Todos los centros"
Línea 301: "Todos los departamentos"
Línea 318: "Todas las visibilidades"
Línea 340: "Solo aprobados en vigor"
Línea 350: "Limpiar"
Línea 360: "Buscar: ...", "Tema: ...", "Centro: ...", "Dept: ..."
Línea 392: "Visibilidad: Privado/Todos/Público QR"
Línea 400: "Solo visibles"
Línea 413: "No hay documentos"
Línea 417: "Prueba ajustando los filtros"
Línea 426: "Título", "Tema", "Centro", "Fecha apr.", "Dept", "Visibilidad", "Estado", "Visible", "Acciones"
Línea 491: "Público QR", "Todos", "Privado"
Línea 510: "Ocultar documento", "Mostrar documento"
Línea 528: "Ver documento"
Línea 534: "Descargando... se añadirá marca de agua"
Línea 537: "Descargar documento"
Línea 545: "Editar documento"
Línea 168: "Visibilidad actualizada"
Línea 170: "Error al actualizar visibilidad"
```

### DocumentViewerPage.tsx — NO usa i18n (todo hardcoded)
```
Línea 36: "Documento no encontrado"
Línea 63: "Cargando documento..."
Línea 74: "Documento no encontrado" (título + descripción)
Línea 93: "Conversión IA"
Línea 110-113: "Aprobado", "Borrador", "Pendiente", "Descontinuado"
Línea 115: "Versión X"
Línea 118: "Aprobado el ..."
Línea 131: "Versión Wiki"
Línea 135: "Versión Firmada"
Línea 143: "Contenido wiki"
Línea 151: "Descargar como PDF"
Línea 170: "Versión certificada original"
Línea 185: "PDF original certificado"
Línea 195: "Descargar versión certificada"
Línea 203: Watermark text hardcoded
Línea 219: "No hay versión firmada asociada..."
Línea 233: "Adjuntos adicionales"
Línea 248: Toast messages hardcoded
```

### AdminTopicsPage.tsx — NO usa i18n (todo hardcoded)
```
Línea 202: "Gestión de Temas"
Línea 205: "Organiza los documentos por áreas de conocimiento"
Línea 213: "Nuevo Tema"
Línea 221: "Buscar tema por nombre..."
Línea 232: "Cargando temas..."
Línea 237: "No hay temas configurados"
Línea 238: "Crea tu primera temática..."
Línea 245: "Crear tema"
Línea 254: "Nombre", "Descripción", "Orden", "Documentos", "Acciones"
Línea 293: "—"
Línea 343: "Editar tema" / "Nuevo tema"
Línea 390: "Cancelar"
Línea 397: "Guardar cambios" / "Crear tema"
Línea 414: "¿Eliminar tema?"
Línea 418: Warning text
Línea 427: "Cancelar"
Línea 433: "Eliminar tema"
```

### AdminLogPage.tsx — NO usa i18n (todo hardcoded)
```
Línea 220: "Log de Auditoría"
Línea 224: "Registro inmutable de todas las acciones..."
Línea 233: "Exportar CSV"
Línea 240: "Este registro es inmutable..."
Línea 248: "Buscar por usuario, acción o entidad..."
Línea 281: "Limpiar"
Línea 289: "Cargando registros..."
Línea 294: "No hay registros en el log"
Línea 295: "Las acciones aparecerán aquí automáticamente"
Línea 302-315: Columnas "Fecha", "Usuario", "Acción", "Entidad", "Detalles"
Línea 384: "registro" / "registros"
Línea 64-99: actionConfig hardcoded en español ("Creó", "Actualizó", "Eliminó", "Aprobó", "Cambió estado", "Asignó")
Línea 120-128: entityLabel hardcoded en español ("Documento", "Centro", "Usuario", "Tema", "Alarma")
Línea 188: CSV headers hardcoded
Línea 33: date-fns locale hardcoded to `es`
```

### AdminUsersPage.tsx — NO usa i18n (todo hardcoded)
```
Línea 91-116: roleBadge() y roleLabel() hardcoded en español
Línea 300, 305, 319, 323, 337: Audit log entries hardcoded
Línea 530: "Gestión de Usuarios"
Línea 534-537: Descripción según rol hardcoded
Línea 545: "Nuevo Usuario"
Línea 552: "Total", "Activos", "Admins", "Usuarios"
Línea 574: "Buscar por nombre o email..."
Línea 586: "Cargando usuarios..."
Línea 591: "No hay usuarios"
Línea 592: "No se encontraron usuarios con los filtros actuales"
Línea 599: "Nuevo usuario"
Línea 620: "Staff de Plataforma"
Línea 687: "Editar usuario" / "Nuevo usuario"
Línea 699-829: Todos los labels del formulario hardcoded
```

### AdminDocumentEditorPage.tsx — NO usa i18n (todo hardcoded)
```
Línea 96: "Documento no encontrado"
Línea 107: "El título es obligatorio"
Línea 111: "Selecciona un tema y un centro"
Línea 145: "Carlos Administrador"
Línea 149: "Creó el documento ..."
```

---

## 4. RESUMEN DE COBERTURA POR PÁGINA

| Página | Usa i18n | % Textos Traducidos | Estado |
|--------|----------|---------------------|--------|
| LoginPage.tsx | ✅ login | ~60% | Parcial |
| AppShell.tsx | ✅ navigation, common | ~85% | Parcial |
| DashboardPage.tsx | ✅ dashboard | ~10% | Crítico |
| DocumentsPage.tsx | ❌ Ninguno | 0% | Crítico |
| DocumentViewerPage.tsx | ❌ Ninguno | 0% | Crítico |
| AdminTopicsPage.tsx | ❌ Ninguno | 0% | Crítico |
| AdminLogPage.tsx | ❌ Ninguno | 0% | Crítico |
| AdminUsersPage.tsx | ❌ Ninguno | 0% | Crítico |
| AdminDocumentEditorPage.tsx | ❌ Ninguno | 0% | Crítico |

---

## 5. PROBLEMAS ESPECÍFICOS ENCONTRADOS

### A. Keys faltantes en traducciones
- `common.close` — Usado en AppShell.tsx pero NO existe en traducciones
- `common.open` — Usado en AppShell.tsx pero NO existe en traducciones

### B. Nombres de roles hardcoded (deberían ir en common)
- "Master", "Client Admin", "Hotel Admin", "Usuario" aparecen en badges y labels

### C. Fechas hardcoded a locale español
- `toLocaleDateString('es-ES')` en DashboardPage.tsx, DocumentsPage.tsx
- `date-fns/locale/es` en AdminLogPage.tsx

### D. Namespace `login` incompleto
- Faltan traducciones para mensajes de error de autenticación
- Faltan traducciones para el indicador de modo (Supabase/Demo)

### E. Namespace `common` incompleto
- Faltan: close, open, documents, approved, pending, draft, discontinued, delete, etc.

---

## 6. RECOMENDACIONES DE MEJORA

### Prioridad ALTA (antes de release)
1. **Crear namespace `documents`** con todas las keys de DocumentsPage.tsx
2. **Crear namespace `viewer`** para DocumentViewerPage.tsx
3. **Crear namespace `editor`** para AdminDocumentEditorPage.tsx
4. **Crear namespace `topics`** para AdminTopicsPage.tsx
5. **Crear namespace `users`** para AdminUsersPage.tsx
6. **Crear namespace `log`** para AdminLogPage.tsx
7. **Añadir keys faltantes a `login`**: error messages, modo indicator
8. **Añadir keys a `common`**: close, open, document, total, approved, pending, draft, discontinued, yes, no, confirm, warning, role names, etc.
9. **Añadir keys a `dashboard`**: todos los textos de KPIs, charts, botones, tablas, alarmas

### Prioridad MEDIA
10. **Refactorizar formatDate** para usar el locale del idioma seleccionado en lugar de 'es-ES' hardcoded
11. **Refactorizar date-fns locale** en AdminLogPage.tsx
12. **Refactorizar `roleBadge` y `roleLabel`** para usar traducciones
13. **Refactorizar `entityLabel` y `actionConfig`** en AdminLogPage.tsx para usar traducciones

### Prioridad BAJA
14. **Añadir soporte para interpolación/pluralización** en el sistema t() para manejar "registro/registros", "Hoy/En X días"
15. **Consolidar namespaces** si hay duplicación (evaluar si `topics`, `users`, `log` pueden compartir un namespace `admin`)
16. **Considerar usar una librería i18n más robusta** (react-i18next, i18next) si el sistema crece — el sistema actual es suficiente para la app actual pero limitado en features como pluralización e interpolación

### Estimación de esfuerzo
- **Para alcanzar 100% cobertura**: ~400-500 nuevas keys de traducción (3 idiomas = ~1200-1500 strings)
- **Tiempo estimado**: 2-3 días de trabajo dedicado
