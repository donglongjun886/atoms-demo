import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  color: string
  className?: string
}

export function UserAvatar({ name, color, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarFallback style={{ backgroundColor: color }} className={cn('font-semibold text-white')}>
        {name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
