import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import ProtectedRoute from './features/auth/ProtectedRoute'
import AuthPage from './features/auth/AuthPage'
import AppLayout from './components/AppLayout'
import ConnectionsPage from './features/connections/ConnectionsPage'
import ConnectionDetailPage from './features/connections/ConnectionDetailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<ConnectionsPage />} />
              <Route path="/connections/:connectionId" element={<ConnectionDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}