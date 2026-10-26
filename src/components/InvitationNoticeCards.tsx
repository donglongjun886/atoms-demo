import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/UserAvatar'
import { useInvitationsStore } from '@/store/invitations'
import { useProjectsStore } from '@/store/projects'
import { useUsersStore } from '@/store/users'

export function InvitationNoticeCards() {
  const currentUserId = useUsersStore((s) => s.currentUserId)
  const users = useUsersStore((s) => s.users)
  const projects = useProjectsStore((s) => s.projects)
  const invitations = useInvitationsStore((s) => s.invitations)
  const acceptInvitation = useInvitationsStore((s) => s.acceptInvitation)
  const declineInvitation = useInvitationsStore((s) => s.declineInvitation)

  const pending = invitations.filter((i) => i.inviteeId === currentUserId && i.status === '待处理')
  if (pending.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">邀请通知</h2>
      {pending.map((invitation) => {
        const project = projects.find((p) => p.id === invitation.projectId)
        if (!project) return null
        const inviter = users.find((u) => u.id === invitation.inviterId)
        return (
          <Card key={invitation.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar
                  name={inviter?.name ?? '?'}
                  color={inviter?.color ?? '#64748B'}
                  className="h-9 w-9 shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {inviter?.name ?? '有人'} 邀请你加入「{project.name}」
                  </p>
                  {project.description && (
                    <p className="truncate text-xs text-muted-foreground">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => declineInvitation(invitation.id)}>
                  拒绝
                </Button>
                <Button size="sm" onClick={() => acceptInvitation(invitation.id)}>
                  接受
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
