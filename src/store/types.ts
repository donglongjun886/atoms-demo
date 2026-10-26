import type { WorkflowCommandName, WorkflowStage } from '@/engine/workflow'

export interface User {
  id: string
  name: string
  email: string
  password: string
  color: string
}

export interface Project {
  id: string
  name: string
  description: string
  ownerId: string
  memberIds: string[]
  stage: WorkflowStage
  createdAt: number
}

export interface QuestionCardPayload {
  type: 'question'
  questions: string[]
}

export interface PlanCardPayload {
  type: 'plan'
  title: string
  summary: string
  version: number
}

export interface ActivityCardPayload {
  type: 'activity'
  title: string
  steps: string[]
}

export interface ActionCardPayload {
  type: 'action'
  title: string
  body: string
  actionLabel: string
  command: WorkflowCommandName
}

export type MessageCard = QuestionCardPayload | PlanCardPayload | ActivityCardPayload | ActionCardPayload

export interface Message {
  id: string
  projectId: string
  senderId: string
  content: string
  createdAt: number
  card?: MessageCard
}

export interface PlanEdit {
  id: string
  projectId: string
  authorId: string
  action: string
  createdAt: number
}

export type PlanCommentKind = '评论' | '建议' | '修改'

export interface PlanComment {
  id: string
  projectId: string
  authorId: string
  content: string
  /** 批注类型；早期数据无此字段时按「评论」展示 */
  kind?: PlanCommentKind
  /** 所属章节（方案的 h2 标题）；null/缺省表示整体评论 */
  section?: string | null
  createdAt: number
}

export interface ProjectPlan {
  content: string
  edits: PlanEdit[]
  comments: PlanComment[]
}

export type InvitationStatus = '待处理' | '已接受' | '已拒绝'

export interface Invitation {
  id: string
  projectId: string
  inviterId: string
  inviteeId: string
  status: InvitationStatus
  createdAt: number
  respondedAt: number | null
}
