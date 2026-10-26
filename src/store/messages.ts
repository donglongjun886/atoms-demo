import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Message } from '@/store/types'

interface MessagesState {
  messages: Message[]
  appendMessages: (messages: Message[]) => void
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      messages: [],
      appendMessages: (incoming) => set((state) => ({ messages: [...state.messages, ...incoming] })),
    }),
    {
      name: 'atoms-demo:messages',
      version: 1,
      migrate: () => ({ messages: [] }),
    },
  ),
)
