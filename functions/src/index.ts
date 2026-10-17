import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions/v2'
import { onSchedule } from 'firebase-functions/v2/scheduler'

initializeApp()
setGlobalOptions({ region: 'southamerica-east1' })

export const dispatchScheduledMessages = onSchedule('every 1 minutes', async () => {
  const db = getFirestore()
  const now = Timestamp.now()

  const snap = await db
    .collection('messages')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .get()

  if (snap.empty) return

  const batch = db.batch()
  snap.docs.forEach((d) => batch.update(d.ref, { status: 'sent', sentAt: now }))
  await batch.commit()
})