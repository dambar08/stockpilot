"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { seedUsers } from "./seed"
import { hasPermission, type Permission } from "./permissions"
import type { Role, User } from "./types"

const SESSION_KEY = "stockpilot.session"

export type { Permission } from "./permissions"

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  manager: "Inventory Manager",
  staff: "Warehouse Staff",
}

interface AuthValue {
  user: User | null
  accounts: User[]
  signIn: (userId: string) => void
  signOut: () => void
  can: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedId = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null
    if (savedId) {
      const found = seedUsers.find((u) => u.id === savedId)
      if (found) setUser(found)
    }
  }, [])

  const signIn = (userId: string) => {
    const found = seedUsers.find((u) => u.id === userId) ?? null
    setUser(found)
    if (found) window.localStorage.setItem(SESSION_KEY, found.id)
  }

  const signOut = () => {
    setUser(null)
    window.localStorage.removeItem(SESSION_KEY)
  }

  const can = (permission: Permission) => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }

  return (
    <AuthContext.Provider value={{ user, accounts: seedUsers, signIn, signOut, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
