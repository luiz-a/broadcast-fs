import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, CircularProgress, Tab, Tabs, Typography } from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined'
import SendOutlined from '@mui/icons-material/SendOutlined'
import { useOwnedCollection } from '../../lib/useOwnedCollection'
import type { Connection } from '../../types'
import { useAuth } from '../auth/AuthProvider'
import ContactsTab from '../contacts/ContactsTab'
import BroadcastTab from '../messages/BroadcastTab'

export default function ConnectionDetailPage() {
  const { connectionId = '' } = useParams()
  const { user } = useAuth()
  const { data, loading } = useOwnedCollection<Connection>('connections', user?.uid)
  const [tab, setTab] = useState<'contacts' | 'broadcast'>('contacts')

  if (loading) return <div className="grid place-items-center p-12"><CircularProgress /></div>

  const connection = data.find((c) => c.id === connectionId)
  if (!connection) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Typography>Conexão não encontrada.</Typography>
        <Button component={Link} to="/" startIcon={<ArrowBackRounded />}>Voltar</Button>
      </div>
    )
  }

  return (
    <>
      <Button component={Link} to="/" size="small" startIcon={<ArrowBackRounded />} className="!mb-2">
        Conexões
      </Button>
      <Typography variant="h5" className="!mb-4">{connection.name}</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="!mb-5 border-b border-slate-200">
        <Tab value="contacts" icon={<PeopleAltOutlined />} iconPosition="start" label="Contatos" />
        <Tab value="broadcast" icon={<SendOutlined />} iconPosition="start" label="Broadcast" />
      </Tabs>

      {tab === 'contacts'
        ? <ContactsTab connectionId={connectionId} />
        : <BroadcastTab connectionId={connectionId} />}
    </>
  )
}