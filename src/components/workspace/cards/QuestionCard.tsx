import { useState } from 'react'
import { CircleHelp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkflowStore } from '@/store/workflow'
import type { Message, QuestionCardPayload } from '@/store/types'

interface QuestionCardProps {
  message: Message & { card: QuestionCardPayload }
  projectId: string
}

export function QuestionCard({ message, projectId }: QuestionCardProps) {
  const status = useWorkflowStore((s) => s.cardStates[message.id] ?? 'pending')
  const submittedAnswers = useWorkflowStore((s) => s.cardAnswers[message.id])
  const submitAnswers = useWorkflowStore((s) => s.submitAnswers)
  const [drafts, setDrafts] = useState<string[]>(() => message.card.questions.map(() => ''))

  const submitted = status === 'submitted'
  const answers = submittedAnswers ?? drafts
  const canSubmit = !submitted && drafts.every((d) => d.trim().length > 0)

  return (
    <div className="mt-2 max-w-[420px] rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CircleHelp className="h-4 w-4 text-sky-500" />
        需求澄清（{message.card.questions.length} 题）
        {submitted && <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">已提交</span>}
      </div>
      <div className="mt-3 space-y-3">
        {message.card.questions.map((question, index) => (
          <div key={index}>
            <p className="text-xs font-medium text-muted-foreground">
              {index + 1}. {question}
            </p>
            {submitted ? (
              <p className="mt-1 rounded-md bg-muted px-2.5 py-1.5 text-sm">{answers[index]}</p>
            ) : (
              <Input
                className="mt-1 h-8 text-sm"
                value={drafts[index]}
                onChange={(e) =>
                  setDrafts((prev) => prev.map((d, i) => (i === index ? e.target.value : d)))
                }
                placeholder="请输入回答"
              />
            )}
          </div>
        ))}
      </div>
      {!submitted && (
        <Button
          className="mt-4 w-full"
          size="sm"
          disabled={!canSubmit}
          onClick={() => submitAnswers({ projectId, cardId: message.id, answers: drafts.map((d) => d.trim()) })}
        >
          提交回答
        </Button>
      )}
    </div>
  )
}
