// src/types/notification.types.ts

// === Define the types (no export here) ===
interface Notification {
  id: number
  title: string
  body: string
  type: string
  senderId: number
  targetUserId: number
  targetRole: string
  targetPropertyId: number
  payload: Record<string, unknown>
  isRead: boolean
  createdAt: string
  delivered: boolean
  deliveryAttempts: number
}

interface NotificationResponse {
  notifications: Notification[]
  currentPage: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrevious: boolean
}

interface NotificationPreferences {
  id: number
  userId: number
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  webEnabled: boolean
  createdAt: string
}

interface SendNotificationRequest {
  title: string
  body: string
  type: string
  targetUserId?: number
  targetRole?: string
  targetPropertyId?: number
  payload?: Record<string, unknown>
  priority?: 'low' | 'normal' | 'high'
}

// === ONE SINGLE EXPORT BLOCK — this is what Vite needs ===
export type {
  Notification,
  NotificationResponse,
  NotificationPreferences,
  SendNotificationRequest,
}