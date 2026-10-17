import { useState } from 'react'
import { Avatar, Button, CircularProgress, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import EditOutlined from '@mui/icons-material/EditOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined'
import { createDocument, deleteDocument, updateDocument } from '../../lib/firestore'
import { useOwnedCollection } from '../../lib/useOwnedCollection'
import { byCreatedAt } from '../../lib/sort'
import type { Contact } from '../../types'
import EmptyState from '../../components/EmptyState'
import { useAuth } from '../auth/AuthProvider'
import ContactDialog from './ContactDialog'

export default function ContactsTab({ connectionId }: { connectionId: string }) {
  const { user } = useAuth()
  const { data, loading } = useOwnedCollection<Contact>('contacts', user?.uid, { connectionId })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)

  const openNew = () => { setEditing(null); setOpen(true) }
  const openEdit = (c: Contact) => { setEditing(c); setOpen(true) }

  const save = async (values: { name: string; phone: string }) => {
    if (editing) await updateDocument('contacts', editing.id, values)
    else await createDocument('contacts', user!.uid, { ...values, connectionId })
  }

  const remove = async (c: Contact) => {
    if (window.confirm(`Excluir o contato "${c.name}"?`)) await deleteDocument('contacts', c.id)
  }

  const newButton = (
    <Button variant="contained" startIcon={<AddRounded />} onClick={openNew}>
      Novo contato
    </Button>
  )

  return (
    <div>
      {data.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <Typography variant="body2" color="text.secondary">
            {data.length} {data.length === 1 ? 'contato' : 'contatos'}
          </Typography>
          {newButton}
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center p-12"><CircularProgress /></div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<PersonAddAltOutlined />}
          title="Nenhum contato nesta conexão"
          description="Cadastre contatos para poder selecioná-los ao enviar uma mensagem."
          action={newButton}
        />
      ) : (
        <Paper className="divide-y divide-slate-100 overflow-hidden">
          {[...data].sort(byCreatedAt).map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', fontWeight: 700 }}>
                {c.name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="min-w-0 flex-1">
                <Typography className="font-semibold" noWrap>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">{c.phone}</Typography>
              </div>
              <Tooltip title="Editar">
                <IconButton size="small" aria-label="Editar" onClick={() => openEdit(c)}>
                  <EditOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir">
                <IconButton size="small" color="error" aria-label="Excluir" onClick={() => remove(c)}>
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          ))}
        </Paper>
      )}

      <ContactDialog
        open={open}
        initial={editing ? { name: editing.name, phone: editing.phone } : undefined}
        onClose={() => setOpen(false)}
        onSave={save}
      />
    </div>
  )
}