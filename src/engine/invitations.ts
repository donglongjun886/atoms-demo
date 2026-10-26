import { createMessage } from '@/engine/scripts'
import type { Invitation, Message, Project } from '@/store/types'

export type InvitationAction = 'accept' | 'decline'

export function createInvitation(input: {
  projectId: string
  inviterId: string
  inviteeId: string
}): Invitation {
  return {
    id: `inv-${crypto.randomUUID()}`,
    projectId: input.projectId,
    inviterId: input.inviterId,
    inviteeId: input.inviteeId,
    status: '待处理',
    createdAt: Date.now(),
    respondedAt: null,
  }
}

export function transition(invitation: Invitation, action: InvitationAction): Invitation {
  if (invitation.status !== '待处理') return invitation
  return {
    ...invitation,
    status: action === 'accept' ? '已接受' : '已拒绝',
    respondedAt: Date.now(),
  }
}

// 不变式一：接受前被邀请人对项目不可见、不可发言。
// 可见性只来自成员身份；待处理的邀请不授予任何访问权。
export function canAccessProject(project: Project, userId: string): boolean {
  return project.memberIds.includes(userId)
}

// 不变式二：拒绝不记黑名单。
// 已拒绝的邀请可被重建为新的待处理邀请，被邀请人可再次被邀请。
export function rebuildInvitation(invitation: Invitation, inviterId: string): Invitation {
  return {
    ...invitation,
    inviterId,
    status: '待处理',
    createdAt: Date.now(),
    respondedAt: null,
  }
}

export function listInvitableUserIds(userIds: string[], project: Project, invitations: Invitation[]): string[] {
  const pendingInvitees = new Set(
    invitations.filter((i) => i.projectId === project.id && i.status === '待处理').map((i) => i.inviteeId),
  )
  return userIds.filter((id) => !project.memberIds.includes(id) && !pendingInvitees.has(id))
}

export function buildJoinMessage(projectId: string, userName: string): Message {
  return createMessage({
    projectId,
    senderId: 'agent-mike',
    content: `欢迎 ${userName} 加入共创！有任何想法随时在群里说，我们一起把它做出来。`,
  })
}
