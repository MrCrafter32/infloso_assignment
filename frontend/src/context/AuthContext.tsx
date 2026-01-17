import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, LoginCredentials, User } from '../types/auth'
import * as authApi from '../services/auth.api'

type AuthContextType = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials, rememberMe: boolean) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials, rememberMe: boolean) => {
    const response: AuthResponse = await authApi.login(credentials)
    setToken(response.token)
    setUser(response.user)
    if (rememberMe) {
      localStorage.setItem('token', response.token)
    }else{
        sessionStorage.setItem('token', response.token)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
