import { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'

type Props = {
  open: boolean
  initialName?: string
  onClose: () => void
  onSave: (name: string) => Promise<void> | void
}

export default function ConnectionDialog({ open, initialName = '', onClose, onSave }: Props) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  const save = async () => {
    if (!name.trim()) return
    await onSave(name.trim())
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initialName ? 'Editar conexão' : 'Nova conexão'}</DialogTitle>
      <DialogContent>
        <TextField autoFocus fullWidth margin="dense" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={!name.trim()}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}