import { Trash2 } from 'lucide-react'

import type { PreviewTask } from '@/store/previewTasks'
import { theme } from '../theme'

interface TaskListProps {
  tasks: PreviewTask[]
  onToggle: (taskId: string) => void
  onRemove: (taskId: string) => void
}

export function TaskList({ tasks, onToggle, onRemove }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className={theme.empty}>暂无任务，先在上方添加一条吧</div>
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className={theme.taskRow}>
          <input
            type="checkbox"
            className={theme.checkbox}
            checked={task.completed}
            onChange={() => onToggle(task.id)}
          />
          <span className={task.completed ? theme.taskTitleDone : theme.taskTitle}>{task.title}</span>
          <button
            type="button"
            className={theme.deleteButton}
            onClick={() => onRemove(task.id)}
            aria-label="删除任务"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
