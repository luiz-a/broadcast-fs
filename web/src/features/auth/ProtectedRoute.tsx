import { Navigate, Outlet } from 'react-router-dom'
import { CircularProgress } from '@mui/material'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid h-screen place-items-center"><CircularProgress /></div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}