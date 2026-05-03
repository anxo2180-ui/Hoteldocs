/**
 * HotelDocs — API Adapter: Supabase Backend
 * =========================================
 * Exporta las mismas funciones que `api.ts` (localStorage) pero delega
 * a Supabase. Las funciones no disponibles en supabase-client.ts se
 * implementan aquí como wrappers.
 */

import type {
  User, UserRole, Center, Topic, Document, DocumentAttachment,
  AuditLogEntry, Alarm, Client, Department,
  DocumentVisibility,
} from '@/types'

import {
  getCurrentUser as sbGetCurrentUser,
  getClients as sbGetClients,
  getClientById as sbGetClientById,
  createClient as sbCreateClient,
  updateClient as sbUpdateClient,
  deleteClient as sbDeleteClient,
  getDepartments as sbGetDepartments,
  getDepartmentById as sbGetDepartmentById,
  createDepartment as sbCreateDepartment,
  updateDepartment as sbUpdateDepartment,
  deleteDepartment as sbDeleteDepartment,
  getCenters as sbGetCenters,
  createCenter as sbCreateCenter,
  updateCenter as sbUpdateCenter,
  deleteCenter as sbDeleteCenter,
  getUsers as sbGetUsers,
  getUserById as sbGetUserById,
  createUser as sbCreateUser,
  updateUser as sbUpdateUser,
  deleteUser as sbDeleteUser,
  getTopics as sbGetTopics,
  createTopic as sbCreateTopic,
  updateTopic as sbUpdateTopic,
  deleteTopic as sbDeleteTopic,
  getDocuments as sbGetDocuments,
  getDocumentById as sbGetDocumentById,
  createDocument as sbCreateDocument,
  updateDocument as sbUpdateDocument,
  toggleDocumentVisibility as sbToggleDocumentVisibility,
  deleteDocument as sbDeleteDocument,
  getDocumentAttachments as sbGetDocumentAttachments,
  createAttachment as sbCreateAttachment,
  getAuditLog as sbGetAuditLog,
  logAudit as sbLogAudit,
  getAlarms as sbGetAlarms,
  createAlarm as sbCreateAlarm,
  updateAlarm as sbUpdateAlarm,
  deleteAlarm as sbDeleteAlarm,
  isMaster as sbIsMaster,
  getCurrentClientId as sbGetCurrentClientId,
} from './supabase-client'

// Import localStorage fallback helpers for non-Supabase features
import { extractTextFromPDF as localExtractTextFromPDF } from '@/services/pdfExtractor'
import { getAuthFromStorage as localGetAuthFromStorage, getAuthUser as localGetAuthUser } from './api-local'

// Re-export isSupabaseConfigured
export { isSupabaseConfigured } from './supabase-client'

// ============================================================================
// AUTH (mapped from Supabase)
// ============================================================================

export function getAuthFromStorage(): { id: string; name: string; role: string; clientId?: string | null; centerIds?: string[]; departmentId?: string | null } | null {
  return localGetAuthFromStorage()
}

export function getAuthUser(): { id: string; name: string; role: UserRole; clientId: string | null; centerIds: string[]; departmentId: string | null } | null {
  return localGetAuthUser()
}

export async function getCurrentUser(): Promise<User | null> {
  return sbGetCurrentUser()
}

// ============================================================================
// CLIENTS (pass-through)
// ============================================================================

export async function getClients(): Promise<Client[]> {
  return sbGetClients()
}

export async function getClientById(id: string): Promise<Client | null> {
  return sbGetClientById(id)
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  return sbCreateClient(client as any)
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  return sbUpdateClient(id, updates as any)
}

export async function deleteClient(id: string): Promise<void> {
  return sbDeleteClient(id)
}

// ============================================================================
// DEPARTMENTS (wrappers)
// ============================================================================

export async function getDepartments(): Promise<Department[]> {
  return sbGetDepartments()
}

export async function getDepartmentsByClient(clientId: string): Promise<Department[]> {
  return sbGetDepartments(clientId)
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  return sbGetDepartmentById(id)
}

export async function createDepartment(dept: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
  return sbCreateDepartment(dept as any)
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
  return sbUpdateDepartment(id, updates as any)
}

export async function deleteDepartment(id: string): Promise<void> {
  return sbDeleteDepartment(id)
}

// ============================================================================
// CENTERS (wrappers)
// ============================================================================

export async function getCenters(): Promise<Center[]> {
  return sbGetCenters()
}

export async function getCentersByClient(clientId: string): Promise<Center[]> {
  // Supabase client doesn't have getCentersByClient, filter locally
  const all = await sbGetCenters()
  return all.filter(c => c.clientId === clientId)
}

export async function createCenter(center: Omit<Center, 'id' | 'createdAt'>): Promise<Center> {
  return sbCreateCenter(center as any)
}

export async function updateCenter(id: string, updates: Partial<Center>): Promise<Center> {
  return sbUpdateCenter(id, updates as any)
}

export async function deleteCenter(id: string): Promise<void> {
  return sbDeleteCenter(id)
}

// ============================================================================
// USERS (wrappers)
// ============================================================================

export async function getUsers(): Promise<User[]> {
  return sbGetUsers()
}

export async function getUsersForCurrentUser(): Promise<User[]> {
  const current = await sbGetCurrentUser()
  if (!current) return []
  const all = await sbGetUsers()
  if (await sbIsMaster()) return all
  const clientId = await sbGetCurrentClientId()
  if (clientId) {
    return all.filter(u => u.clientId === clientId)
  }
  return all.filter(u => u.id === current.id)
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'> & { password?: string }): Promise<User> {
  return sbCreateUser(user)
}

export async function toggleUserActive(id: string): Promise<User> {
  const user = await sbGetUserById(id)
  if (!user) throw new Error('User not found')
  return sbUpdateUser(id, { isActive: !user.isActive } as any)
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  return sbUpdateUser(id, updates as any)
}

export async function deleteUser(id: string): Promise<void> {
  return sbDeleteUser(id)
}

// ============================================================================
// TOPICS (pass-through)
// ============================================================================

export async function getTopics(): Promise<Topic[]> {
  return sbGetTopics()
}

export async function createTopic(topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
  return sbCreateTopic(topic as any)
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
  return sbUpdateTopic(id, updates as any)
}

export async function deleteTopic(id: string): Promise<void> {
  return sbDeleteTopic(id)
}

// ============================================================================
// DOCUMENTS (wrappers)
// ============================================================================

export async function getDocuments(): Promise<Document[]> {
  return sbGetDocuments()
}

export async function getDocumentById(id: string): Promise<Document | null> {
  return sbGetDocumentById(id)
}

export async function getPublicDocumentById(id: string): Promise<Document | null> {
  const doc = await sbGetDocumentById(id)
  if (!doc) return null
  if (doc.visibility === 'public' && doc.status === 'approved') return doc
  return null
}

export async function createDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  return sbCreateDocument(doc as any)
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
  return sbUpdateDocument(id, updates as any)
}

export async function toggleDocumentVisibility(id: string): Promise<Document> {
  const doc = await sbGetDocumentById(id)
  if (!doc) throw new Error('Document not found')
  return sbToggleDocumentVisibility(id, !doc.isVisible)
}

export async function deleteDocument(id: string): Promise<void> {
  return sbDeleteDocument(id)
}

export async function getDocumentsForUser(user: User | null): Promise<Document[]> {
  if (!user) return []
  const all = await sbGetDocuments()

  // Master sees everything
  if (user.role === 'master') return all

  // ClientAdmin sees docs of their client (or global docs)
  if (user.role === 'clientAdmin') {
    return all.filter(d => d.clientId === user.clientId || d.clientId === null)
  }

  // HotelAdmin: docs for their hotels
  if (user.role === 'hotelAdmin') {
    return all.filter(d => user.centerIds.some((cid) => d.centerIds.includes(cid)))
  }

  // Regular user: docs for their hotels + matching department + approved + visible
  if (user.role === 'user') {
    return all.filter((d) => {
      if (d.visibility === 'public' && d.status === 'approved') return true
      if (d.status !== 'approved' || !d.isVisible) return false
      const hasCenter = user.centerIds.some((cid) => d.centerIds.includes(cid))
      if (!hasCenter) return false
      // departmentId null = all departments
      if (d.departmentId === null) return true
      return d.departmentId === user.departmentId
    })
  }

  return []
}

// ============================================================================
// ATTACHMENTS (wrappers)
// ============================================================================

export async function createAttachment(att: Omit<DocumentAttachment, 'id' | 'createdAt'>): Promise<DocumentAttachment> {
  return sbCreateAttachment(att as any)
}

export async function getAttachmentsByDocumentId(documentId: string): Promise<DocumentAttachment[]> {
  return sbGetDocumentAttachments(documentId)
}

// ============================================================================
// AUDIT LOG (wrappers)
// ============================================================================

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return sbGetAuditLog()
}

export async function addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<void> {
  await sbLogAudit(entry.action, entry.entityType, entry.entityId, entry.details)
}

// ============================================================================
// ALARMS (pass-through)
// ============================================================================

export async function getAlarms(): Promise<Alarm[]> {
  return sbGetAlarms()
}

export async function createAlarm(alarm: Omit<Alarm, 'id' | 'createdAt'>): Promise<Alarm> {
  return sbCreateAlarm(alarm as any)
}

export async function updateAlarm(id: string, updates: Partial<Alarm>): Promise<Alarm> {
  return sbUpdateAlarm(id, updates as any)
}

export async function deleteAlarm(id: string): Promise<void> {
  return sbDeleteAlarm(id)
}

// ============================================================================
// PDF / WIKI (local-only, no Supabase equivalent needed)
// ============================================================================

export async function extractTextFromPDF(file: File): Promise<string> {
  return localExtractTextFromPDF(file)
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
  const text = await localExtractTextFromPDF(file)
  const content = `<div class="wiki-content">${text.split('\n').map(p => `<p>${p}</p>`).join('')}</div>`
  return sbCreateDocument({
    title: documentData.title || file.name.replace(/\.pdf$/i, ''),
    content,
    topicId: documentData.topicId,
    centerIds: documentData.centerIds,
    clientId: documentData.clientId || null,
    departmentId: documentData.departmentId || null,
    visibility: documentData.visibility || 'private',
    status: documentData.status || 'draft',
    version: 1,
    approvalDate: null,
    isVisible: false,
    sourceType: 'pdf-import',
    createdBy: documentData.createdBy,
  } as any)
}

export function localPDFToWikiConverter(text: string): string {
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const paragraphs = html.split(/\n\s*\n|\n/).filter(p => p.trim().length > 0)
  return `<div class="wiki-content">${paragraphs.map(p => `<p>${p.trim()}</p>`).join('')}</div>`
}
