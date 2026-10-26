import { CheckCircle2, ListChecks } from 'lucide-react'

import type { ActivityCardPayload, Message } from '@/store/types'

interface ActivityCardProps {
  message: Message & { card: ActivityCardPayload }
}

export function ActivityCard({ message }: ActivityCardProps) {
  return (
    <div className="mt-2 max-w-[420px] rounded-lg border border-dashed bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ListChecks className="h-4 w-4 text-emerald-500" />
        {message.card.title}
      </div>
      <ul className="mt-3 space-y-1.5">
        {message.card.steps.map((step) => (
          <li key={step} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}
