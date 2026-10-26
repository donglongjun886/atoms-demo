import { UserAvatar } from '@/components/UserAvatar'
import { AGENT_TEAM } from '@/engine/agents'
import type { PlanEdit, PlanComment, User } from '@/store/types'

export function resolveAuthor(authorId: string, users: User[]) {
  const agent = AGENT_TEAM.find((a) => a.id === authorId)
  if (agent) return { name: agent.name, color: agent.color }
  const user = users.find((u) => u.id === authorId)
  return { name: user?.name ?? '未知用户', color: user?.color ?? '#64748B' }
}

export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EditHistory({ edits, users }: { edits: PlanEdit[]; users: User[] }) {
  if (edits.length === 0) {
    return <p className="text-sm text-muted-foreground">还没有修改记录</p>
  }
  return (
    <ul className="space-y-2">
      {[...edits].reverse().map((edit) => {
        const author = resolveAuthor(edit.authorId, users)
        return (
          <li key={edit.id} className="flex items-center gap-2 text-sm">
            <UserAvatar name={author.name} color={author.color} className="h-6 w-6 shrink-0 text-xs" />
            <span className="font-medium" style={{ color: author.color }}>
              {author.name}
            </span>
            <span>{edit.action}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatTime(edit.createdAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function CommentList({ comments, users }: { comments: PlanComment[]; users: User[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">还没有评论，来抢沙发</p>
  }
  return (
    <ul className="space-y-3">
      {comments.map((comment) => {
        const author = resolveAuthor(comment.authorId, users)
        return (
          <li key={comment.id} className="flex gap-2.5">
            <UserAvatar name={author.name} color={author.color} className="mt-0.5 h-7 w-7 shrink-0 text-xs" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium" style={{ color: author.color }}>
                  {author.name}
                </span>
                <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{comment.content}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
