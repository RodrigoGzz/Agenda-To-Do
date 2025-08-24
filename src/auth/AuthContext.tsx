import React from 'react'

export type User = { id: string; email: string; name?: string; lastName?: string }

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null)

  const login = async (email: string, _password: string) => {
    // Fake auth (no backend). Replace with real provider later.
    setUser({ id: uid(), email })
  }

  const register = async (name: string, lastName: string, email: string, _password: string) => {
    // Fake registration (no backend).
    setUser({ id: uid(), email, name, lastName })
  }

  const logout = () => setUser(null)

  const value = React.useMemo(() => ({ user, login, register, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
