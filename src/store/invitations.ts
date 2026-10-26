import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { buildJoinMessage, createInvitation, rebuildInvitation, transition } from '@/engine/invitations'
import { useMessagesStore } from '@/store/messages'
import { useProjectsStore } from '@/store/projects'
import type { Invitation } from '@/store/types'
import { useUsersStore } from '@/store/users'

interface InvitationsState {
  invitations: Invitation[]
  sendInvitations: (input: { projectId: string; inviterId: string; inviteeIds: string[] }) => void
  acceptInvitation: (invitationId: string) => void
  declineInvitation: (invitationId: string) => void
}

export const useInvitationsStore = create<InvitationsState>()(
  persist(
    (set, get) => ({
      invitations: [],
      sendInvitations: ({ projectId, inviterId, inviteeIds }) => {
        set((state) => {
          const next = [...state.invitations]
          for (const inviteeId of inviteeIds) {
            const existingIndex = next.findIndex((i) => i.projectId === projectId && i.inviteeId === inviteeId)
            const existing = existingIndex >= 0 ? next[existingIndex] : undefined
            if (!existing) {
              next.push(createInvitation({ projectId, inviterId, inviteeId }))
            } else if (existing.status === '已拒绝') {
              next[existingIndex] = rebuildInvitation(existing, inviterId)
            }
          }
          return { invitations: next }
        })
      },
      acceptInvitation: (invitationId) => {
        const invitation = get().invitations.find((i) => i.id === invitationId)
        if (!invitation) return
        const next = transition(invitation, 'accept')
        if (next === invitation) return
        set((state) => ({
          invitations: state.invitations.map((i) => (i.id === invitationId ? next : i)),
        }))
        useProjectsStore.getState().addMember(invitation.projectId, invitation.inviteeId)
        const invitee = useUsersStore.getState().users.find((u) => u.id === invitation.inviteeId)
        useMessagesStore
          .getState()
          .appendMessages([buildJoinMessage(invitation.projectId, invitee?.name ?? '新成员')])
      },
      declineInvitation: (invitationId) => {
        const invitation = get().invitations.find((i) => i.id === invitationId)
        if (!invitation) return
        const next = transition(invitation, 'decline')
        if (next === invitation) return
        set((state) => ({
          invitations: state.invitations.map((i) => (i.id === invitationId ? next : i)),
        }))
      },
    }),
    {
      name: 'atoms-demo:invitations',
      version: 1,
      migrate: () => ({ invitations: [] }),
    },
  ),
)
