import type { WorkflowStage } from '@/engine/workflow'

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

export interface Message {
  id: string
  projectId: string
  senderId: string
  content: string
  createdAt: number
}

export interface PlanEdit {
  id: string
  projectId: string
  authorId: string
  action: string
  createdAt: number
}

export interface PlanComment {
  id: string
  projectId: string
  authorId: string
  content: string
  createdAt: number
}

export interface ProjectPlan {
  content: string
  edits: PlanEdit[]
  comments: PlanComment[]
}
