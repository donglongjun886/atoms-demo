import { useState } from 'react'
import { MessageSquarePlus, SendHorizonal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarkdownView } from '@/components/workspace/plan/MarkdownView'
import { CommentList } from '@/components/workspace/plan/records'
import { splitPlanSections } from '@/components/workspace/plan/sections'
import { cn } from '@/lib/utils'
import type { PlanComment, PlanCommentKind, User } from '@/store/types'

const KINDS: PlanCommentKind[] = ['评论', '建议', '修改']

export function KindToggle({ value, onChange }: { value: PlanCommentKind; onChange: (kind: PlanCommentKind) => void }) {
  return (
    <span className="flex shrink-0 overflow-hidden rounded-md border">
      {KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onChange(kind)}
          className={cn(
            'px-2 py-1 text-xs transition-colors',
            value === kind ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted',
          )}
        >
          {kind}
        </button>
      ))}
    </span>
  )
}

interface SectionedPlanProps {
  content: string
  comments: PlanComment[]
  users: User[]
  currentUser: User | null
  onAnnotate: (input: { section: string; kind: PlanCommentKind; content: string }) => void
}

export function SectionedPlan({ content, comments, users, currentUser, onAnnotate }: SectionedPlanProps) {
  const sections = splitPlanSections(content)
  const [openSection, setOpenSection] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [kind, setKind] = useState<PlanCommentKind>('评论')

  const toggle = (index: number) => {
    setOpenSection((prev) => (prev === index ? null : index))
    setDraft('')
    setKind('评论')
  }

  const submit = (section: string) => {
    const text = draft.trim()
    if (!text || !currentUser) return
    onAnnotate({ section, kind, content: text })
    setDraft('')
  }

  return (
    <div>
      {sections.map((section, index) => {
        if (section.title === null) {
          return <MarkdownView key={`preamble-${index}`} content={section.markdown} />
        }
        const title = section.title
        const sectionComments = comments.filter((c) => c.section === title)
        const open = openSection === index
        return (
          <div key={`${index}-${title}`} className="group/section relative">
            <button
              type="button"
              onClick={() => toggle(index)}
              className={cn(
                'absolute right-0 top-4 flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm transition-opacity hover:text-foreground',
                open || sectionComments.length > 0 ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100',
              )}
            >
              <MessageSquarePlus className="h-3 w-3" />
              批注{sectionComments.length > 0 ? ` ${sectionComments.length}` : ''}
            </button>
            <MarkdownView content={section.markdown} />
            {open && (
              <div className="mb-3 rounded-md border bg-muted/40 p-3">
                {sectionComments.length > 0 && (
                  <div className="mb-3 border-b pb-3">
                    <CommentList comments={sectionComments} users={users} />
                  </div>
                )}
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    submit(title)
                  }}
                >
                  <KindToggle value={kind} onChange={setKind} />
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`对「${title}」的批注…`}
                    className="h-8 flex-1 text-xs"
                    disabled={!currentUser}
                  />
                  <Button type="submit" size="icon" className="h-8 w-8" disabled={!currentUser || !draft.trim()}>
                    <SendHorizonal className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
