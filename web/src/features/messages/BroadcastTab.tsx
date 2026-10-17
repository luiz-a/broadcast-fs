import { useMemo, useState } from 'react'
import { Timestamp, serverTimestamp } from 'firebase/firestore'
import { Button, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import ForumOutlined from '@mui/icons-material/ForumOutlined'
import { createDocument, deleteDocument, updateDocument } from '../../lib/firestore'
import { useOwnedCollection } from '../../lib/useOwnedCollection'
import { byCreatedAt } from '../../lib/sort'
import type { Contact, Message } from '../../types'
import EmptyState from '../../components/EmptyState'
import { useAuth } from '../auth/AuthProvider'
import MessageDialog, { type MessageValues } from './MessageDialog'
import MessageList from './MessageList'

type Filter = 'all' | 'scheduled' | 'sent'

export default function BroadcastTab({ connectionId }: { connectionId: string }) {
  const { user } = useAuth()
  const { data: contacts } = useOwnedCollection<Contact>('contacts', user?.uid, { connectionId })
  const { data: messages, loading } = useOwnedCollection<Message>('messages', user?.uid, { connectionId })

  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Message | null>(null)

  const counts = useMemo(
    () => ({
      all: messages.length,
      scheduled: messages.filter((m) => m.status === 'scheduled').length,
      sent: messages.filter((m) => m.status === 'sent').length,
    }),
    [messages],
  )

  const visible = useMemo(
    () =>
      [...messages]
        .filter((m) => filter === 'all' || m.status === filter)
        .sort(byCreatedAt)
        .reverse(),
    [messages, filter],
  )

  const openNew = () => { setEditing(null); setOpen(true) }
  const openEdit = (m: Message) => { setEditing(m); setOpen(true) }

  const save = async ({ contactIds, text, scheduledAt }: MessageValues) => {
    if (editing?.status === 'sent') {
      await updateDocument('messages', editing.id, { contactIds, text })
      return
    }

    const payload = scheduledAt
      ? { contactIds, text, status: 'scheduled', scheduledAt: Timestamp.fromDate(scheduledAt), sentAt: null }
      : { contactIds, text, status: 'sent', scheduledAt: null, sentAt: serverTimestamp() }

    if (editing) await updateDocument('messages', editing.id, payload)
    else await createDocument('messages', user!.uid, { ...payload, connectionId })
  }

  const remove = async (m: Message) => {
    if (window.confirm('Excluir esta mensagem?')) await deleteDocument('messages', m.id)
  }

  const newButton = (
    <Button variant="contained" startIcon={<AddRounded />} onClick={openNew}>
      Nova mensagem
    </Button>
  )

  return (
    <div>
      {messages.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filter}
            onChange={(_, v: Filter | null) => v && setFilter(v)}
          >
            <ToggleButton value="all">Todas ({counts.all})</ToggleButton>
            <ToggleButton value="scheduled">Agendadas ({counts.scheduled})</ToggleButton>
            <ToggleButton value="sent">Enviadas ({counts.sent})</ToggleButton>
          </ToggleButtonGroup>
          {newButton}
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center p-12"><CircularProgress /></div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<ForumOutlined />}
          title="Nenhuma mensagem criada"
          description="Escreva uma mensagem, escolha os contatos e envie agora ou agende."
          action={newButton}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<ForumOutlined />}
          title="Nada neste filtro"
          description="Nenhuma mensagem corresponde ao filtro selecionado."
        />
      ) : (
        <MessageList messages={visible} contacts={contacts} onEdit={openEdit} onDelete={remove} />
      )}

      <MessageDialog
        open={open}
        contacts={[...contacts].sort(byCreatedAt)}
        initial={editing}
        onClose={() => setOpen(false)}
        onSave={save}
      />
    </div>
  )
}