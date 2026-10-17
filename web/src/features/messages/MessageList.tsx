import { Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import ScheduleRounded from '@mui/icons-material/ScheduleRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import EditOutlined from '@mui/icons-material/EditOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined'
import type { Contact, Message } from '../../types'
import { formatDateTime } from '../../lib/date'

type Props = {
  messages: Message[]
  contacts: Contact[]
  onEdit: (m: Message) => void
  onDelete: (m: Message) => void
}

const recipientsLabel = (ids: string[], contacts: Contact[]) => {
  const names = ids
    .map((id) => contacts.find((c) => c.id === id)?.name)
    .filter((n): n is string => !!n)
  if (names.length === 0) return 'Contatos removidos'
  const extra = names.length - 3
  return names.slice(0, 3).join(', ') + (extra > 0 ? ` +${extra}` : '')
}

const dateLabel = (m: Message) => {
  if (m.status === 'scheduled') {
    return m.scheduledAt ? `Para ${formatDateTime(m.scheduledAt.toDate())}` : ''
  }
  return m.sentAt ? formatDateTime(m.sentAt.toDate()) : 'Enviando...'
}

export default function MessageList({ messages, contacts, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => {
        const scheduled = m.status === 'scheduled'
        return (
          <Paper
            key={m.id}
            className={`flex flex-col gap-3 border-l-4 p-4 ${scheduled ? 'border-l-amber-500' : 'border-l-emerald-500'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <Chip
                size="small"
                icon={scheduled ? <ScheduleRounded /> : <CheckCircleRounded />}
                label={scheduled ? 'Agendada' : 'Enviada'}
                color={scheduled ? 'warning' : 'success'}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">{dateLabel(m)}</Typography>
            </div>

            <Typography className="whitespace-pre-wrap break-words">{m.text}</Typography>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5 text-slate-500">
                <PeopleAltOutlined fontSize="small" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {recipientsLabel(m.contactIds, contacts)}
                </Typography>
              </div>
              <div className="flex shrink-0">
                <Tooltip title="Editar">
                  <IconButton size="small" aria-label="Editar" onClick={() => onEdit(m)}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton size="small" color="error" aria-label="Excluir" onClick={() => onDelete(m)}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </Paper>
        )
      })}
    </div>
  )
}