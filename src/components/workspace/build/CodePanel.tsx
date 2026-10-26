import { useEffect, useMemo, useState } from 'react'
import { FileCode2 } from 'lucide-react'

import type { WorkflowStage } from '@/engine/workflow'
import { cn } from '@/lib/utils'
import { BUILD_MODULES, type BuildFile } from './modules'
import type { BuildTimelineView } from './useBuildTimeline'

interface CodePanelProps {
  stage: WorkflowStage
  timeline: BuildTimelineView
}

export function CodePanel({ stage, timeline }: CodePanelProps) {
  const revealed = useMemo(() => {
    const files: BuildFile[] = []
    BUILD_MODULES.forEach((mod, index) => {
      files.push(...mod.files.slice(0, timeline.visibleFiles[index]))
    })
    return files
  }, [timeline.visibleFiles])

  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const latestPath = revealed.length > 0 ? revealed[revealed.length - 1].path : null

  useEffect(() => {
    if (timeline.animating && latestPath) setSelectedPath(latestPath)
  }, [timeline.animating, latestPath])

  if (!timeline.built && !timeline.animating) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          {stage === '代码生成' ? '构建即将开始，代码文件将逐个产出' : '代码将在代码生成阶段由 Alex 逐个文件产出'}
        </p>
      </div>
    )
  }

  const selected =
    revealed.find((file) => file.path === selectedPath) ??
    revealed.find((file) => file.path.endsWith('TaskApp.tsx')) ??
    revealed[revealed.length - 1]

  return (
    <div className="flex h-full min-h-[420px] overflow-hidden rounded-lg border bg-background">
      <aside className="w-[220px] shrink-0 overflow-y-auto border-r bg-muted/30 py-2">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          文件（{revealed.length}）
        </p>
        {BUILD_MODULES.map((mod, moduleIndex) => {
          const files = mod.files.slice(0, timeline.visibleFiles[moduleIndex])
          if (files.length === 0) return null
          return (
            <div key={mod.id} className="mb-1">
              <p className="px-3 py-1 text-[10px] text-muted-foreground">{mod.name}</p>
              {files.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={cn(
                    'flex w-full items-center gap-1.5 px-3 py-1 text-left font-mono text-xs hover:bg-muted',
                    selected?.path === file.path && 'bg-muted font-semibold text-foreground',
                  )}
                >
                  <FileCode2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate">{file.path.split('/').pop()}</span>
                </button>
              ))}
            </div>
          )
        })}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {selected && (
          <>
            <div className="border-b px-4 py-2 font-mono text-xs text-muted-foreground">{selected.path}</div>
            <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-5">{selected.code}</pre>
          </>
        )}
      </div>
    </div>
  )
}
