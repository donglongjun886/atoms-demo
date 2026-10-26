import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlanPanel } from '@/components/workspace/plan/PlanPanel'

interface AppViewerProps {
  projectId: string
}

export function AppViewer({ projectId }: AppViewerProps) {
  return (
    <Tabs defaultValue="plan" className="flex h-full flex-col">
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
          <Placeholder text="架构图将在架构设计阶段由 Bob 产出，构建时模块将逐个变色" />
        </TabsContent>
        <TabsContent value="code" className="mt-0">
          <Placeholder text="代码将在代码生成阶段由 Alex 逐个文件产出" />
        </TabsContent>
        <TabsContent value="preview" className="mt-0">
          <Placeholder text="构建完成后，这里将展示可交互的任务管理应用" />
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
