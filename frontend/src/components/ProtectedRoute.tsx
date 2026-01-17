import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

type ProtectedRouteProps = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
