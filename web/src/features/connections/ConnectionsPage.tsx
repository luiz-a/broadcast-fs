import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, CircularProgress, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import EditOutlined from '@mui/icons-material/EditOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import HubOutlined from '@mui/icons-material/HubOutlined'
import { createDocument, deleteConnectionCascade, updateDocument } from '../../lib/firestore'
import { useOwnedCollection } from '../../lib/useOwnedCollection'
import { byCreatedAt } from '../../lib/sort'
import type { Connection } from '../../types'
import EmptyState from '../../components/EmptyState'
import { useAuth } from '../auth/AuthProvider'
import ConnectionDialog from './ConnectionDialog'

export default function ConnectionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading } = useOwnedCollection<Connection>('connections', user?.uid)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Connection | null>(null)

  const openNew = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (c: Connection) => { setEditing(c); setDialogOpen(true) }

  const save = async (name: string) => {
    if (editing) await updateDocument('connections', editing.id, { name })
    else await createDocument('connections', user!.uid, { name })
  }

  const remove = async (c: Connection) => {
    if (window.confirm(`Excluir "${c.name}" e todos os seus contatos e mensagens?`)) {
      await deleteConnectionCascade(c.id, user!.uid)
    }
  }

  const newButton = (
    <Button variant="contained" startIcon={<AddRounded />} onClick={openNew}>
      Nova conexão
    </Button>
  )

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Typography variant="h5">Conexões</Typography>
          <Typography variant="body2" color="text.secondary">
            Cada conexão tem seus próprios contatos e mensagens.
          </Typography>
        </div>
        {data.length > 0 && newButton}
      </div>

      {loading ? (
        <div className="grid place-items-center p-12"><CircularProgress /></div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<HubOutlined />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
          action={newButton}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...data].sort(byCreatedAt).map((c) => (
            <Paper
              key={c.id}
              className="flex items-center justify-between gap-2 p-4 transition hover:border-indigo-300 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => navigate(`/connections/${c.id}`)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>{c.name.charAt(0).toUpperCase()}</Avatar>
                <div className="min-w-0">
                  <Typography className="font-semibold" noWrap>{c.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Abrir contatos e mensagens
                  </Typography>
                </div>
              </button>

              <div className="flex shrink-0">
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
            </Paper>
          ))}
        </div>
      )}

      <ConnectionDialog
        open={dialogOpen}
        initialName={editing?.name}
        onClose={() => setDialogOpen(false)}
        onSave={save}
      />
    </>
  )
}