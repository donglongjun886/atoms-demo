import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PreviewTask {
  id: string
  projectId: string
  title: string
  completed: boolean
  createdAt: number
}

interface PreviewTasksState {
  tasks: PreviewTask[]
  addTask: (input: { projectId: string; title: string }) => void
  toggleTask: (taskId: string) => void
  removeTask: (taskId: string) => void
}

export const usePreviewTasksStore = create<PreviewTasksState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: ({ projectId, title }) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id: `task-${crypto.randomUUID()}`, projectId, title, completed: false, createdAt: Date.now() },
          ],
        })),
      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
        })),
      removeTask: (taskId) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== taskId) })),
    }),
    {
      name: 'atoms-demo:preview-tasks',
      version: 1,
      migrate: () => ({ tasks: [] }),
    },
  ),
)
