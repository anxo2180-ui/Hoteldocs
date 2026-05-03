/**
 * HotelDocs — API Dual Backend
 * ==============================
 * Si Supabase está configurado Y responde (schema migrado), usa Supabase.
 * Si no, usa localStorage (modo demo/offline).
 *
 * Este archivo es un dispatcher: exporta las mismas funciones que siempre,
 * pero delega al backend activo en runtime.
 */

import type {
  User, UserRole, Center, Topic, Document, DocumentAttachment,
  AuditLogEntry, Alarm, Client, Department,
  DocumentVisibility,
} from '@/types'

import { isSupabaseConfigured } from './supabase-client'
import * as local from './api-local'

// Import type-only from supabase adapter to avoid eager init

// ========================================================================
// DETECCIÓN DE BACKEND ACTIVO
// ========================================================================

let supabaseReady: boolean | null = null
let supabaseCheckPromise: Promise<boolean> | null = null
let supabaseLastCheckTime = 0
const SUPABASE_CHECK_TTL = 30000 // 30s para reintentar

/** Pingea Supabase para saber si el schema está migrado (tabla clients existe) */
function checkSupabase(): Promise<boolean> {
  if (supabaseCheckPromise) return supabaseCheckPromise
  supabaseCheckPromise = (async () => {
    if (!isSupabaseConfigured) {
      supabaseReady = false
      return false
    }
    try {
      const mod = await import('./api-supabase')
      await (mod as any).getClients()
      supabaseReady = true
      supabaseLastCheckTime = Date.now()
      return true
    } catch (err) {
      console.warn('[api.ts] Supabase no responde o schema no migrado:', err)
      supabaseReady = false
      supabaseLastCheckTime = Date.now()
      return false
    }
  })()
  return supabaseCheckPromise
}

async function useSupabase(): Promise<boolean> {
  if (supabaseReady !== null) {
    // Permitir re-check si pasó el TTL y antes falló
    if (!supabaseReady && Date.now() - supabaseLastCheckTime > SUPABASE_CHECK_TTL) {
      supabaseCheckPromise = null
      return checkSupabase()
    }
    return supabaseReady
  }
  return checkSupabase()
}

// ========================================================================
// AUTH — localStorage se mantiene como fuente de verdad para compatibilidad
// ========================================================================

export function getAuthFromStorage(): { id: string; name: string; role: string; clientId?: string | null; centerIds?: string[]; departmentId?: string | null } | null {
  return local.getAuthFromStorage()
}

export function getAuthUser(): { id: string; name: string; role: UserRole; clientId: string | null; centerIds: string[]; departmentId: string | null } | null {
  return local.getAuthUser()
}

export async function getCurrentUser(): Promise<User | null> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getCurrentUser()
  }
  return local.getCurrentUser()
}

// ========================================================================
// CLIENTS
// ========================================================================

export async function getClients(): Promise<Client[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getClients()
  }
  return local.getClients()
}

export async function getClientById(id: string): Promise<Client | null> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getClientById(id)
  }
  return local.getClientById(id)
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createClient(client)
  }
  return local.createClient(client)
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.updateClient(id, updates)
  }
  return local.updateClient(id, updates)
}

export async function deleteClient(id: string): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.deleteClient(id)
  }
  return local.deleteClient(id)
}

// ========================================================================
// DEPARTMENTS
// ========================================================================

export async function getDepartments(): Promise<Department[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getDepartments()
  }
  return local.getDepartments()
}

export async function getDepartmentsByClient(clientId: string): Promise<Department[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getDepartmentsByClient(clientId)
  }
  return local.getDepartmentsByClient(clientId)
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getDepartmentById(id)
  }
  return local.getDepartmentById(id)
}

export async function createDepartment(dept: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createDepartment(dept)
  }
  return local.createDepartment(dept)
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.updateDepartment(id, updates)
  }
  return local.updateDepartment(id, updates)
}

export async function deleteDepartment(id: string): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.deleteDepartment(id)
  }
  return local.deleteDepartment(id)
}

// ========================================================================
// CENTERS
// ========================================================================

export async function getCenters(): Promise<Center[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getCenters()
  }
  return local.getCenters()
}

export async function getCentersByClient(clientId: string): Promise<Center[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getCentersByClient(clientId)
  }
  return local.getCentersByClient(clientId)
}

export async function createCenter(center: Omit<Center, 'id' | 'createdAt'>): Promise<Center> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createCenter(center)
  }
  return local.createCenter(center)
}

export async function updateCenter(id: string, updates: Partial<Center>): Promise<Center> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.updateCenter(id, updates)
  }
  return local.updateCenter(id, updates)
}

export async function deleteCenter(id: string): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.deleteCenter(id)
  }
  return local.deleteCenter(id)
}

// ========================================================================
// USERS
// ========================================================================

export async function getUsers(): Promise<User[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getUsers()
  }
  return local.getUsers()
}

export async function getUsersForCurrentUser(): Promise<User[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getUsersForCurrentUser()
  }
  return local.getUsersForCurrentUser()
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'> & { password?: string }): Promise<User> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createUser(user)
  }
  return local.createUser(user)
}

export async function toggleUserActive(id: string): Promise<User> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.toggleUserActive(id)
  }
  return local.toggleUserActive(id)
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.updateUser(id, updates)
  }
  return local.updateUser(id, updates)
}

export async function deleteUser(id: string): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.deleteUser(id)
  }
  return local.deleteUser(id)
}

// ========================================================================
// TOPICS
// ========================================================================

export async function getTopics(): Promise<Topic[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getTopics()
  }
  return local.getTopics()
}

export async function createTopic(topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createTopic(topic)
  }
  return local.createTopic(topic)
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.updateTopic(id, updates)
  }
  return local.updateTopic(id, updates)
}

export async function deleteTopic(id: string): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.deleteTopic(id)
  }
  return local.deleteTopic(id)
}

// ========================================================================
// DOCUMENTS
// ========================================================================

export async function getDocuments(): Promise<Document[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getDocuments()
  }
  return local.getDocuments()
}

export async function getDocumentById(id: string): Promise<Document | null> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getDocumentById(id)
  }
  return local.getDocumentById(id)
}

export async function getPublicDocumentById(id: string): Promise<Document | null> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getPublicDocumentById(id)
  }
  return local.getPublicDocumentById(id)
}

export async function createDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createDocument(doc)
  }
  return local.createDocument(doc)
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.updateDocument(id, updates)
  }
  return local.updateDocument(id, updates)
}

export async function toggleDocumentVisibility(id: string): Promise<Document> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.toggleDocumentVisibility(id)
  }
  return local.toggleDocumentVisibility(id)
}

export async function deleteDocument(id: string): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.deleteDocument(id)
  }
  return local.deleteDocument(id)
}

export async function getDocumentsForUser(user: User | null): Promise<Document[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getDocumentsForUser(user)
  }
  return local.getDocumentsForUser(user)
}

// ========================================================================
// ATTACHMENTS
// ========================================================================

export async function createAttachment(att: Omit<DocumentAttachment, 'id' | 'createdAt'>): Promise<DocumentAttachment> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createAttachment(att)
  }
  return local.createAttachment(att)
}

export async function getAttachmentsByDocumentId(documentId: string): Promise<DocumentAttachment[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getAttachmentsByDocumentId(documentId)
  }
  return local.getAttachmentsByDocumentId(documentId)
}

// ========================================================================
// AUDIT LOG
// ========================================================================

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getAuditLog()
  }
  return local.getAuditLog()
}

export async function addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.addAuditLogEntry(entry)
  }
  return local.addAuditLogEntry(entry)
}

// ========================================================================
// ALARMS
// ========================================================================

export async function getAlarms(): Promise<Alarm[]> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.getAlarms()
  }
  return local.getAlarms()
}

export async function createAlarm(alarm: Omit<Alarm, 'id' | 'createdAt'>): Promise<Alarm> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.createAlarm(alarm)
  }
  return local.createAlarm(alarm)
}

export async function updateAlarm(id: string, updates: Partial<Alarm>): Promise<Alarm> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.updateAlarm(id, updates)
  }
  return local.updateAlarm(id, updates)
}

export async function deleteAlarm(id: string): Promise<void> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.deleteAlarm(id)
  }
  return local.deleteAlarm(id)
}

// ========================================================================
// PDF / WIKI (local-only processing, storage varies by backend)
// ========================================================================

export async function extractTextFromPDF(file: File): Promise<string> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.extractTextFromPDF(file)
  }
  return local.extractTextFromPDF(file)
}

export async function uploadPDFAndConvert(
  file: File,
  documentData: {
    title: string
    topicId: string
    centerIds: string[]
    clientId: string | null
    createdBy: string
    status?: Document['status']
    departmentId?: string | null
    visibility?: DocumentVisibility
  }
): Promise<Document> {
  if (await useSupabase()) {
    const mod = await import('./api-supabase')
    return mod.uploadPDFAndConvert(file, documentData)
  }
  return local.uploadPDFAndConvert(file, documentData)
}

export function localPDFToWikiConverter(text: string): string {
  return local.localPDFToWikiConverter(text)
}

// ========================================================================
// UTILIDAD: sincroniza auth user desde Supabase → localStorage
// ========================================================================

export async function syncAuthUser(): Promise<void> {
  if (!isSupabaseConfigured) return
  try {
    const mod = await import('./api-supabase')
    const user = await mod.getCurrentUser()
    if (user) {
      localStorage.setItem('hoteldocs_auth', JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
        centerIds: user.centerIds,
        departmentId: user.departmentId,
      }))
    }
  } catch (err) {
    console.warn('[api.ts] syncAuthUser failed:', err)
  }
}
