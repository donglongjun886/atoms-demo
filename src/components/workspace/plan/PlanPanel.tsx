import { useEffect, useState } from 'react'
import { Pencil, SendHorizonal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CommentList, EditHistory } from '@/components/workspace/plan/records'
import { KindToggle, SectionedPlan } from '@/components/workspace/plan/SectionedPlan'
import { usePlansStore } from '@/store/plans'
import { useProjectsStore } from '@/store/projects'
import { useUsersStore } from '@/store/users'
import type { PlanCommentKind } from '@/store/types'

interface PlanPanelProps {
  projectId: string
}

export function PlanPanel({ projectId }: PlanPanelProps) {
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId))
  const plan = usePlansStore((s) => s.plans[projectId])
  const ensurePlan = usePlansStore((s) => s.ensurePlan)
  const savePlan = usePlansStore((s) => s.savePlan)
  const addComment = usePlansStore((s) => s.addComment)
  const users = useUsersStore((s) => s.users)
  const currentUser = useUsersStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [commentInput, setCommentInput] = useState('')
  const [commentKind, setCommentKind] = useState<PlanCommentKind>('评论')

  useEffect(() => {
    ensurePlan(projectId, project?.name)
  }, [ensurePlan, projectId, project?.name])

  if (!plan) return null

  const startEdit = () => {
    setDraft(plan.content)
    setEditing(true)
  }

  const handleSave = () => {
    if (!currentUser) return
    savePlan({ projectId, content: draft, authorId: currentUser.id })
    setEditing(false)
  }

  const handleComment = () => {
    const content = commentInput.trim()
    if (!content || !currentUser) return
    addComment({ projectId, authorId: currentUser.id, content, kind: commentKind })
    setCommentInput('')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">方案文档</h3>
          {editing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                取消
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!currentUser || draft === plan.content}>
                保存
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={startEdit} disabled={!currentUser}>
              <Pencil className="h-3.5 w-3.5" />
              编辑
            </Button>
          )}
        </div>
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[320px] w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-sm leading-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        ) : (
          <SectionedPlan
            content={plan.content}
            comments={plan.comments}
            users={users}
            currentUser={currentUser}
            onAnnotate={({ section, kind, content }) =>
              currentUser && addComment({ projectId, authorId: currentUser.id, content, kind, section })
            }
          />
        )}
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">修改记录</h3>
        <EditHistory edits={plan.edits} users={users} />
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">评论区</h3>
        <CommentList comments={plan.comments} users={users} />
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleComment()
          }}
        >
          <KindToggle value={commentKind} onChange={setCommentKind} />
          <Input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="写下你对整体方案的评论…"
            className="flex-1"
            disabled={!currentUser}
          />
          <Button type="submit" size="icon" disabled={!currentUser || !commentInput.trim()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </div>
  )
}
