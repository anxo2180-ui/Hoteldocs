import type {
  User, Center, Topic, Document, DocumentAttachment,
  AuditLogEntry, Alarm, Client, Department,
  DocumentVisibility,
} from '@/types'
import {
  mockClients, mockDepartments, mockCenters, mockUsers,
  mockTopics, mockDocuments, mockAuditLog, mockAlarms,
} from './mockData'

const KEYS = {
  clients: 'hoteldocs_clients',
  departments: 'hoteldocs_departments',
  centers: 'hoteldocs_centers',
  users: 'hoteldocs_users',
  topics: 'hoteldocs_topics',
  documents: 'hoteldocs_documents',
  auditLog: 'hoteldocs_auditlog',
  alarms: 'hoteldocs_alarms',
}

function getItem<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function seedIfEmpty<T>(key: string, data: T[]): void {
  if (!localStorage.getItem(key)) {
    setItem(key, data)
  }
}

let seeded = false
function ensureSeeded(): void {
  if (seeded) return
  seeded = true
  seedIfEmpty(KEYS.clients, mockClients)
  seedIfEmpty(KEYS.departments, mockDepartments)
  seedIfEmpty(KEYS.centers, mockCenters)
  seedIfEmpty(KEYS.users, mockUsers)
  seedIfEmpty(KEYS.topics, mockTopics)
  seedIfEmpty(KEYS.documents, mockDocuments)
  seedIfEmpty(KEYS.auditLog, mockAuditLog)
  seedIfEmpty(KEYS.alarms, mockAlarms)
}


// Helper robusto para leer auth del localStorage
export function getAuthFromStorage(): { id: string; name: string; role: string; clientId?: string | null; centerIds?: string[]; departmentId?: string | null } | null {
  try {
    const raw = localStorage.getItem('hoteldocs_auth')
    if (!raw || raw === 'null' || raw === 'undefined') return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.id) return null
    return parsed
  } catch {
    return null
  }
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 200 + Math.random() * 300))
}

// --- AUTH ---
export function getCurrentUser(): User | null {
  try {
    const auth = JSON.parse(localStorage.getItem('hoteldocs_auth') || '{}')
    if (!auth.id) return null
    const users = getItem<User>(KEYS.users)
    return users.find((u) => u.id === auth.id) ?? null
  } catch {
    return null
  }
}

// --- CLIENTS ---
export async function getClients(): Promise<Client[]> {
  ensureSeeded()
  return delay(getItem<Client>(KEYS.clients))
}
export async function getClientById(id: string): Promise<Client | null> {
  ensureSeeded()
  return delay(getItem<Client>(KEYS.clients).find((c) => c.id === id) ?? null)
}
export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  ensureSeeded()
  const newClient: Client = { ...client, id: `client-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<Client>(KEYS.clients)
  list.push(newClient)
  setItem(KEYS.clients, list)
  return delay(newClient)
}
export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  ensureSeeded()
  const list = getItem<Client>(KEYS.clients)
  const idx = list.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Client not found')
  list[idx] = { ...list[idx], ...updates }
  setItem(KEYS.clients, list)
  return delay(list[idx])
}

export async function deleteClient(id: string): Promise<void> {
  ensureSeeded()
  const list = getItem<Client>(KEYS.clients)
  const idx = list.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Client not found')
  list.splice(idx, 1)
  setItem(KEYS.clients, list)
  return delay(undefined)
}

// --- DEPARTMENTS ---
export async function getDepartments(): Promise<Department[]> {
  ensureSeeded()
  return delay(getItem<Department>(KEYS.departments))
}
export async function getDepartmentsByClient(clientId: string): Promise<Department[]> {
  ensureSeeded()
  return delay(getItem<Department>(KEYS.departments).filter((d) => d.clientId === clientId))
}
export async function getDepartmentById(id: string): Promise<Department | null> {
  ensureSeeded()
  return delay(getItem<Department>(KEYS.departments).find((d) => d.id === id) ?? null)
}
export async function createDepartment(dept: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
  ensureSeeded()
  const newDept: Department = { ...dept, id: `dept-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<Department>(KEYS.departments)
  list.push(newDept)
  setItem(KEYS.departments, list)
  return delay(newDept)
}
export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
  ensureSeeded()
  const list = getItem<Department>(KEYS.departments)
  const idx = list.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error('Department not found')
  list[idx] = { ...list[idx], ...updates }
  setItem(KEYS.departments, list)
  return delay(list[idx])
}
export async function deleteDepartment(id: string): Promise<void> {
  ensureSeeded()
  const list = getItem<Department>(KEYS.departments).filter((d) => d.id !== id)
  setItem(KEYS.departments, list)
  return delay(undefined)
}

// --- CENTERS ---
export async function getCenters(): Promise<Center[]> {
  ensureSeeded()
  return delay(getItem<Center>(KEYS.centers))
}
export async function getCentersByClient(clientId: string): Promise<Center[]> {
  ensureSeeded()
  return delay(getItem<Center>(KEYS.centers).filter((c) => c.clientId === clientId))
}
export async function createCenter(center: Omit<Center, 'id' | 'createdAt'>): Promise<Center> {
  ensureSeeded()
  const newCenter: Center = { ...center, id: `center-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<Center>(KEYS.centers)
  list.push(newCenter)
  setItem(KEYS.centers, list)
  return delay(newCenter)
}
export async function updateCenter(id: string, updates: Partial<Center>): Promise<Center> {
  ensureSeeded()
  const list = getItem<Center>(KEYS.centers)
  const idx = list.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Center not found')
  list[idx] = { ...list[idx], ...updates }
  setItem(KEYS.centers, list)
  return delay(list[idx])
}
export async function deleteCenter(id: string): Promise<void> {
  ensureSeeded()
  const list = getItem<Center>(KEYS.centers).filter((c) => c.id !== id)
  setItem(KEYS.centers, list)
  return delay(undefined)
}

// --- USERS ---
export async function getUsers(): Promise<User[]> {
  ensureSeeded()
  return delay(getItem<User>(KEYS.users))
}
export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  ensureSeeded()
  const newUser: User = { ...user, id: `user-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<User>(KEYS.users)
  list.push(newUser)
  setItem(KEYS.users, list)
  return delay(newUser)
}
export async function toggleUserActive(id: string): Promise<User> {
  ensureSeeded()
  const list = getItem<User>(KEYS.users)
  const idx = list.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('User not found')
  list[idx] = { ...list[idx], isActive: !list[idx].isActive }
  setItem(KEYS.users, list)
  return delay(list[idx])
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  ensureSeeded()
  const list = getItem<User>(KEYS.users)
  const idx = list.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('User not found')
  list[idx] = { ...list[idx], ...updates }
  setItem(KEYS.users, list)
  return delay(list[idx])
}

// --- TOPICS ---
export async function getTopics(): Promise<Topic[]> {
  ensureSeeded()
  return delay(getItem<Topic>(KEYS.topics))
}
export async function createTopic(topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
  ensureSeeded()
  const newTopic: Topic = { ...topic, id: `topic-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<Topic>(KEYS.topics)
  list.push(newTopic)
  setItem(KEYS.topics, list)
  return delay(newTopic)
}
export async function updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
  ensureSeeded()
  const list = getItem<Topic>(KEYS.topics)
  const idx = list.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Topic not found')
  list[idx] = { ...list[idx], ...updates }
  setItem(KEYS.topics, list)
  return delay(list[idx])
}
export async function deleteTopic(id: string): Promise<void> {
  ensureSeeded()
  const list = getItem<Topic>(KEYS.topics).filter((t) => t.id !== id)
  setItem(KEYS.topics, list)
  return delay(undefined)
}

// --- DOCUMENTS ---
export async function getDocuments(): Promise<Document[]> {
  ensureSeeded()
  return delay(getItem<Document>(KEYS.documents))
}
export async function getDocumentById(id: string): Promise<Document | null> {
  ensureSeeded()
  return delay(getItem<Document>(KEYS.documents).find((d) => d.id === id) ?? null)
}
export async function getPublicDocumentById(id: string): Promise<Document | null> {
  ensureSeeded()
  const doc = getItem<Document>(KEYS.documents).find((d) => d.id === id) ?? null
  if (!doc || doc.visibility !== 'public' || doc.status !== 'approved') return null
  return delay(doc)
}
export async function createDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  ensureSeeded()
  const now = new Date().toISOString()
  const newDoc: Document = {
    ...doc,
    id: `doc-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  const list = getItem<Document>(KEYS.documents)
  list.push(newDoc)
  setItem(KEYS.documents, list)
  return delay(newDoc)
}
export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
  ensureSeeded()
  const list = getItem<Document>(KEYS.documents)
  const idx = list.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error('Document not found')
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() }
  setItem(KEYS.documents, list)
  return delay(list[idx])
}
export async function toggleDocumentVisibility(id: string): Promise<Document> {
  ensureSeeded()
  const list = getItem<Document>(KEYS.documents)
  const idx = list.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error('Document not found')
  list[idx] = { ...list[idx], isVisible: !list[idx].isVisible, updatedAt: new Date().toISOString() }
  setItem(KEYS.documents, list)
  return delay(list[idx])
}

export async function deleteDocument(id: string): Promise<void> {
  ensureSeeded()
  const list = getItem<Document>(KEYS.documents).filter((d) => d.id !== id)
  setItem(KEYS.documents, list)
  return delay(undefined)
}

// --- PERMISSIONS: Documents filtered by user role ---
export async function getDocumentsForUser(user: User | null): Promise<Document[]> {
  ensureSeeded()
  const docs = getItem<Document>(KEYS.documents)

  // Master sees everything
  if (user?.role === 'master') return delay(docs)

  // ClientAdmin sees docs of their client (or global docs)
  if (user?.role === 'clientAdmin') {
    return delay(docs.filter((d) => d.clientId === user.clientId || d.clientId === null))
  }

  // HotelAdmin: docs for their hotels
  if (user?.role === 'hotelAdmin') {
    return delay(docs.filter((d) => user.centerIds.some((cid) => d.centerIds.includes(cid))))
  }

  // Regular user: docs for their hotels + matching department + approved + visible
  if (user?.role === 'user') {
    return delay(
      docs.filter((d) => {
        if (d.visibility === 'public' && d.status === 'approved') return true
        if (d.status !== 'approved' || !d.isVisible) return false
        const hasCenter = user.centerIds.some((cid) => d.centerIds.includes(cid))
        if (!hasCenter) return false
        // departmentId null = all departments
        if (d.departmentId === null) return true
        // user department matches doc department, or doc is for "all" (null)
        return d.departmentId === user.departmentId
      })
    )
  }

  return delay([])
}

// --- ATTACHMENTS ---
export async function createAttachment(att: Omit<DocumentAttachment, 'id' | 'createdAt'>): Promise<DocumentAttachment> {
  ensureSeeded()
  const newAtt: DocumentAttachment = { ...att, id: `att-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<DocumentAttachment>('hoteldocs_attachments')
  list.push(newAtt)
  setItem('hoteldocs_attachments', list)
  return delay(newAtt)
}

export async function getAttachmentsByDocumentId(documentId: string): Promise<DocumentAttachment[]> {
  ensureSeeded()
  return delay(getItem<DocumentAttachment>('hoteldocs_attachments').filter((a) => a.documentId === documentId))
}

// --- AUDIT LOG ---
export async function getAuditLog(): Promise<AuditLogEntry[]> {
  ensureSeeded()
  return delay(getItem<AuditLogEntry>(KEYS.auditLog))
}
export async function addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<void> {
  ensureSeeded()
  const newEntry: AuditLogEntry = { ...entry, id: `log-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<AuditLogEntry>(KEYS.auditLog)
  list.push(newEntry)
  setItem(KEYS.auditLog, list)
  return delay(undefined)
}

// --- ALARMS ---
export async function getAlarms(): Promise<Alarm[]> {
  ensureSeeded()
  return delay(getItem<Alarm>(KEYS.alarms))
}
export async function createAlarm(alarm: Omit<Alarm, 'id' | 'createdAt'>): Promise<Alarm> {
  ensureSeeded()
  const newAlarm: Alarm = { ...alarm, id: `alarm-${Date.now()}`, createdAt: new Date().toISOString() }
  const list = getItem<Alarm>(KEYS.alarms)
  list.push(newAlarm)
  setItem(KEYS.alarms, list)
  return delay(newAlarm)
}
export async function updateAlarm(id: string, updates: Partial<Alarm>): Promise<Alarm> {
  ensureSeeded()
  const list = getItem<Alarm>(KEYS.alarms)
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('Alarm not found')
  list[idx] = { ...list[idx], ...updates }
  setItem(KEYS.alarms, list)
  return delay(list[idx])
}

export async function deleteAlarm(id: string): Promise<void> {
  ensureSeeded()
  const list = getItem<Alarm>(KEYS.alarms).filter((a) => a.id !== id)
  setItem(KEYS.alarms, list)
  return delay(undefined)
}

// --- PDF → WIKI ---
export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
        .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      resolve(text.substring(0, 15000))
    }
    reader.onerror = () => resolve('')
    reader.readAsText(file)
  })
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
  const text = await extractTextFromPDF(file)
  const html = localPDFToWikiConverter(text)
  const now = new Date().toISOString()
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    title: documentData.title || file.name.replace(/\.pdf$/i, ''),
    content: html,
    topicId: documentData.topicId,
    centerIds: documentData.centerIds,
    clientId: documentData.clientId ?? null,
    departmentId: documentData.departmentId ?? null,
    visibility: documentData.visibility ?? 'private',
    status: documentData.status ?? 'draft',
    version: 1,
    approvalDate: null,
    isVisible: false,
    createdBy: documentData.createdBy,
    createdAt: now,
    updatedAt: now,
    sourceType: 'pdf-import',
  }
  const list = getItem<Document>(KEYS.documents)
  list.push(newDoc)
  setItem(KEYS.documents, list)
  return delay(newDoc)
}

export function localPDFToWikiConverter(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
  let html = ''
  let inList = false
  let listType: 'ul' | 'ol' = 'ul'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.length < 3) continue

    // Uppercase lines = headings
    if (line === line.toUpperCase() && line.length > 5 && line.length < 60 && !line.match(/^\d/)) {
      if (inList) { html += `</${listType}>`; inList = false }
      html += `<h2>${line}</h2>`
      continue
    }
    // Numbered = ordered list
    if (line.match(/^\d+[.\)]\s/)) {
      if (!inList || listType !== 'ol') {
        if (inList) html += `</${listType}>`
        html += '<ol>'
        inList = true
        listType = 'ol'
      }
      html += `<li>${line.replace(/^\d+[.\)]\s/, '')}</li>`
      continue
    }
    // Bullet = unordered list
    if (line.match(/^[\-*]\s/)) {
      if (!inList || listType !== 'ul') {
        if (inList) html += `</${listType}>`
        html += '<ul>'
        inList = true
        listType = 'ul'
      }
      html += `<li>${line.replace(/^[\-*]\s/, '')}</li>`
      continue
    }
    // Regular paragraph
    if (inList) { html += `</${listType}>`; inList = false }
    html += `<p>${line}</p>`
  }
  if (inList) html += `</${listType}>`
  return html
}
