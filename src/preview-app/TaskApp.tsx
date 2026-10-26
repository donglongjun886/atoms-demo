import { useState } from 'react'

import { FilterBar } from './components/FilterBar'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { theme } from './theme'
import { useTasks, type TaskFilter } from './useTasks'

interface TaskAppProps {
  projectId: string
}

export function TaskApp({ projectId }: TaskAppProps) {
  const [filter, setFilter] = useState<TaskFilter>('全部')
  const { tasks, total, remaining, addTask, toggleTask, removeTask } = useTasks(projectId, filter)

  return (
    <div className={theme.app}>
      <div className={theme.header}>
        <span className={theme.title}>任务管理</span>
        <span className={theme.badge}>
          剩余 {remaining} / 共 {total}
        </span>
      </div>
      <div className={theme.body}>
        <TaskInput onAdd={addTask} />
        <FilterBar filter={filter} onChange={setFilter} />
        <TaskList tasks={tasks} onToggle={toggleTask} onRemove={removeTask} />
      </div>
    </div>
  )
}
