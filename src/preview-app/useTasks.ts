import { useMemo } from 'react'

import { usePreviewTasksStore } from '@/store/previewTasks'

export type TaskFilter = '全部' | '进行中' | '已完成'

export const TASK_FILTERS: TaskFilter[] = ['全部', '进行中', '已完成']

export function useTasks(projectId: string, filter: TaskFilter) {
  const tasks = usePreviewTasksStore((s) => s.tasks)
  const addTask = usePreviewTasksStore((s) => s.addTask)
  const toggleTask = usePreviewTasksStore((s) => s.toggleTask)
  const removeTask = usePreviewTasksStore((s) => s.removeTask)

  const projectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === projectId).sort((a, b) => a.createdAt - b.createdAt),
    [tasks, projectId],
  )

  const visibleTasks = useMemo(() => {
    if (filter === '进行中') return projectTasks.filter((task) => !task.completed)
    if (filter === '已完成') return projectTasks.filter((task) => task.completed)
    return projectTasks
  }, [projectTasks, filter])

  return {
    tasks: visibleTasks,
    total: projectTasks.length,
    remaining: projectTasks.filter((task) => !task.completed).length,
    addTask: (title: string) => addTask({ projectId, title }),
    toggleTask,
    removeTask,
  }
}
