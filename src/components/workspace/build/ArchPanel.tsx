import { ArrowDown, Check, Loader2 } from 'lucide-react'

import type { WorkflowStage } from '@/engine/workflow'
import { cn } from '@/lib/utils'
import { BUILD_MODULES } from './modules'
import type { BuildTimelineView, ModuleBuildStatus } from './useBuildTimeline'

interface ArchPanelProps {
  stage: WorkflowStage
  timeline: BuildTimelineView
}

const STATUS_LABEL: Record<ModuleBuildStatus, string> = {
  waiting: '等待',
  building: '构建中',
  done: '完成',
}

function StatusBadge({ status }: { status: ModuleBuildStatus }) {
  if (status === 'building') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
        <Loader2 className="h-3 w-3 animate-spin" />
        {STATUS_LABEL[status]}
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
        <Check className="h-3 w-3" />
        {STATUS_LABEL[status]}
      </span>
    )
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {STATUS_LABEL[status]}
    </span>
  )
}

export function ArchPanel({ stage, timeline }: ArchPanelProps) {
  if (stage === '需求分析' || stage === '方案确认') {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">架构图将在架构设计阶段由 Bob 产出，构建时模块将逐个变色</p>
      </div>
    )
  }

  const doneCount = timeline.moduleStatus.filter((s) => s === 'done').length

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">模块架构图</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Bob 设计 · 四层结构，与预览应用真实代码一一对应</p>
        </div>
        {(timeline.animating || timeline.built) && (
          <span className="text-xs text-muted-foreground">
            {doneCount} / {BUILD_MODULES.length} 模块完成
          </span>
        )}
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${(doneCount / BUILD_MODULES.length) * 100}%` }}
        />
      </div>
      <div>
        {BUILD_MODULES.map((mod, index) => {
          const status = timeline.moduleStatus[index]
          const revealedFiles = mod.files.slice(0, timeline.visibleFiles[index])
          return (
            <div key={mod.id}>
              {index > 0 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg border p-4 transition-colors duration-500',
                  status === 'building' && 'border-amber-400 bg-amber-50/60',
                  status === 'done' && 'border-emerald-400 bg-emerald-50/50',
                  status === 'waiting' && 'border-dashed',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-sm font-semibold', status === 'waiting' && 'text-muted-foreground')}>
                    {mod.name}
                  </span>
                  <StatusBadge status={status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{mod.description}</p>
                {revealedFiles.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {revealedFiles.map((file) => (
                      <span
                        key={file.path}
                        className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-border"
                      >
                        {file.path.split('/').pop()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
