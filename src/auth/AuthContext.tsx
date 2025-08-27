import React from 'react'
import '@/css/components/AuthContext.css'
import { registerUser, loginUser } from '../../backend/auth'

export type User = { id: string; email: string; name?: string; lastName?: string }

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'todo-calendar-user'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// Helper functions for localStorage
function saveUserToStorage(user: User) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } catch (e) {
    console.warn('Failed to save user to storage', e)
  }
}

function loadUserFromStorage(): User | null {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.warn('Failed to load user from storage', e)
    return null
  }
}

function removeUserFromStorage() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to remove user from storage', e)
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(() => {
    // Initialize with user from localStorage if available
    return loadUserFromStorage()
  })
  const [loading, setLoading] = React.useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Login user via Firebase backend
      const authUser = await loginUser({ email, password })
      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        lastName: authUser.lastName,
      }
      setUser(userData)
      saveUserToStorage(userData)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, lastName: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Register user in Firebase backend
      const userId = await registerUser({ name, lastName, email, password })
      // Set local auth state
      const userData = { id: userId, email, name, lastName }
      setUser(userData)
      saveUserToStorage(userData)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    removeUserFromStorage()
  }

  const value = React.useMemo(() => ({ user, loading, login, register, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
