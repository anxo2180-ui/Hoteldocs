export type UserRole = 'admin' | 'user'
export type CenterStatus = 'active' | 'paused'
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'discontinued'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  centerId: string
  isActive: boolean
  createdAt: string
}

export interface Center {
  id: string
  name: string
  code: string
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
  centerId: string
  status: DocumentStatus
  version: number
  approvalDate: string | null
  isVisible: boolean
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
