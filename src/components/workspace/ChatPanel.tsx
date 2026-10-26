import { useEffect, useMemo, useRef, useState } from 'react'
import { SendHorizonal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/UserAvatar'
import { AGENT_TEAM } from '@/engine/agents'
import { createMessage, dispatchUserMessage } from '@/engine/scripts'
import { cn } from '@/lib/utils'
import { useMessagesStore } from '@/store/messages'
import type { Message, Project, User } from '@/store/types'
import { useUsersStore } from '@/store/users'

function resolveSender(senderId: string, users: User[]) {
  const agent = AGENT_TEAM.find((a) => a.id === senderId)
  if (agent) return { name: agent.name, color: agent.color, role: agent.role }
  const user = users.find((u) => u.id === senderId)
  return { name: user?.name ?? '未知用户', color: user?.color ?? '#64748B', role: null }
}

function MessageItem({ message, users }: { message: Message; users: User[] }) {
  const sender = resolveSender(message.senderId, users)
  const time = new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex gap-2.5">
      <UserAvatar name={sender.name} color={sender.color} className="mt-0.5 h-8 w-8 shrink-0" />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium" style={{ color: sender.color }}>
            {sender.name}
          </span>
          {sender.role && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: sender.color }}
            >
              {sender.role}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{message.content}</p>
      </div>
    </div>
  )
}

interface ChatPanelProps {
  project: Project
  currentUser: User
}

export function ChatPanel({ project, currentUser }: ChatPanelProps) {
  const allMessages = useMessagesStore((s) => s.messages)
  const appendMessages = useMessagesStore((s) => s.appendMessages)
  const users = useUsersStore((s) => s.users)

  const messages = useMemo(() => allMessages.filter((m) => m.projectId === project.id), [allMessages, project.id])
  const [visibleCount, setVisibleCount] = useState(
    () => useMessagesStore.getState().messages.filter((m) => m.projectId === project.id).length,
  )
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visibleCount >= messages.length) return
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 300 + Math.random() * 700)
    return () => clearTimeout(timer)
  }, [visibleCount, messages.length])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [visibleCount])

  const visibleMessages = messages.slice(0, visibleCount)

  const handleSend = () => {
    const content = input.trim()
    if (!content) return
    const userMessage = createMessage({ projectId: project.id, senderId: currentUser.id, content })
    const replies = dispatchUserMessage({ projectId: project.id, content, stage: project.stage })
    appendMessages([userMessage, ...replies])
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {visibleMessages.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            还没有消息，向 Agent 团队描述你想做的应用吧
          </p>
        ) : (
          visibleMessages.map((message) => <MessageItem key={message.id} message={message} users={users} />)
        )}
      </div>
      <div className="border-t p-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="发消息，或用指令推进流程…"
            className={cn('flex-1')}
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
