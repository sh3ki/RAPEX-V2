import { ReactNode } from 'react'

interface AuthContextType {
  user: any | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  register: (email: string, password: string, role: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
}

export type { AuthContextType }
