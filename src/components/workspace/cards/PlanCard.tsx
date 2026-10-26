import { Check, ClipboardList, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { MAX_PLAN_DECLINES, type WorkflowStage } from '@/engine/workflow'
import { useWorkflowStore } from '@/store/workflow'
import type { Message, PlanCardPayload } from '@/store/types'

interface PlanCardProps {
  message: Message & { card: PlanCardPayload }
  projectId: string
  stage: WorkflowStage
}

export function PlanCard({ message, projectId, stage }: PlanCardProps) {
  const status = useWorkflowStore((s) => s.cardStates[message.id] ?? 'pending')
  const declineCount = useWorkflowStore((s) => s.byProject[projectId]?.declineCount ?? 0)
  const runCommand = useWorkflowStore((s) => s.runCommand)

  const actionable = status === 'pending' && stage === '方案确认'
  const declineLeft = MAX_PLAN_DECLINES - declineCount

  return (
    <div className="mt-2 max-w-[420px] rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ClipboardList className="h-4 w-4 text-violet-500" />
        {message.card.title}
        {status === 'approved' && (
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">已批准</span>
        )}
        {status === 'rejected' && (
          <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700">已拒绝</span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{message.card.summary}</p>
      {actionable && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => runCommand({ projectId, command: 'approve-plan', cardId: message.id })}
          >
            <Check className="mr-1 h-4 w-4" />
            批准
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={declineLeft <= 0}
            onClick={() => runCommand({ projectId, command: 'decline-plan', cardId: message.id })}
          >
            <X className="mr-1 h-4 w-4" />
            拒绝{declineLeft > 0 ? `（剩余 ${declineLeft} 次）` : ''}
          </Button>
        </div>
      )}
      {actionable && declineLeft <= 0 && (
        <p className="mt-2 text-xs text-muted-foreground">已达到最大拒绝次数，这版方案已按你的反馈收敛，建议批准。</p>
      )}
    </div>
  )
}
