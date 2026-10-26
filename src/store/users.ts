import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '@/store/types'

export const SEED_USERS: User[] = [
  { id: 'user-alice', name: 'Alice', email: 'alice@demo.dev', password: 'alice123', color: '#EC4899' },
  { id: 'user-ben', name: 'Ben', email: 'ben@demo.dev', password: 'ben123', color: '#3B82F6' },
  { id: 'user-charlie', name: 'Charlie', email: 'charlie@demo.dev', password: 'charlie123', color: '#F59E0B' },
  { id: 'user-diana', name: 'Diana', email: 'diana@demo.dev', password: 'diana123', color: '#10B981' },
  { id: 'user-eve', name: 'Eve', email: 'eve@demo.dev', password: 'eve123', color: '#8B5CF6' },
]

interface UsersState {
  users: User[]
  currentUserId: string | null
  login: (userId: string) => void
  loginWithPassword: (email: string, password: string) => User | null
  register: (input: { name: string; email: string; password: string }) => User
  logout: () => void
}

const seedState = { users: SEED_USERS, currentUserId: null }

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      ...seedState,
      login: (userId) => set({ currentUserId: userId }),
      loginWithPassword: (email, password) => {
        const user = get().users.find((u) => u.email === email && u.password === password) ?? null
        if (user) set({ currentUserId: user.id })
        return user
      },
      register: ({ name, email, password }) => {
        const palette = ['#EF4444', '#14B8A6', '#F97316', '#6366F1', '#84CC16']
        const user: User = {
          id: `user-${crypto.randomUUID()}`,
          name,
          email,
          password,
          color: palette[get().users.length % palette.length],
        }
        set((state) => ({ users: [...state.users, user], currentUserId: user.id }))
        return user
      },
      logout: () => set({ currentUserId: null }),
    }),
    {
      name: 'atoms-demo:users',
      version: 1,
      migrate: () => seedState,
    },
  ),
)

export function resetDemoData() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('atoms-demo:'))
    .forEach((key) => localStorage.removeItem(key))
  window.location.reload()
}
