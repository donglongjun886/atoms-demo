import { UserAvatar } from '@/components/UserAvatar'
import { AGENT_TEAM } from '@/engine/agents'
import { useUsersStore } from '@/store/users'

interface CollaboratorBarProps {
  memberIds: string[]
}

export function CollaboratorBar({ memberIds }: CollaboratorBarProps) {
  const users = useUsersStore((s) => s.users)
  const members = users.filter((u) => memberIds.includes(u.id))

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.map((member) => (
          <span key={member.id} title={member.name}>
            <UserAvatar name={member.name} color={member.color} className="h-7 w-7 border-2 border-background" />
          </span>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">+</span>
      <div className="flex -space-x-2">
        {AGENT_TEAM.map((agent) => (
          <span key={agent.id} title={`${agent.name}（${agent.role}）`}>
            <UserAvatar name={agent.name} color={agent.color} className="h-7 w-7 border-2 border-background" />
          </span>
        ))}
      </div>
    </div>
  )
}
