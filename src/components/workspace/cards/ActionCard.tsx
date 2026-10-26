import { Hammer, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useWorkflowStore } from '@/store/workflow'
import { type WorkflowStage } from '@/engine/workflow'
import type { ActionCardPayload, Message } from '@/store/types'

interface ActionCardProps {
  message: Message & { card: ActionCardPayload }
  projectId: string
  stage: WorkflowStage
}

/** 通用单按钮卡片：按钮与对话指令等价，驱动同一状态机命令 */
export function ActionCard({ message, projectId, stage }: ActionCardProps) {
  const status = useWorkflowStore((s) => s.cardStates[message.id] ?? 'pending')
  const runCommand = useWorkflowStore((s) => s.runCommand)

  const actionable = status === 'pending' && stage === '架构设计'

  return (
    <div className="mt-2 max-w-[420px] rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Hammer className="h-4 w-4 text-amber-500" />
        {message.card.title}
        {status !== 'pending' && (
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">已执行</span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{message.card.body}</p>
      {actionable && (
        <Button
          size="sm"
          className="mt-4 w-full"
          onClick={() => runCommand({ projectId, command: message.card.command, cardId: message.id })}
        >
          <Play className="mr-1 h-4 w-4" />
          {message.card.actionLabel}
        </Button>
      )}
    </div>
  )
}
