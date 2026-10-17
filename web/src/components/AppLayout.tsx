import { Link, Outlet } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { IconButton, Tooltip } from '@mui/material'
import CampaignRounded from '@mui/icons-material/CampaignRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import { auth } from '../lib/firebase'
import { useAuth } from '../features/auth/AuthProvider'

export default function AppLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 no-underline">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              <CampaignRounded fontSize="small" />
            </span>
            Broadcast
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-500 sm:block">{user?.email}</span>
            <Tooltip title="Sair">
              <IconButton aria-label="Sair" onClick={() => signOut(auth)}>
                <LogoutRounded />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}