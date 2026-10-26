import { TASK_FILTERS, type TaskFilter } from '../useTasks'
import { theme } from '../theme'

interface FilterBarProps {
  filter: TaskFilter
  onChange: (filter: TaskFilter) => void
}

export function FilterBar({ filter, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-2">
      {TASK_FILTERS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`${theme.filterButton} ${filter === item ? theme.filterButtonActive : theme.filterButtonIdle}`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
