import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { Alert, Button, TextField, Typography } from '@mui/material'
import CampaignRounded from '@mui/icons-material/CampaignRounded'
import { auth } from '../../lib/firebase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isLogin = mode === 'login'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const action = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword
      await action(auth, email, password)
      navigate('/')
    } catch {
      setError('Não foi possível autenticar. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-linear-to-br from-indigo-600 to-violet-700 p-10 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-bold">
          <CampaignRounded /> Broadcast
        </div>
        <div>
          <h1 className="mb-3 text-4xl font-bold leading-tight">
            Envie mensagens para seus contatos, na hora ou agendadas.
          </h1>
          <p className="max-w-md text-indigo-100">
            Organize suas conexões, gerencie contatos e acompanhe cada mensagem em tempo real.
          </p>
        </div>
        <span className="text-sm text-indigo-200">Teste prático · React + Firebase</span>
      </div>

      <div className="grid place-items-center p-6">
        <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4">
          <div>
            <Typography variant="h5">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {isLogin ? 'Entre para gerenciar suas conexões.' : 'Cada conta é um cliente isolado.'}
            </Typography>
          </div>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText={isLogin ? ' ' : 'Mínimo de 6 caracteres'}
            slotProps={{ htmlInput: { minLength: 6 } }}
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
          <Button onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError('') }}>
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </Button>
        </form>
      </div>
    </div>
  )
}