import { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'

type Values = { name: string; phone: string }
type Props = {
  open: boolean
  initial?: Values
  onClose: () => void
  onSave: (values: Values) => Promise<void> | void
}

export default function ContactDialog({ open, initial, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setPhone(initial?.phone ?? '')
    }
  }, [open, initial])

  const valid = name.trim() !== '' && phone.replace(/\D/g, '').length >= 10

  const save = async () => {
    await onSave({ name: name.trim(), phone: phone.trim() })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initial ? 'Editar contato' : 'Novo contato'}</DialogTitle>
      <DialogContent className="flex flex-col gap-2">
        <TextField autoFocus margin="dense" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField margin="dense" label="Telefone" placeholder="(48) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={save} disabled={!valid}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}