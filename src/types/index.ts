export type UserRole = 'master' | 'clientAdmin' | 'hotelAdmin' | 'user'
export type CenterStatus = 'active' | 'paused'
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'discontinued'
export type DocumentSourceType = 'manual' | 'pdf-import'
export type DocumentVisibility = 'private' | 'all' | 'public'
export type Department = 'cocina' | 'recepcion' | 'rrhh' | 'limpieza' | 'mantenimiento' | 'todos'
export type LicenseType = 'basic' | 'professional' | 'enterprise'

export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'cocina', label: 'Cocina' },
  { value: 'recepcion', label: 'Recepción' },
  { value: 'rrhh', label: 'RRHH' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'todos', label: 'Todos' },
]

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
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  clientId: string | null
  centerId: string | null
  department: Department | null
  isActive: boolean
  createdAt: string
}

export interface Center {
  id: string
  name: string
  code: string
  clientId: string
  status: CenterStatus
  createdAt: string
}

export interface Topic {
  id: string
  name: string
  description: string
  orderIndex: number
  createdAt: string
}

export interface Document {
  id: string
  title: string
  content: string
  topicId: string
  centerIds: string[]
  clientId: string | null
  targetGroup: Department
  visibility: DocumentVisibility
  status: DocumentStatus
  version: number
  approvalDate: string | null
  isVisible: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  sourceType: DocumentSourceType
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
}
