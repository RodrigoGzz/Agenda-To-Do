import React from 'react'
import '@/css/pages/Login.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isLoading = loading || authLoading

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <h1 className="login__title">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="login__form">
        <label className="login__labelWrap">
          <span className="login__label">Email</span>
          <input
            type="email"
            className="login__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="login__labelWrap">
          <span className="login__label">Contraseña</span>
          <input
            type="password"
            className="login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="login__error">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="login__submit"
        >
          {isLoading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <p className="login__footer">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="login__link">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
