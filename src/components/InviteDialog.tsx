import { useState } from 'react'
import { Check, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserAvatar } from '@/components/UserAvatar'
import { listInvitableUserIds } from '@/engine/invitations'
import { cn } from '@/lib/utils'
import { useInvitationsStore } from '@/store/invitations'
import { useProjectsStore } from '@/store/projects'
import { useUsersStore } from '@/store/users'

interface InviteDialogProps {
  projectId: string
}

export function InviteDialog({ projectId }: InviteDialogProps) {
  const currentUserId = useUsersStore((s) => s.currentUserId)
  const users = useUsersStore((s) => s.users)
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId))
  const invitations = useInvitationsStore((s) => s.invitations)
  const sendInvitations = useInvitationsStore((s) => s.sendInvitations)

  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  if (!project || !currentUserId) return null

  const invitableIds = listInvitableUserIds(
    users.map((u) => u.id),
    project,
    invitations,
  )
  const invitableUsers = users.filter((u) => invitableIds.includes(u.id))

  const toggle = (userId: string) =>
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setSelectedIds([])
  }

  const handleSend = () => {
    if (selectedIds.length === 0) return
    sendInvitations({ projectId: project.id, inviterId: currentUserId, inviteeIds: selectedIds })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4" />
          邀请成员
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>邀请成员</DialogTitle>
          <DialogDescription>勾选用户并发出邀请，可一次邀请多人加入「{project.name}」。</DialogDescription>
        </DialogHeader>
        {invitableUsers.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            暂无可邀请的用户
          </p>
        ) : (
          <div className="space-y-2">
            {invitableUsers.map((user) => {
              const selected = selectedIds.includes(user.id)
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggle(user.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                    selected ? 'border-primary bg-primary/5' : 'hover:border-primary/40',
                  )}
                >
                  <UserAvatar name={user.name} color={user.color} className="h-8 w-8" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{user.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              )
            })}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSend} disabled={selectedIds.length === 0}>
            发出邀请{selectedIds.length > 0 ? `（${selectedIds.length} 人）` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
