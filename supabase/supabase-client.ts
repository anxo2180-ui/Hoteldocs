/**
 * HotelDocs - Cliente Supabase preconfigurado (Multi-Tenant)
 * =============================================================
 * Mapea entre snake_case (base de datos) y camelCase (frontend).
 * Todas las operaciones respetan las políticas RLS del schema.sql.
 * Soporta: master | clientAdmin | hotelAdmin | user
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan variables de entorno de Supabase. ' +
    'Asegúrate de definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env'
  )
}

/** Cliente Supabase singleton */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// =============================================================================
// UTILIDADES DE MAPEO snake_case ↔ camelCase
// =============================================================================

/**
 * Convierte una cadena de snake_case a camelCase.
 * Ej: 'center_id' → 'centerId', 'created_at' → 'createdAt'
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

/**
 * Convierte una cadena de camelCase a snake_case.
 * Ej: 'centerId' → 'center_id', 'createdAt' → 'created_at'
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`)
}

/**
 * Convierte recursivamente las claves de un objeto de snake_case a camelCase.
 * Maneja objetos, arrays y valores primitivos.
 */
function snakeToCamel<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item)) as unknown as T
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = toCamelCase(key)
      result[camelKey] = snakeToCamel(value)
    }
    return result as T
  }

  return obj as T
}

/**
 * Convierte recursivamente las claves de un objeto de camelCase a snake_case.
 */
function camelToSnake<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item)) as unknown as T
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = toSnakeCase(key)
      result[snakeKey] = camelToSnake(value)
    }
    return result as T
  }

  return obj as T
}

// =============================================================================
// TIPOS DEL FRONTEND (camelCase)
// =============================================================================

export type UserRole = 'master' | 'clientAdmin' | 'hotelAdmin' | 'user'
export type CenterStatus = 'active' | 'paused'
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'discontinued'
export type DocumentSourceType = 'manual' | 'pdf-import'
export type DocumentVisibility = 'private' | 'all' | 'public'
export type LicenseType = 'basic' | 'professional' | 'enterprise'

export interface Client {
  id: string
  name: string
  email: string
  contactName: string
  contactPhone: string
  licenseType: LicenseType
  licenseExpiry: string
  maxHotels: number
  maxUsers: number
  activeHotels: number
  activeUsers: number
  status: 'active' | 'suspended' | 'trial'
  monthlyFee: number
  notes: string
  createdAt: string
  updatedAt?: string
}

export interface Department {
  id: string
  clientId: string
  name: string
  code: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  clientId: string | null
  centerIds: string[]
  departmentId: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Center {
  id: string
  name: string
  code: string
  clientId: string
  status: CenterStatus
  createdAt: string
  updatedAt?: string
}

export interface Topic {
  id: string
  name: string
  description: string
  orderIndex: number
  createdAt: string
  updatedAt?: string
}

export interface Document {
  id: string
  title: string
  content: string
  topicId: string
  centerIds: string[]
  clientId: string | null
  departmentId: string | null
  visibility: DocumentVisibility
  status: DocumentStatus
  version: number
  approvalDate: string | null
  isVisible: boolean
  sourceType: DocumentSourceType
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DocumentAttachment {
  id: string
  documentId: string
  fileName: string
  fileUrl: string
  fileType: string
  isSignedOriginal: boolean
  createdAt: string
}

export interface DocumentVersion {
  id: string
  documentId: string
  content: string
  version: number
  createdBy: string | null
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId: string
  details: string
  createdAt: string
}

export interface Alarm {
  id: string
  documentId: string
  documentTitle: string
  reminderDate: string
  emailRecipients: string[]
  isTriggered: boolean
  createdAt: string
  updatedAt?: string
}

// =============================================================================
// TIPOS DE INPUT (Omit para creación/actualización)
// =============================================================================

export type ClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
export type DepartmentInput = Omit<Department, 'id' | 'createdAt'>
export type CenterInput = Omit<Center, 'id' | 'createdAt' | 'updatedAt'>
export type TopicInput = Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>
export type AlarmInput = Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>

export type DocumentInput = Omit<
  Document,
  'id' | 'createdAt' | 'updatedAt' | 'version' | 'approvalDate'
>

// Partial inputs para actualización
export type ClientUpdate = Partial<ClientInput>
export type DepartmentUpdate = Partial<DepartmentInput>
export type CenterUpdate = Partial<CenterInput>
export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
export type DocumentUpdate = Partial<DocumentInput>

// =============================================================================
// AUTH
// =============================================================================

/**
 * Iniciar sesión con email y contraseña.
 * Devuelve el usuario de Supabase Auth.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/**
 * Cerrar sesión.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Obtener la sesión actual.
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Obtener el usuario actual (perfil público desde la tabla `users`).
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  return snakeToCamel<User>(data)
}

// =============================================================================
// MULTI-TENANT HELPERS
// =============================================================================

/**
 * Verificar si el usuario actual es master.
 */
export async function isMaster(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'master'
}

/**
 * Verificar si el usuario actual es clientAdmin.
 */
export async function isClientAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'clientAdmin'
}

/**
 * Verificar si el usuario actual es hotelAdmin.
 */
export async function isHotelAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'hotelAdmin'
}

/**
 * Obtener el client_id del usuario actual.
 * Devuelve null para master.
 */
export async function getCurrentClientId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.clientId ?? null
}

/**
 * Obtener los center_ids del usuario actual.
 */
export async function getCurrentCenterIds(): Promise<string[]> {
  const user = await getCurrentUser()
  return user?.centerIds ?? []
}

/**
 * Verificar si el usuario actual pertenece a alguno de los centros dados.
 */
export async function belongsToAnyCenter(centerIds: string[]): Promise<boolean> {
  if (centerIds.length === 0) return false
  const user = await getCurrentUser()
  if (!user || user.centerIds.length === 0) return false
  return user.centerIds.some((id) => centerIds.includes(id))
}

// =============================================================================
// CLIENTS
// =============================================================================

/**
 * Obtener todos los clientes visibles según RLS.
 * Master ve todos; clientAdmin solo su cliente.
 */
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  if (error) throw error
  return snakeToCamel<Client[]>(data ?? [])
}

/**
 * Obtener un cliente por su ID.
 */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return snakeToCamel<Client>(data)
}

/**
 * Crear un nuevo cliente. (Solo master)
 */
export async function createClient(client: ClientInput): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(camelToSnake(client))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Client>(data)
}

/**
 * Actualizar un cliente.
 */
export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(camelToSnake(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Client>(data)
}

/**
 * Eliminar un cliente. (Solo master)
 */
export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// DEPARTMENTS
// =============================================================================

/**
 * Obtener departamentos. Si se pasa clientId, filtra por ese cliente.
 */
export async function getDepartments(clientId?: string): Promise<Department[]> {
  let query = supabase
    .from('departments')
    .select('*')
    .order('name')

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error
  return snakeToCamel<Department[]>(data ?? [])
}

/**
 * Obtener un departamento por su ID.
 */
export async function getDepartmentById(id: string): Promise<Department | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return snakeToCamel<Department>(data)
}

/**
 * Crear un departamento.
 */
export async function createDepartment(dept: DepartmentInput): Promise<Department> {
  const { data, error } = await supabase
    .from('departments')
    .insert(camelToSnake(dept))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Department>(data)
}

/**
 * Actualizar un departamento.
 */
export async function updateDepartment(
  id: string,
  updates: DepartmentUpdate
): Promise<Department> {
  const { data, error } = await supabase
    .from('departments')
    .update(camelToSnake(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Department>(data)
}

/**
 * Eliminar un departamento.
 */
export async function deleteDepartment(id: string): Promise<void> {
  const { error } = await supabase.from('departments').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// CENTERS (Centros / Hoteles)
// =============================================================================

/**
 * Obtener todos los centros visibles para el usuario actual según RLS.
 */
export async function getCenters(): Promise<Center[]> {
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .order('name')

  if (error) throw error
  return snakeToCamel<Center[]>(data ?? [])
}

/**
 * Obtener un centro por su ID.
 */
export async function getCenterById(id: string): Promise<Center | null> {
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return snakeToCamel<Center>(data)
}

/**
 * Crear un nuevo centro. (Solo master / clientAdmin)
 */
export async function createCenter(center: CenterInput): Promise<Center> {
  const { data, error } = await supabase
    .from('centers')
    .insert(camelToSnake(center))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Center>(data)
}

/**
 * Actualizar un centro.
 */
export async function updateCenter(id: string, updates: CenterUpdate): Promise<Center> {
  const { data, error } = await supabase
    .from('centers')
    .update(camelToSnake(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Center>(data)
}

/**
 * Eliminar un centro. (CASCADE en documentos a través de center_ids)
 */
export async function deleteCenter(id: string): Promise<void> {
  const { error } = await supabase.from('centers').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// USERS (Usuarios)
// =============================================================================

/**
 * Obtener todos los usuarios visibles según RLS.
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')

  if (error) throw error
  return snakeToCamel<User[]>(data ?? [])
}

/**
 * Obtener un usuario por ID.
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return snakeToCamel<User>(data)
}

/**
 * Crear un usuario en la tabla pública `users`.
 * NOTA: El auth.user debe existir previamente (creado vía invite/signUp),
 * o bien gestionarse por separado en el backend.
 */
export async function createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert(camelToSnake(user))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<User>(data)
}

/**
 * Actualizar un usuario.
 */
export async function updateUser(id: string, updates: UserUpdate): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(camelToSnake(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<User>(data)
}

/**
 * Eliminar un usuario. (RLS restringe según rol)
 */
export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// TOPICS (Temas / Categorías)
// =============================================================================

/**
 * Obtener todos los temas ordenados.
 */
export async function getTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('order_index')

  if (error) throw error
  return snakeToCamel<Topic[]>(data ?? [])
}

/**
 * Crear un nuevo tema.
 */
export async function createTopic(topic: TopicInput): Promise<Topic> {
  const { data, error } = await supabase
    .from('topics')
    .insert(camelToSnake(topic))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Topic>(data)
}

/**
 * Actualizar un tema.
 */
export async function updateTopic(id: string, updates: Partial<TopicInput>): Promise<Topic> {
  const { data, error } = await supabase
    .from('topics')
    .update(camelToSnake(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Topic>(data)
}

/**
 * Eliminar un tema. (RESTRICT si hay documentos)
 */
export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from('topics').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// DOCUMENTS (Documentos principales)
// =============================================================================

/**
 * Obtener todos los documentos visibles para el usuario actual.
 * Incluye joins a topics y creador (users).
 */
export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      topics:topic_id (id, name),
      users:created_by (id, name)
    `)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return snakeToCamel<Document[]>(data ?? [])
}

/**
 * Obtener un documento por ID con relaciones.
 */
export async function getDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      topics:topic_id (id, name),
      users:created_by (id, name)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return snakeToCamel<Document>(data)
}

/**
 * Obtener documentos donde center_ids contenga el centerId dado.
 * Usa el operador @> (contains) de PostgreSQL vía Supabase.
 */
export async function getDocumentsByCenter(centerId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .contains('center_ids', [centerId])
    .order('updated_at', { ascending: false })

  if (error) throw error
  return snakeToCamel<Document[]>(data ?? [])
}

/**
 * Obtener documentos filtrados por tema.
 */
export async function getDocumentsByTopic(topicId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('topic_id', topicId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return snakeToCamel<Document[]>(data ?? [])
}

/**
 * Obtener documentos filtrados por cliente.
 */
export async function getDocumentsByClient(clientId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', clientId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return snakeToCamel<Document[]>(data ?? [])
}

/**
 * Crear un nuevo documento.
 * La versión se inicializa automáticamente en 1.
 */
export async function createDocument(doc: DocumentInput): Promise<Document> {
  const payload = {
    ...camelToSnake(doc),
    version: 1,
  }

  const { data, error } = await supabase
    .from('documents')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  // Registrar en audit log
  await logAudit('CREATED', 'document', data.id, `Creó el documento "${doc.title}"`)

  return snakeToCamel<Document>(data)
}

/**
 * Actualizar un documento.
 * El trigger `save_document_version` guarda automáticamente la versión anterior.
 */
export async function updateDocument(id: string, updates: DocumentUpdate): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update(camelToSnake(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Registrar en audit log
  await logAudit('UPDATED', 'document', id, `Editó el documento "${data.title}"`)

  return snakeToCamel<Document>(data)
}

/**
 * Aprobar un documento.
 */
export async function approveDocument(id: string): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update({
      status: 'approved',
      approval_date: new Date().toISOString(),
      is_visible: true,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await logAudit(
    'APPROVED',
    'document',
    id,
    `Aprobó el documento "${data.title}" v${data.version}`
  )

  return snakeToCamel<Document>(data)
}

/**
 * Cambiar visibilidad de un documento.
 */
export async function toggleDocumentVisibility(id: string, isVisible: boolean): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update({ is_visible: isVisible })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Document>(data)
}

/**
 * Eliminar un documento. (CASCADE en adjuntos, versiones y alarmas)
 */
export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// DOCUMENT ATTACHMENTS (Archivos adjuntos)
// =============================================================================

/**
 * Obtener adjuntos de un documento.
 */
export async function getDocumentAttachments(documentId: string): Promise<DocumentAttachment[]> {
  const { data, error } = await supabase
    .from('document_attachments')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at')

  if (error) throw error
  return snakeToCamel<DocumentAttachment[]>(data ?? [])
}

/**
 * Crear un adjunto.
 */
export async function createAttachment(
  attachment: Omit<DocumentAttachment, 'id' | 'createdAt'>
): Promise<DocumentAttachment> {
  const { data, error } = await supabase
    .from('document_attachments')
    .insert(camelToSnake(attachment))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<DocumentAttachment>(data)
}

/**
 * Eliminar un adjunto.
 */
export async function deleteAttachment(id: string): Promise<void> {
  const { error } = await supabase.from('document_attachments').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// DOCUMENT VERSIONS (Histórico)
// =============================================================================

/**
 * Obtener versiones de un documento.
 */
export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version', { ascending: false })

  if (error) throw error
  return snakeToCamel<DocumentVersion[]>(data ?? [])
}

/**
 * Crear una versión manual de un documento.
 * Normalmente el trigger `save_document_version` lo hace automáticamente.
 */
export async function createDocumentVersion(
  version: Omit<DocumentVersion, 'id' | 'createdAt'>
): Promise<DocumentVersion> {
  const { data, error } = await supabase
    .from('document_versions')
    .insert(camelToSnake(version))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<DocumentVersion>(data)
}

// =============================================================================
// AUDIT LOGS (Registro inmutable)
// =============================================================================

/**
 * Obtener el registro de auditoría.
 * Ordenado por fecha descendente (más reciente primero).
 */
export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw error
  return snakeToCamel<AuditLogEntry[]>(data ?? [])
}

/**
 * Registrar una entrada en el log de auditoría.
 * Solo INSERT permitido por RLS. NO se puede editar ni borrar.
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  details: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user.id,
    user_name: profile?.name ?? 'Usuario desconocido',
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  })

  if (error) console.error('Error al registrar audit log:', error)
}

// =============================================================================
// ALARMS (Alarmas / Recordatorios)
// =============================================================================

/**
 * Obtener todas las alarmas visibles según RLS.
 */
export async function getAlarms(): Promise<Alarm[]> {
  const { data, error } = await supabase
    .from('alarms')
    .select('*')
    .order('reminder_date', { ascending: true })

  if (error) throw error
  return snakeToCamel<Alarm[]>(data ?? [])
}

/**
 * Obtener alarmas no disparadas que vencen pronto.
 */
export async function getPendingAlarms(): Promise<Alarm[]> {
  const { data, error } = await supabase
    .from('alarms')
    .select('*')
    .eq('is_triggered', false)
    .gte('reminder_date', new Date().toISOString())
    .order('reminder_date', { ascending: true })

  if (error) throw error
  return snakeToCamel<Alarm[]>(data ?? [])
}

/**
 * Crear una alarma.
 */
export async function createAlarm(alarm: AlarmInput): Promise<Alarm> {
  const { data, error } = await supabase
    .from('alarms')
    .insert(camelToSnake(alarm))
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Alarm>(data)
}

/**
 * Actualizar una alarma.
 */
export async function updateAlarm(id: string, updates: Partial<AlarmInput>): Promise<Alarm> {
  const { data, error } = await supabase
    .from('alarms')
    .update(camelToSnake(updates))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Alarm>(data)
}

/**
 * Marcar una alarma como disparada.
 */
export async function triggerAlarm(id: string): Promise<Alarm> {
  const { data, error } = await supabase
    .from('alarms')
    .update({ is_triggered: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return snakeToCamel<Alarm>(data)
}

/**
 * Eliminar una alarma.
 */
export async function deleteAlarm(id: string): Promise<void> {
  const { error } = await supabase.from('alarms').delete().eq('id', id)
  if (error) throw error
}

// =============================================================================
// STORAGE (Subida de archivos)
// =============================================================================

const STORAGE_BUCKET = 'documents'

/**
 * Subir un archivo al bucket de Supabase Storage.
 * @param file Archivo del input file
 * @param path Ruta dentro del bucket (ej: 'documentos/doc-123/factura.pdf')
 * @returns URL pública del archivo
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Eliminar un archivo del bucket.
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if (error) throw error
}

/**
 * Generar una ruta de archivo para Storage basada en documento y timestamp.
 */
export function generateStoragePath(documentId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `documents/${documentId}/${timestamp}_${sanitized}`
}

// =============================================================================
// REALTIME (Suscripciones a cambios)
// =============================================================================

/** Payload base para cambios en tiempo real */
interface RealtimePayload<T> {
  schema: string
  table: string
  commit_timestamp: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
  errors: string[] | null
}

/**
 * Suscribirse a cambios en la tabla de documentos.
 * Útil para actualizar la UI en tiempo real cuando otro usuario modifica un documento.
 */
export function subscribeToDocuments(
  callback: (payload: RealtimePayload<Document>) => void
) {
  const channel = supabase
    .channel('documents_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'documents' },
      (payload: unknown) => {
        const p = payload as RealtimePayload<Record<string, unknown>>
        callback({
          ...p,
          new: p.new ? snakeToCamel<Document>(p.new) : null,
          old: p.old ? snakeToCamel<Document>(p.old) : null,
        })
      }
    )
    .subscribe()

  return channel
}

/**
 * Suscribirse a cambios en alarmas.
 */
export function subscribeToAlarms(callback: (payload: RealtimePayload<Alarm>) => void) {
  const channel = supabase
    .channel('alarms_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'alarms' },
      (payload: unknown) => {
        const p = payload as RealtimePayload<Record<string, unknown>>
        callback({
          ...p,
          new: p.new ? snakeToCamel<Alarm>(p.new) : null,
          old: p.old ? snakeToCamel<Alarm>(p.old) : null,
        })
      }
    )
    .subscribe()

  return channel
}

// =============================================================================
// UTILIDADES LEGACY (mantenidas por compatibilidad)
// =============================================================================

/**
 * Verificar si el usuario actual es administrador (clientAdmin, hotelAdmin o master).
 * @deprecated Usa isMaster(), isClientAdmin() o isHotelAdmin() según el caso.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'master' || user?.role === 'clientAdmin' || user?.role === 'hotelAdmin'
}

/**
 * Verificar si el usuario actual pertenece a un centro específico.
 * @deprecated Usa belongsToAnyCenter([centerId]) para array de centros.
 */
export async function belongsToCenter(centerId: string): Promise<boolean> {
  return belongsToAnyCenter([centerId])
}
