import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plus, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InvitationNoticeCards } from '@/components/InvitationNoticeCards'
import { UserAvatar } from '@/components/UserAvatar'
import type { Project } from '@/store/types'
import { useProjectsStore } from '@/store/projects'
import { useUsersStore } from '@/store/users'

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const users = useUsersStore((s) => s.users)
  const members = users.filter((u) => project.memberIds.includes(u.id))

  return (
    <button onClick={onClick} className="text-left">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{project.name}</CardTitle>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {project.stage}
            </span>
          </div>
          {project.description && <CardDescription>{project.description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.map((member) => (
              <UserAvatar
                key={member.id}
                name={member.name}
                color={member.color}
                className="h-7 w-7 border-2 border-background"
              />
            ))}
          </div>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {project.memberIds.length} 人协作
          </span>
        </CardContent>
      </Card>
    </button>
  )
}

function ProjectSection({ title, projects }: { title: string; projects: Project[] }) {
  const navigate = useNavigate()
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">暂无项目</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
          ))}
        </div>
      )}
    </section>
  )
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const currentUserId = useUsersStore((s) => s.currentUserId)
  const users = useUsersStore((s) => s.users)
  const logout = useUsersStore((s) => s.logout)
  const projects = useProjectsStore((s) => s.projects)
  const createProject = useProjectsStore((s) => s.createProject)

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState('')

  const currentUser = users.find((u) => u.id === currentUserId)
  if (!currentUser) return null

  const myProjects = projects.filter((p) => p.ownerId === currentUser.id)
  const joinedProjects = projects.filter((p) => p.ownerId !== currentUser.id && p.memberIds.includes(currentUser.id))

  const handleCreate = () => {
    if (!name.trim()) {
      setNameError('请输入项目名称')
      return
    }
    const project = createProject({ name: name.trim(), description: description.trim(), ownerId: currentUser.id })
    setCreateOpen(false)
    setName('')
    setDescription('')
    setNameError('')
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="min-h-full bg-muted/40">
      <header className="flex items-center justify-between border-b bg-background px-8 py-4">
        <h1 className="text-xl font-bold">Atoms-Demo</h1>
        <div className="flex items-center gap-3">
          <UserAvatar name={currentUser.name} color={currentUser.color} className="h-8 w-8" />
          <span className="font-medium">{currentUser.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-8 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">项目</h2>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                新建项目
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建项目</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="项目名称" value={name} onChange={(e) => setName(e.target.value)} />
                {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                <Input
                  placeholder="项目描述（可选）"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreate}>创建</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <InvitationNoticeCards />

        <ProjectSection title="我的项目" projects={myProjects} />
        <ProjectSection title="参与的项目" projects={joinedProjects} />
      </main>
    </div>
  )
}
