import type { Timestamp } from 'firebase/firestore'

export const byCreatedAt = <T extends { createdAt?: Timestamp | null }>(a: T, b: T) =>
  (a.createdAt?.toMillis() ?? Infinity) - (b.createdAt?.toMillis() ?? Infinity)