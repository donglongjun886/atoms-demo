import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { INITIAL_STAGE } from '@/engine/workflow'
import type { Project } from '@/store/types'

interface ProjectsState {
  projects: Project[]
  createProject: (input: { name: string; description?: string; ownerId: string }) => Project
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
    }),
    {
      name: 'atoms-demo:projects',
      version: 1,
      migrate: () => ({ projects: [] }),
    },
  ),
)
