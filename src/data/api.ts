import type { User, Center, Topic, Document, AuditLogEntry, Alarm } from '@/types'
import {
  mockCenters,
  mockUsers,
  mockTopics,
  mockDocuments,
  mockAuditLog,
  mockAlarms,
} from './mockData'

const KEYS = {
  centers: 'hoteldocs_centers',
  users: 'hoteldocs_users',
  topics: 'hoteldocs_topics',
  documents: 'hoteldocs_documents',
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
  seedIfEmpty(KEYS.centers, mockCenters)
  seedIfEmpty(KEYS.users, mockUsers)
  seedIfEmpty(KEYS.topics, mockTopics)
  seedIfEmpty(KEYS.documents, mockDocuments)
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

// Documents
export async function getDocuments(): Promise<Document[]> {
  ensureSeeded()
  return delay(getItem<Document>(KEYS.documents))
}

export async function getDocumentById(id: string): Promise<Document | null> {
  ensureSeeded()
  const docs = getItem<Document>(KEYS.documents)
  const doc = docs.find((d) => d.id === id) ?? null
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
