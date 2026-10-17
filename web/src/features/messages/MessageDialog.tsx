import { useEffect, useState } from 'react'
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  FormHelperText, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import type { Contact, Message } from '../../types'
import { toInputValue } from '../../lib/date'

export type MessageValues = {
  contactIds: string[]
  text: string
  scheduledAt: Date | null
}

type Props = {
  open: boolean
  contacts: Contact[]
  initial?: Message | null
  onClose: () => void
  onSave: (values: MessageValues) => Promise<void> | void
}

type Mode = 'now' | 'schedule'

export default function MessageDialog({ open, contacts, initial, onClose, onSave }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [text, setText] = useState('')
  const [mode, setMode] = useState<Mode>('now')
  const [when, setWhen] = useState('')
  const [saving, setSaving] = useState(false)

  const isSent = initial?.status === 'sent' 

  useEffect(() => {
    if (!open) return
    setSelected(initial?.contactIds ?? [])
    setText(initial?.text ?? '')
    setMode(initial?.status === 'scheduled' ? 'schedule' : 'now')
    setWhen(initial?.scheduledAt ? toInputValue(initial.scheduledAt.toDate()) : '')
  }, [open, initial])

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const allSelected = contacts.length > 0 && selected.length === contacts.length
  const toggleAll = () => setSelected(allSelected ? [] : contacts.map((c) => c.id))

  const whenDate = when ? new Date(when) : null
  const whenInvalid = !isSent && mode === 'schedule' && (!whenDate || whenDate.getTime() <= Date.now())
  const valid = selected.length > 0 && text.trim() !== '' && !whenInvalid

  const save = async () => {
    setSaving(true)
    try {
      await onSave({
        contactIds: selected,
        text: text.trim(),
        scheduledAt: !isSent && mode === 'schedule' ? whenDate : null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>

      <DialogContent className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between">
            <Typography variant="subtitle2">Destinatários ({selected.length})</Typography>
            {contacts.length > 0 && (
              <Button size="small" onClick={toggleAll}>
                {allSelected ? 'Limpar' : 'Selecionar todos'}
              </Button>
            )}
          </div>

          {contacts.length === 0 ? (
            <FormHelperText error>Cadastre contatos nesta conexão antes de enviar.</FormHelperText>
          ) : (
            <div className="max-h-44 overflow-y-auto rounded border border-slate-300 px-2">
              {contacts.map((c) => (
                <div key={c.id}>
                  <FormControlLabel
                    control={<Checkbox checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />}
                    label={`${c.name} · ${c.phone}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <TextField
          label="Mensagem"
          multiline
          minRows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {!isSent && (
          <>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, v: Mode | null) => v && setMode(v)}
            >
              <ToggleButton value="now">Enviar agora</ToggleButton>
              <ToggleButton value="schedule">Agendar</ToggleButton>
            </ToggleButtonGroup>

            {mode === 'schedule' && (
              <TextField
                label="Data e horário"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                error={!!when && whenInvalid}
                helperText={when && whenInvalid ? 'Escolha uma data e horário futuros.' : ' '}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={!valid || saving}>
          {isSent ? 'Salvar' : mode === 'now' ? 'Enviar' : 'Agendar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}