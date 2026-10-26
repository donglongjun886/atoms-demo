import { describe, expect, it } from 'vitest'
import {
  canAccessProject,
  createInvitation,
  listInvitableUserIds,
  rebuildInvitation,
  transition,
} from '@/engine/invitations'
import type { Project } from '@/store/types'

const project: Project = {
  id: 'p1',
  name: '演示项目',
  description: '',
  ownerId: 'user-alice',
  memberIds: ['user-alice'],
  stage: '需求分析',
  createdAt: 0,
}

describe('邀请状态机', () => {
  it('新建邀请为待处理，尚无响应时间', () => {
    const inv = createInvitation({ projectId: 'p1', inviterId: 'user-alice', inviteeId: 'user-ben' })
    expect(inv.status).toBe('待处理')
    expect(inv.respondedAt).toBeNull()
  })

  it('待处理邀请可被接受或拒绝，并记录响应时间', () => {
    const inv = createInvitation({ projectId: 'p1', inviterId: 'user-alice', inviteeId: 'user-ben' })
    expect(transition(inv, 'accept').status).toBe('已接受')
    expect(transition(inv, 'accept').respondedAt).not.toBeNull()
    expect(transition(inv, 'decline').status).toBe('已拒绝')
  })

  it('终态恒等：已接受/已拒绝的邀请再执行任何动作都原样返回', () => {
    const inv = createInvitation({ projectId: 'p1', inviterId: 'user-alice', inviteeId: 'user-ben' })
    const accepted = transition(inv, 'accept')
    expect(transition(accepted, 'accept')).toBe(accepted)
    expect(transition(accepted, 'decline')).toBe(accepted)
    const declined = transition(inv, 'decline')
    expect(transition(declined, 'accept')).toBe(declined)
    expect(transition(declined, 'decline')).toBe(declined)
  })

  it('接受前被邀请人对项目不可见；可见性只来自成员身份', () => {
    expect(canAccessProject(project, 'user-ben')).toBe(false)
    expect(canAccessProject(project, 'user-alice')).toBe(true)
  })

  it('拒绝不记黑名单：已拒绝的邀请可重建为新的待处理邀请', () => {
    const inv = createInvitation({ projectId: 'p1', inviterId: 'user-alice', inviteeId: 'user-ben' })
    const declined = transition(inv, 'decline')
    const rebuilt = rebuildInvitation(declined, 'user-alice')
    expect(rebuilt.status).toBe('待处理')
    expect(rebuilt.respondedAt).toBeNull()
    expect(rebuilt.inviteeId).toBe('user-ben')
  })

  it('可邀请名单排除现有成员与已有待处理邀请的用户', () => {
    const pending = createInvitation({ projectId: 'p1', inviterId: 'user-alice', inviteeId: 'user-ben' })
    const others = createInvitation({ projectId: 'p2', inviterId: 'user-alice', inviteeId: 'user-diana' })
    const invitable = listInvitableUserIds(['user-alice', 'user-ben', 'user-charlie', 'user-diana'], project, [
      pending,
      others,
    ])
    expect(invitable).toEqual(['user-charlie', 'user-diana'])
  })
})
