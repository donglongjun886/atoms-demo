import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppViewer } from '@/components/workspace/AppViewer'
import { ChatPanel } from '@/components/workspace/ChatPanel'
import { CollaboratorBar } from '@/components/workspace/CollaboratorBar'
import { StageBar } from '@/components/workspace/StageBar'
import { useProjectsStore } from '@/store/projects'
import { useUsersStore } from '@/store/users'

export function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId))
  const currentUserId = useUsersStore((s) => s.currentUserId)
  const currentUser = useUsersStore((s) => s.users.find((u) => u.id === currentUserId))

  if (!project || !currentUser) return null

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-6 border-b bg-background px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="truncate text-base font-semibold">{project.name}</h1>
        </div>
        <StageBar stage={project.stage} />
        <CollaboratorBar memberIds={project.memberIds} />
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[440px] shrink-0 flex-col border-r">
          <ChatPanel key={project.id} project={project} currentUser={currentUser} />
        </aside>
        <main className="min-w-0 flex-1 bg-muted/30">
          <AppViewer projectId={project.id} />
        </main>
      </div>
    </div>
  )
}
