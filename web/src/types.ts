import type { Timestamp } from 'firebase/firestore'

export type Connection = { id: string; ownerId: string; name: string; createdAt?: Timestamp }
export type Contact = { id: string; ownerId: string; connectionId: string; name: string; phone: string; createdAt?: Timestamp }
export type MessageStatus = 'scheduled' | 'sent'
export type Message = {
  id: string; ownerId: string; connectionId: string
  contactIds: string[]; text: string; status: MessageStatus
  scheduledAt: Timestamp | null; sentAt: Timestamp | null; createdAt?: Timestamp
}