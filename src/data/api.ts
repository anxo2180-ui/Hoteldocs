import type { User, Center, Topic, Document, DocumentAttachment, AuditLogEntry, Alarm, Client, Department, DocumentVisibility } from '@/types'
import {
  mockClients,
  mockCenters,
  mockUsers,
  mockTopics,
  mockDocuments,
  mockAuditLog,
  mockAlarms,
} from './mockData'
import { localPDFToWikiConverter } from '@/services/aiConverter'

const KEYS = {
  clients: 'hoteldocs_clients',
  centers: 'hoteldocs_centers',
  users: 'hoteldocs_users',
  topics: 'hoteldocs_topics',
  documents: 'hoteldocs_documents',
  attachments: 'hoteldocs_attachments',
  auditLog: 'hoteldocs_auditlog',
  alarms: 'hoteldocs_alarms',
} as const

function seedIfEmpty<T>(key: string, data: T[]): T[] {
  const stored = localStorage.getItem(key)
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(data))
    return data
  }
  return JSON.parse(stored) as T[]
}

function getItem<T>(key: string): T[] {
  const stored = localStorage.getItem(key)
  if (!stored) return []
  return JSON.parse(stored) as T[]
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function seedAll(): void {
  seedIfEmpty(KEYS.clients, mockClients)
  seedIfEmpty(KEYS.centers, mockCenters)
  seedIfEmpty(KEYS.users, mockUsers)
  seedIfEmpty(KEYS.topics, mockTopics)
  seedIfEmpty(KEYS.documents, mockDocuments)
  seedIfEmpty(KEYS.attachments, [])
  seedIfEmpty(KEYS.auditLog, mockAuditLog)
  seedIfEmpty(KEYS.alarms, mockAlarms)
}

let seeded = false
function ensureSeeded(): void {
  if (!seeded) {
    seedAll()
    seeded = true
  }
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}


// Clients
export async function getClients(): Promise<Client[]> {
  ensureSeeded()
  return delay(getItem<Client>(KEYS.clients))
}

export async function getClientById(id: string): Promise<Client | null> {
  ensureSeeded()
  const clients = getItem<Client>(KEYS.clients)
  return delay(clients.find((c) => c.id === id) ?? null)
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  ensureSeeded()
  const newClient: Client = {
    ...client,
    id: `client-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const clients = getItem<Client>(KEYS.clients)
  clients.push(newClient)
  setItem(KEYS.clients, clients)
  return delay(newClient)
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  ensureSeeded()
  const clients = getItem<Client>(KEYS.clients)
  const idx = clients.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Client not found')
  const updated: Client = { ...clients[idx], ...updates }
  clients[idx] = updated
  setItem(KEYS.clients, clients)
  return delay(updated)
}

export async function deleteClient(id: string): Promise<void> {
  ensureSeeded()
  const clients = getItem<Client>(KEYS.clients).filter((c) => c.id !== id)
  setItem(KEYS.clients, clients)
  return delay(undefined)
}

// Helper: Get centers by client
export async function getCentersByClient(clientId: string): Promise<Center[]> {
  ensureSeeded()
  const centers = getItem<Center>(KEYS.centers)
  return delay(centers.filter((c) => c.clientId === clientId))
}

// Helper: Get center codes map
export async function getCenterCodes(centerIds: string[]): Promise<{ id: string; name: string; code: string }[]> {
  ensureSeeded()
  const centers = getItem<Center>(KEYS.centers)
  return delay(
    centerIds
      .map((id) => {
        const c = centers.find((center) => center.id === id)
        return c ? { id: c.id, name: c.name, code: c.code } : null
      })
      .filter(Boolean) as { id: string; name: string; code: string }[]
  )
}

// Documents
export async function getDocuments(): Promise<Document[]> {
  ensureSeeded()
  return delay(getItem<Document>(KEYS.documents))
}

// Get documents filtered by user permissions
export async function getDocumentsForUser(user: User | null): Promise<Document[]> {
  ensureSeeded()
  const docs = getItem<Document>(KEYS.documents)

  // Master sees everything
  if (user?.role === 'master') {
    return delay(docs)
  }

  // ClientAdmin sees all documents of their client (or global docs)
  if (user?.role === 'clientAdmin') {
    const clientDocs = docs.filter((doc) =>
      doc.clientId === user.clientId || doc.clientId === null
    )
    return delay(clientDocs)
  }

  // HotelAdmin sees docs that include their center
  if (user?.role === 'hotelAdmin') {
    const centerDocs = docs.filter((doc) => {
      const hasCenter = doc.centerIds.includes(user.centerId ?? '')
      return hasCenter
    })
    return delay(centerDocs)
  }

  // Regular user: approved + visible + matching department + center
  const userDept = user?.department ?? null
  const userCenter = user?.centerId ?? null

  const filtered = docs.filter((doc) => {
    // Public documents are always visible
    if (doc.visibility === 'public') return true

    // Must be approved and visible
    if (doc.status !== 'approved' || !doc.isVisible) return false

    // Must have user's center in centerIds
    if (userCenter && !doc.centerIds.includes(userCenter)) return false

    // Document must match user's department or be for 'todos'
    const matchesDept = doc.targetGroup === userDept || doc.targetGroup === 'todos'
    if (!matchesDept) return false

    return true
  })

  return delay(filtered)
}

export async function getDocumentById(id: string): Promise<Document | null> {
  ensureSeeded()
  const docs = getItem<Document>(KEYS.documents)
  const doc = docs.find((d) => d.id === id) ?? null
  return delay(doc)
}

// Get publicly accessible document (for QR / no login)
export async function getPublicDocumentById(id: string): Promise<Document | null> {
  ensureSeeded()
  const docs = getItem<Document>(KEYS.documents)
  const doc = docs.find((d) => d.id === id) ?? null
  // Only return if it's public and approved
  if (!doc || doc.visibility !== 'public' || doc.status !== 'approved') return null
  return delay(doc)
}

export async function createDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  ensureSeeded()
  const now = new Date().toISOString()
  const newDoc: Document = {
    ...doc,
    sourceType: doc.sourceType ?? 'manual',
    targetGroup: doc.targetGroup ?? 'todos',
    visibility: doc.visibility ?? 'private',
    id: `doc-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  const docs = getItem<Document>(KEYS.documents)
  docs.unshift(newDoc)
  setItem(KEYS.documents, docs)
  return delay(newDoc)
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
  ensureSeeded()
  const docs = getItem<Document>(KEYS.documents)
  const idx = docs.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error('Document not found')
  const updated: Document = {
    ...docs[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  docs[idx] = updated
  setItem(KEYS.documents, docs)
  return delay(updated)
}

export async function deleteDocument(id: string): Promise<void> {
  ensureSeeded()
  const docs = getItem<Document>(KEYS.documents).filter((d) => d.id !== id)
  setItem(KEYS.documents, docs)
  return delay(undefined)
}

// Centers
export async function getCenters(): Promise<Center[]> {
  ensureSeeded()
  return delay(getItem<Center>(KEYS.centers))
}

export async function createCenter(center: Omit<Center, 'id' | 'createdAt'>): Promise<Center> {
  ensureSeeded()
  const newCenter: Center = {
    ...center,
    id: `center-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const centers = getItem<Center>(KEYS.centers)
  centers.push(newCenter)
  setItem(KEYS.centers, centers)
  return delay(newCenter)
}

export async function updateCenter(id: string, updates: Partial<Center>): Promise<Center> {
  ensureSeeded()
  const centers = getItem<Center>(KEYS.centers)
  const idx = centers.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Center not found')
  const updated: Center = { ...centers[idx], ...updates }
  centers[idx] = updated
  setItem(KEYS.centers, centers)
  return delay(updated)
}

export async function deleteCenter(id: string): Promise<void> {
  ensureSeeded()
  const centers = getItem<Center>(KEYS.centers).filter((c) => c.id !== id)
  setItem(KEYS.centers, centers)
  return delay(undefined)
}

// Users
export async function getUsers(): Promise<User[]> {
  ensureSeeded()
  return delay(getItem<User>(KEYS.users))
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  ensureSeeded()
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const users = getItem<User>(KEYS.users)
  users.push(newUser)
  setItem(KEYS.users, users)
  return delay(newUser)
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  ensureSeeded()
  const users = getItem<User>(KEYS.users)
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('User not found')
  const updated: User = { ...users[idx], ...updates }
  users[idx] = updated
  setItem(KEYS.users, users)
  return delay(updated)
}

export async function deleteUser(id: string): Promise<void> {
  ensureSeeded()
  const users = getItem<User>(KEYS.users).filter((u) => u.id !== id)
  setItem(KEYS.users, users)
  return delay(undefined)
}

// Topics
export async function getTopics(): Promise<Topic[]> {
  ensureSeeded()
  return delay(getItem<Topic>(KEYS.topics))
}

export async function createTopic(topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
  ensureSeeded()
  const newTopic: Topic = {
    ...topic,
    id: `topic-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const topics = getItem<Topic>(KEYS.topics)
  topics.push(newTopic)
  setItem(KEYS.topics, topics)
  return delay(newTopic)
}

export async function updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
  ensureSeeded()
  const topics = getItem<Topic>(KEYS.topics)
  const idx = topics.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Topic not found')
  const updated: Topic = { ...topics[idx], ...updates }
  topics[idx] = updated
  setItem(KEYS.topics, topics)
  return delay(updated)
}

export async function deleteTopic(id: string): Promise<void> {
  ensureSeeded()
  const topics = getItem<Topic>(KEYS.topics).filter((t) => t.id !== id)
  setItem(KEYS.topics, topics)
  return delay(undefined)
}

// Audit Log (append only)
export async function getAuditLog(): Promise<AuditLogEntry[]> {
  ensureSeeded()
  return delay(getItem<AuditLogEntry>(KEYS.auditLog))
}

export async function addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
  ensureSeeded()
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const log = getItem<AuditLogEntry>(KEYS.auditLog)
  log.unshift(newEntry)
  setItem(KEYS.auditLog, log)
  return delay(newEntry)
}

// Alarms
export async function getAlarms(): Promise<Alarm[]> {
  ensureSeeded()
  return delay(getItem<Alarm>(KEYS.alarms))
}

export async function createAlarm(alarm: Omit<Alarm, 'id' | 'createdAt'>): Promise<Alarm> {
  ensureSeeded()
  const newAlarm: Alarm = {
    ...alarm,
    id: `alarm-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const alarms = getItem<Alarm>(KEYS.alarms)
  alarms.push(newAlarm)
  setItem(KEYS.alarms, alarms)
  return delay(newAlarm)
}

export async function deleteAlarm(id: string): Promise<void> {
  ensureSeeded()
  const alarms = getItem<Alarm>(KEYS.alarms).filter((a) => a.id !== id)
  setItem(KEYS.alarms, alarms)
  return delay(undefined)
}

// Re-export local converter for consumers that prefer api.ts entry point
export { localPDFToWikiConverter }

// Attachments
export async function getAttachmentsByDocumentId(documentId: string): Promise<DocumentAttachment[]> {
  ensureSeeded()
  const all = getItem<DocumentAttachment>(KEYS.attachments)
  return delay(all.filter((a) => a.documentId === documentId))
}

export async function createAttachment(
  attachment: Omit<DocumentAttachment, 'id' | 'createdAt'>
): Promise<DocumentAttachment> {
  ensureSeeded()
  const now = new Date().toISOString()
  const newAttachment: DocumentAttachment = {
    ...attachment,
    id: `att-${Date.now()}`,
    createdAt: now,
  }
  const all = getItem<DocumentAttachment>(KEYS.attachments)
  all.push(newAttachment)
  setItem(KEYS.attachments, all)
  return delay(newAttachment)
}

export async function deleteAttachment(id: string): Promise<void> {
  ensureSeeded()
  const all = getItem<DocumentAttachment>(KEYS.attachments).filter((a) => a.id !== id)
  setItem(KEYS.attachments, all)
  return delay(undefined)
}

// PDF import flow
export async function uploadPDFAndConvert(
  file: File,
  documentData: {
    title: string
    topicId: string
    centerIds: string[]
    clientId: string | null
    createdBy: string
    status?: 'draft' | 'pending' | 'approved' | 'discontinued'
    targetGroup?: Department
    visibility?: DocumentVisibility
  }
): Promise<{ document: Document; attachment: DocumentAttachment }> {
  ensureSeeded()

  // 1. Extract text via FileReader (browser-safe)
  const text = await fallbackExtractTextFromFile(file)

  // 2. Convert to HTML using local converter
  const html = localPDFToWikiConverter(text)

  // 3. Create document
  const now = new Date().toISOString()
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    title: documentData.title || file.name.replace(/\.pdf$/i, ''),
    content: html,
    topicId: documentData.topicId,
    centerIds: documentData.centerIds,
    clientId: documentData.clientId ?? null,
    targetGroup: documentData.targetGroup ?? 'todos',
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
  const docs = getItem<Document>(KEYS.documents)
  docs.unshift(newDoc)
  setItem(KEYS.documents, docs)

  // 4. Create signed-original attachment
  const fileUrl = URL.createObjectURL(file)
  const newAtt: DocumentAttachment = {
    id: `att-${Date.now()}-signed`,
    documentId: newDoc.id,
    fileName: file.name,
    fileUrl,
    fileType: file.type || 'application/pdf',
    isSignedOriginal: true,
    createdAt: now,
  }
  const atts = getItem<DocumentAttachment>(KEYS.attachments)
  atts.push(newAtt)
  setItem(KEYS.attachments, atts)

  // 5. Audit log
  const log = getItem<AuditLogEntry>(KEYS.auditLog)
  log.unshift({
    id: `log-${Date.now()}`,
    userId: documentData.createdBy,
    userName: 'Sistema',
    action: 'PDF_IMPORTED',
    entityType: 'document',
    entityId: newDoc.id,
    details: `Importó PDF "${file.name}" y generó documento wiki con IA local`,
    createdAt: now,
  })
  setItem(KEYS.auditLog, log)

  return delay({ document: newDoc, attachment: newAtt })
}

async function fallbackExtractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      let text = String(reader.result || '')
      text = text
        .replace(/\0/g, '')
        .replace(/stream\r?\n[\s\S]*?endstream/g, '')
        .replace(/obj\s*<<[\s\S]*?>>\s*endobj/g, '')
        .replace(/\/[A-Za-z0-9]+\s*<<[\s\S]*?>>/g, '')
        .replace(/\/[A-Za-z0-9]+\s*\d+\s*\d+\s*R/g, '')
        .replace(/\b(Tj|TJ|Td|TD|Tm|T\*|ET|BT|BDC|BMC|EMC|Do|sh|f|F|f\*|S|s|n|W|W\*|b|B|b\*|re|c|l|m|h|v|y|q|Q|gs|CS|cs|SC|SCN|sc|scn|G|g|RG|rg|K|k|d0|d1|BI|ID|EI|MP|DP|BX|EX)\b/g, '')
        .replace(/\(\d+\)/g, '')
        .replace(/\[\s*\d+(\s+\d+)*\s*\]/g, '')
        .replace(/\b xref\b|\b trailer\b|\b startxref\b|\b %%EOF\b/gi, '')
      const readableChars: string[] = []
      let currentWord = ''
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const code = char.charCodeAt(0)
        if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
          currentWord += char
        } else {
          if (currentWord.length > 2) readableChars.push(currentWord)
          currentWord = ''
        }
      }
      if (currentWord.length > 2) readableChars.push(currentWord)
      let result = readableChars.join(' ')
      result = result
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim()
      resolve(result)
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo PDF'))
    reader.readAsBinaryString(file)
  })
}

export async function toggleDocumentVisibility(id: string, isVisible: boolean): Promise<Document> {
  return updateDocument(id, { isVisible })
}

export async function toggleUserActive(id: string): Promise<User> {
  ensureSeeded()
  const users = getItem<User>(KEYS.users)
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('User not found')
  const updated: User = { ...users[idx], isActive: !users[idx].isActive }
  users[idx] = updated
  setItem(KEYS.users, users)
  return delay(updated)
}

export async function updateAlarm(id: string, updates: Partial<Alarm>): Promise<Alarm> {
  ensureSeeded()
  const alarms = getItem<Alarm>(KEYS.alarms)
  const idx = alarms.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('Alarm not found')
  const updated: Alarm = { ...alarms[idx], ...updates }
  alarms[idx] = updated
  setItem(KEYS.alarms, alarms)
  return delay(updated)
}

