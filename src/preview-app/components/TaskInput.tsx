import { useState } from 'react'
import { Plus } from 'lucide-react'

import { theme } from '../theme'

interface TaskInputProps {
  onAdd: (title: string) => void
}

export function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const title = value.trim()
    if (!title) return
    onAdd(title)
    setValue('')
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <input
        className={theme.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="添加新任务，回车确认"
      />
      <button type="submit" className={theme.primaryButton} disabled={!value.trim()}>
        <Plus className="h-4 w-4" />
        添加
      </button>
    </form>
  )
}
