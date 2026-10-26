import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useProjectsStore } from '@/store/projects'

export function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId))

  if (!project) return null

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-muted/40">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p className="text-muted-foreground">共创空间即将上线，敬请期待</p>
      <Button variant="outline" asChild>
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>
      </Button>
    </div>
  )
}
