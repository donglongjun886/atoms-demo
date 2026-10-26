import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { PlanComment, PlanCommentKind, PlanEdit, ProjectPlan } from '@/store/types'

export function createPlanTemplate(projectName: string): string {
  return `# ${projectName} 方案

> 方案确认阶段由 Emma 产出初稿，团队成员可在此共同编辑。

## 目标

待补充：本应用要解决的核心问题与目标用户。

## 核心功能

- 待补充：功能点一
- 待补充：功能点二

## 页面与交互

待补充：主要页面结构与关键交互流程。

## 技术要点

待补充：数据模型、状态管理与关键实现决策。
`
}

const emptyPlan = (projectName?: string): ProjectPlan => ({
  content: createPlanTemplate(projectName ?? '未命名项目'),
  edits: [],
  comments: [],
})

interface PlansState {
  plans: Record<string, ProjectPlan>
  ensurePlan: (projectId: string, projectName?: string) => void
  savePlan: (input: { projectId: string; content: string; authorId: string; action?: string }) => void
  addComment: (input: {
    projectId: string
    authorId: string
    content: string
    kind?: PlanCommentKind
    section?: string | null
  }) => void
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      plans: {},
      ensurePlan: (projectId, projectName) =>
        set((state) =>
          state.plans[projectId] ? state : { plans: { ...state.plans, [projectId]: emptyPlan(projectName) } },
        ),
      savePlan: ({ projectId, content, authorId, action }) =>
        set((state) => {
          const plan = state.plans[projectId] ?? emptyPlan()
          const edit: PlanEdit = {
            id: `edit-${crypto.randomUUID()}`,
            projectId,
            authorId,
            action: action ?? '编辑并保存了方案',
            createdAt: Date.now(),
          }
          return { plans: { ...state.plans, [projectId]: { ...plan, content, edits: [...plan.edits, edit] } } }
        }),
      addComment: ({ projectId, authorId, content, kind, section }) =>
        set((state) => {
          const plan = state.plans[projectId] ?? emptyPlan()
          const comment: PlanComment = {
            id: `comment-${crypto.randomUUID()}`,
            projectId,
            authorId,
            content,
            kind: kind ?? '评论',
            section: section ?? null,
            createdAt: Date.now(),
          }
          return { plans: { ...state.plans, [projectId]: { ...plan, comments: [...plan.comments, comment] } } }
        }),
    }),
    {
      name: 'atoms-demo:plans',
      version: 1,
      migrate: () => ({ plans: {} }),
    },
  ),
)
