import { useEffect, useState } from 'react'
import { where, type QueryConstraint } from 'firebase/firestore'
import { subscribeToCollection } from './firestore'

export function useOwnedCollection<T>(
  col: string,
  ownerId: string | undefined,
  filters: Record<string, string> = {},
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    if (!ownerId) return
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', ownerId),
      ...Object.entries(JSON.parse(filtersKey)).map(([k, v]) => where(k, '==', v)),
    ]
    setLoading(true)
    setError(null)
    return subscribeToCollection<T>(
      col,
      constraints,
      (items) => {
        setData(items)
        setLoading(false)
      },
      (e) => {
        console.error(`Erro ao ler "${col}":`, e)
        setError(e)
        setLoading(false)
      },
    )
  }, [col, ownerId, filtersKey])

  return { data, loading, error }
}