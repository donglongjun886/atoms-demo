import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { INITIAL_STAGE, type WorkflowStage } from '@/engine/workflow'
import type { Project } from '@/store/types'

interface ProjectsState {
  projects: Project[]
  createProject: (input: { name: string; description?: string; ownerId: string }) => Project
  addMember: (projectId: string, userId: string) => void
  setStage: (projectId: string, stage: WorkflowStage) => void
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      createProject: ({ name, description, ownerId }) => {
        const project: Project = {
          id: `project-${crypto.randomUUID()}`,
          name,
          description: description ?? '',
          ownerId,
          memberIds: [ownerId],
          stage: INITIAL_STAGE,
          createdAt: Date.now(),
        }
        set((state) => ({ projects: [...state.projects, project] }))
        return project
      },
      addMember: (projectId, userId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.memberIds.includes(userId) ? { ...p, memberIds: [...p.memberIds, userId] } : p,
          ),
        })),
      setStage: (projectId, stage) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === projectId ? { ...p, stage } : p)),
        })),
    }),
    {
      name: 'atoms-demo:projects',
      version: 1,
      migrate: () => ({ projects: [] }),
    },
  ),
)
