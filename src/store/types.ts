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
