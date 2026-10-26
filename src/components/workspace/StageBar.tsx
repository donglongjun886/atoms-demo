import { Check } from 'lucide-react'

import { AGENT_TEAM } from '@/engine/agents'
import { STAGE_AGENT, WORKFLOW_STAGES, type WorkflowStage } from '@/engine/workflow'
import { cn } from '@/lib/utils'

interface StageBarProps {
  stage: WorkflowStage
}

export function StageBar({ stage }: StageBarProps) {
  const currentIndex = WORKFLOW_STAGES.indexOf(stage)

  return (
    <ol className="flex items-center gap-1">
      {WORKFLOW_STAGES.map((name, index) => {
        const agent = AGENT_TEAM.find((a) => a.id === STAGE_AGENT[name])
        const isCurrent = index === currentIndex
        const isDone = index < currentIndex
        return (
          <li key={name} className="flex items-center gap-1">
            {index > 0 && <span className={cn('h-px w-4', isDone || isCurrent ? 'bg-primary' : 'bg-border')} />}
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                isCurrent && 'border-primary bg-primary/10 text-primary',
                isDone && 'border-primary/40 bg-primary/5 text-primary/70',
                !isCurrent && !isDone && 'text-muted-foreground',
              )}
            >
              {isDone && <Check className="h-3 w-3" />}
              {name}
              {isCurrent && agent && (
                <span className="flex items-center gap-1 text-[10px] font-normal text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: agent.color }} />
                  {agent.name} 工作中
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
