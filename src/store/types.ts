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
