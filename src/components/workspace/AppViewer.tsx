import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArchPanel } from '@/components/workspace/build/ArchPanel'
import { CodePanel } from '@/components/workspace/build/CodePanel'
import { useBuildTimeline } from '@/components/workspace/build/useBuildTimeline'
import { PlanPanel } from '@/components/workspace/plan/PlanPanel'
import type { WorkflowStage } from '@/engine/workflow'
import { TaskApp } from '@/preview-app/TaskApp'
import { useProjectsStore } from '@/store/projects'
import { useWorkflowStore } from '@/store/workflow'

interface AppViewerProps {
  projectId: string
}

export function AppViewer({ projectId }: AppViewerProps) {
  const stage = useProjectsStore(
    (s) => s.projects.find((p) => p.id === projectId)?.stage ?? ('需求分析' as WorkflowStage),
  )
  const signal = useWorkflowStore((s) => s.byProject[projectId]?.buildSignal ?? null)
  const runCommand = useWorkflowStore((s) => s.runCommand)
  const timeline = useBuildTimeline(projectId)

  const [tab, setTab] = useState('plan')
  const prevRef = useRef<{ projectId: string; stage: WorkflowStage; signalNonce: number | null } | null>(null)

  // Tab 自动切换：进入代码生成切到代码 Tab；构建完成（→测试）切到预览 Tab；
  // 重播信号切到架构图 Tab；中途刷新（signal 仍为 build）落到代码 Tab。
  useEffect(() => {
    const prev = prevRef.current
    if (!prev || prev.projectId !== projectId) {
      if (signal?.mode === 'build') setTab('code')
    } else {
      if (stage === '代码生成' && prev.stage !== '代码生成') setTab('code')
      if (stage === '测试' && prev.stage === '代码生成') setTab('preview')
      if (signal && signal.nonce !== prev.signalNonce && signal.mode === 'replay') setTab('arch')
    }
    prevRef.current = { projectId, stage, signalNonce: signal?.nonce ?? null }
  }, [projectId, stage, signal])

  const appReady = stage === '测试' || stage === '预览'

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col">
      <div className="border-b px-4 pt-3">
        <TabsList>
          <TabsTrigger value="plan">方案</TabsTrigger>
          <TabsTrigger value="arch">架构图</TabsTrigger>
          <TabsTrigger value="code">代码</TabsTrigger>
          <TabsTrigger value="preview">预览</TabsTrigger>
        </TabsList>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <TabsContent value="plan" className="mt-0">
          <PlanPanel projectId={projectId} />
        </TabsContent>
        <TabsContent value="arch" className="mt-0">
          <ArchPanel stage={stage} timeline={timeline} />
        </TabsContent>
        <TabsContent value="code" className="mt-0 h-full">
          <CodePanel stage={stage} timeline={timeline} />
        </TabsContent>
        <TabsContent value="preview" className="mt-0">
          {appReady ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Alex 构建的可交互任务管理应用，任务数据随项目持久化，刷新不丢。
                </p>
                {stage === '预览' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => runCommand({ projectId, command: 'replay-build' })}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    再看一遍
                  </Button>
                )}
              </div>
              <TaskApp projectId={projectId} />
            </div>
          ) : (
            <Placeholder text="构建完成后，这里将展示可交互的任务管理应用" />
          )}
        </TabsContent>
      </div>
    </Tabs>
  )
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
