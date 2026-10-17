import {
  addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query,
  serverTimestamp, updateDoc, where, writeBatch, type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'

export const createDocument = (col: string, ownerId: string, data: object) =>
  addDoc(collection(db, col), { ...data, ownerId, createdAt: serverTimestamp() })

export const updateDocument = (col: string, id: string, data: object) =>
  updateDoc(doc(db, col, id), data)

export const deleteDocument = (col: string, id: string) =>
  deleteDoc(doc(db, col, id))

export const subscribeToCollection = <T>(
  col: string,
  constraints: QueryConstraint[],
  onData: (items: T[]) => void,
  onError?: (e: Error) => void,
) =>
  onSnapshot(
    query(collection(db, col), ...constraints),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)),
    onError,
  )

export const deleteConnectionCascade = async (connectionId: string, ownerId: string) => {
  const refs = [doc(db, 'connections', connectionId)]

  for (const col of ['contacts', 'messages']) {
    const snap = await getDocs(
      query(
        collection(db, col),
        where('ownerId', '==', ownerId),
        where('connectionId', '==', connectionId),
      ),
    )
    snap.docs.forEach((d) => refs.push(d.ref))
  }

  for (let i = 0; i < refs.length; i += 500) {
    const batch = writeBatch(db)
    refs.slice(i, i + 500).forEach((r) => batch.delete(r))
    await batch.commit()
  }
}