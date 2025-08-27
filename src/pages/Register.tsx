import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '@/css/pages/Register.css'

export default function RegisterPage() {
  const { register, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
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
      await register(name, lastName, email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register">
      <h1 className="register__title">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="register__form">
        <label className="register__labelWrap">
          <span className="register__label">Nombre</span>
          <input
            className="register__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="register__labelWrap">
          <span className="register__label">Apellido</span>
          <input
            className="register__input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        <label className="register__labelWrap">
          <span className="register__label">Email</span>
          <input
            type="email"
            className="register__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="register__labelWrap">
          <span className="register__label">Contraseña</span>
          <input
            type="password"
            className="register__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="register__error">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="register__submit"
        >
          {isLoading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="register__footer">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="register__link">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
