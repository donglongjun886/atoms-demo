import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import * as scripts from '@/engine/scripts'
import {
  canTransition,
  transition,
  type WorkflowCommandName,
  type WorkflowMachineState,
} from '@/engine/workflow'
import { useMessagesStore } from '@/store/messages'
import { usePlansStore } from '@/store/plans'
import { useProjectsStore } from '@/store/projects'
import type { Message } from '@/store/types'

export type CardStatus = 'pending' | 'submitted' | 'approved' | 'rejected'

/**
 * 构建动画触发接缝（Ticket 04 使用）：
 * - mode 'build'：阶段刚推进到代码生成，动画完成后须调用 finishBuild 推进到测试；
 * - mode 'replay'：预览阶段的「再看一遍」，纯 UI 回放，完成后不得改动任何状态。
 * nonce 单调递增，Ticket 04 用 useEffect 监听 nonce 变化启动动画；刷新后若 mode 仍是
 * 'build'（动画中途刷新），直接重启动画即可回到代码生成入口待触发。
 */
export interface BuildSignal {
  nonce: number
  mode: 'build' | 'replay'
}

interface ProjectWorkflowExtras {
  declineCount: number
  questionCardPending: boolean
  questionsAnswered: boolean
  buildSignal: BuildSignal | null
}

const DEFAULT_EXTRAS: ProjectWorkflowExtras = {
  declineCount: 0,
  questionCardPending: false,
  questionsAnswered: false,
  buildSignal: null,
}

interface WorkflowState {
  byProject: Record<string, ProjectWorkflowExtras>
  cardStates: Record<string, CardStatus>
  cardAnswers: Record<string, string[]>
  /** 话术轮转计数：key = `${projectId}:${事件名}`，值为已触发次数 */
  scriptCounts: Record<string, number>
  sendUserMessage: (input: { projectId: string; userId: string; content: string }) => void
  submitAnswers: (input: { projectId: string; cardId: string; answers: string[] }) => void
  /** 卡片按钮入口：与对话指令驱动同一状态机 */
  runCommand: (input: { projectId: string; command: WorkflowCommandName; cardId?: string }) => void
  /** Ticket 04 动画（mode 'build'）完成回调：代码生成 → 测试，Alex 报覆盖率 */
  finishBuild: (input: { projectId: string }) => void
}

const initialState = {
  byProject: {},
  cardStates: {},
  cardAnswers: {},
  scriptCounts: {},
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => {
      const extrasOf = (projectId: string): ProjectWorkflowExtras =>
        get().byProject[projectId] ?? DEFAULT_EXTRAS

      const patchExtras = (projectId: string, patch: Partial<ProjectWorkflowExtras>) =>
        set((state) => ({
          byProject: {
            ...state.byProject,
            [projectId]: { ...extrasOf(projectId), ...patch },
          },
        }))

      /** 触发次数 +1 并返回本次使用的话术序号（0 起） */
      const bump = (projectId: string, event: string): number => {
        const key = `${projectId}:${event}`
        const count = get().scriptCounts[key] ?? 0
        set((state) => ({ scriptCounts: { ...state.scriptCounts, [key]: count + 1 } }))
        return count
      }

      const machineOf = (projectId: string): WorkflowMachineState | null => {
        const project = useProjectsStore.getState().projects.find((p) => p.id === projectId)
        if (!project) return null
        return { stage: project.stage, declineCount: extrasOf(projectId).declineCount }
      }

      const setStage = (projectId: string, stage: WorkflowMachineState['stage']) =>
        useProjectsStore.getState().setStage(projectId, stage)

      const append = (messages: Message[]) => {
        if (messages.length > 0) useMessagesStore.getState().appendMessages(messages)
      }

      const markCards = (messages: Message[], status: CardStatus) => {
        const ids = messages.filter((m) => m.card).map((m) => m.id)
        if (ids.length === 0) return
        set((state) => ({
          cardStates: {
            ...state.cardStates,
            ...Object.fromEntries(ids.map((id) => [id, status])),
          },
        }))
      }

      /** 文本指令批准/拒绝/开始构建时，定位该项目最新一张待处理的对应卡片 */
      const latestPendingCardId = (projectId: string, cardType: 'plan' | 'action'): string | undefined => {
        const cards = useMessagesStore
          .getState()
          .messages.filter((m) => m.projectId === projectId && m.card?.type === cardType)
        return [...cards].reverse().find((m) => (get().cardStates[m.id] ?? 'pending') === 'pending')?.id
      }

      /** Emma 产出计划卡时同步写入方案共编 Tab，修改记录按 Emma 留痕 */
      const syncPlanDocument = (projectId: string, declineCount: number) => {
        const project = useProjectsStore.getState().projects.find((p) => p.id === projectId)
        usePlansStore.getState().savePlan({
          projectId,
          content: scripts.buildPlanDocument(project?.name ?? '未命名项目', declineCount),
          authorId: 'agent-emma',
          action: declineCount === 0 ? '产出了方案初稿' : `产出了方案第 ${declineCount + 1} 版`,
        })
      }

      const runCommand = (projectId: string, command: WorkflowCommandName, cardId?: string) => {
        const machine = machineOf(projectId)
        if (!machine) return
        // 文本入口不带 cardId 时，作用于最新一张待处理的对应卡片
        const effectiveCardId =
          cardId ??
          (command === 'approve-plan' || command === 'decline-plan'
            ? latestPendingCardId(projectId, 'plan')
            : command === 'start-build'
              ? latestPendingCardId(projectId, 'action')
              : undefined)

        if (command === 'decline-plan' && !canTransition(machine, command)) {
          append(scripts.buildDeclineLimitMessages(projectId))
          return
        }

        const next = transition(machine, command)
        if (!next) {
          append(scripts.buildFallbackMessages(projectId, machine.stage, bump(projectId, 'fallback')))
          return
        }

        switch (command) {
          case 'describe-requirements': {
            setStage(projectId, next.stage)
            const planMessages = scripts.buildPlanMessages(projectId, next.declineCount, bump(projectId, 'emma-plan'))
            append(planMessages)
            markCards(planMessages, 'pending')
            syncPlanDocument(projectId, next.declineCount)
            break
          }
          case 'approve-plan': {
            setStage(projectId, next.stage)
            if (effectiveCardId) set((state) => ({ cardStates: { ...state.cardStates, [effectiveCardId]: 'approved' } }))
            const messages = scripts.buildApproveMessages(projectId, bump(projectId, 'approve'))
            append(messages)
            markCards(messages, 'pending')
            break
          }
          case 'decline-plan': {
            if (effectiveCardId) set((state) => ({ cardStates: { ...state.cardStates, [effectiveCardId]: 'rejected' } }))
            append(scripts.buildDeclineMessages(projectId, bump(projectId, 'decline')))
            // 状态机回退到需求分析；Mock 引擎重出方案是即时的，紧接推进回方案确认，
            // 持久化的稳定阶段始终是方案确认（declineCount 已 +1）
            setStage(projectId, next.stage)
            patchExtras(projectId, { declineCount: next.declineCount })
            const planMessages = scripts.buildPlanMessages(projectId, next.declineCount, bump(projectId, 'emma-plan'))
            append(planMessages)
            markCards(planMessages, 'pending')
            syncPlanDocument(projectId, next.declineCount)
            const settled = transition({ stage: next.stage, declineCount: next.declineCount }, 'describe-requirements')
            if (settled) setStage(projectId, settled.stage)
            break
          }
          case 'start-build': {
            setStage(projectId, next.stage)
            if (effectiveCardId) set((state) => ({ cardStates: { ...state.cardStates, [effectiveCardId]: 'submitted' } }))
            const prev = extrasOf(projectId).buildSignal
            patchExtras(projectId, { buildSignal: { nonce: (prev?.nonce ?? 0) + 1, mode: 'build' } })
            const messages = scripts.buildStartBuildMessages(projectId, bump(projectId, 'start-build'))
            append(messages)
            markCards(messages, 'pending')
            break
          }
          case 'view-progress': {
            append(scripts.buildViewProgressMessages(projectId, bump(projectId, 'view-progress')))
            break
          }
          case 'view-test-report': {
            setStage(projectId, next.stage)
            append(scripts.buildTestReportMessages(projectId, bump(projectId, 'test-report')))
            break
          }
          case 'replay-build': {
            // 纯 UI 回放：只发动画信号，不追加消息、不消耗话术轮转（规格 4.6）
            const prev = extrasOf(projectId).buildSignal
            patchExtras(projectId, { buildSignal: { nonce: (prev?.nonce ?? 0) + 1, mode: 'replay' } })
            break
          }
          case 'build-finished': {
            setStage(projectId, next.stage)
            patchExtras(projectId, { buildSignal: null })
            const messages = scripts.buildBuildFinishedMessages(projectId)
            append(messages)
            markCards(messages, 'pending')
            break
          }
        }
      }

      return {
        ...initialState,

        sendUserMessage: ({ projectId, userId, content }) => {
          const machine = machineOf(projectId)
          if (!machine) return
          const userMessage = scripts.createMessage({ projectId, senderId: userId, content })
          const extras = extrasOf(projectId)
          const matched = scripts.matchCommand(content, machine.stage)

          // 需求分析阶段：用户的任意描述都视为需求输入，由 Mike 出问题卡（含「描述你的需求」指令）
          if (
            machine.stage === '需求分析' &&
            !extras.questionsAnswered &&
            (!matched || matched.name === 'describe-requirements')
          ) {
            if (extras.questionCardPending) {
              const nudge = scripts.buildMikeNudgeMessage(projectId, bump(projectId, 'mike-nudge'))
              append([userMessage, nudge])
            } else {
              const messages = scripts.buildQuestionCardMessages(projectId, bump(projectId, 'question-intro'))
              append([userMessage, ...messages])
              markCards(messages, 'pending')
              patchExtras(projectId, { questionCardPending: true })
            }
            return
          }

          if (matched) {
            append([userMessage])
            runCommand(projectId, matched.name)
            return
          }

          append([userMessage, ...scripts.buildFallbackMessages(projectId, machine.stage, bump(projectId, 'fallback'))])
        },

        submitAnswers: ({ projectId, cardId, answers }) => {
          set((state) => ({
            cardStates: { ...state.cardStates, [cardId]: 'submitted' },
            cardAnswers: { ...state.cardAnswers, [cardId]: answers },
          }))
          patchExtras(projectId, { questionCardPending: false, questionsAnswered: true })
          runCommand(projectId, 'describe-requirements')
        },

        runCommand: ({ projectId, command, cardId }) => runCommand(projectId, command, cardId),

        finishBuild: ({ projectId }) => {
          const machine = machineOf(projectId)
          if (!machine || machine.stage !== '代码生成') return
          if (extrasOf(projectId).buildSignal?.mode !== 'build') return
          runCommand(projectId, 'build-finished')
        },
      }
    },
    {
      name: 'atoms-demo:workflow',
      version: 1,
      migrate: () => initialState,
    },
  ),
)
