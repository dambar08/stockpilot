"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { seedUsers } from "./seed"
import type { Locale } from "./i18n/translations"
import type { Role, User } from "./types"

export interface TeamMember extends User {
  active: boolean
}

export interface OrgSettings {
  orgName: string
  currency: string
  timezone: string
  defaultLocale: Locale
  lowStockAlerts: boolean
}

interface NewMemberInput {
  name: string
  email: string
  role: Role
}

interface AdminValue {
  members: TeamMember[]
  settings: OrgSettings
  addMember: (input: NewMemberInput) => void
  updateMemberRole: (id: string, role: Role) => void
  toggleMemberActive: (id: string) => void
  updateSettings: (patch: Partial<OrgSettings>) => void
}

const DEFAULT_SETTINGS: OrgSettings = {
  orgName: "North Peak Trading Co.",
  currency: "USD",
  timezone: "America/Chicago",
  defaultLocale: "en",
  lowStockAlerts: true,
}

function uid(): string {
  return `u_${Math.random().toString(36).slice(2, 9)}`
}

const AdminContext = createContext<AdminValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>(() => seedUsers.map((u) => ({ ...u, active: true })))
  const [settings, setSettings] = useState<OrgSettings>(DEFAULT_SETTINGS)

  const addMember = useCallback((input: NewMemberInput) => {
    setMembers((prev) => [...prev, { id: uid(), active: true, ...input }])
  }, [])

  const updateMemberRole = useCallback((id: string, role: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
  }, [])

  const toggleMemberActive = useCallback((id: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))
  }, [])

  const updateSettings = useCallback((patch: Partial<OrgSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo<AdminValue>(
    () => ({ members, settings, addMember, updateMemberRole, toggleMemberActive, updateSettings }),
    [members, settings, addMember, updateMemberRole, toggleMemberActive, updateSettings],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin(): AdminValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider")
  return ctx
}
