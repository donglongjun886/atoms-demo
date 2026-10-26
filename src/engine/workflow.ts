export const WORKFLOW_STAGES = [
  '需求分析',
  '方案确认',
  '架构设计',
  '代码生成',
  '测试',
  '预览',
] as const

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number]

export const INITIAL_STAGE: WorkflowStage = '需求分析'

export const STAGE_AGENT: Record<WorkflowStage, string> = {
  需求分析: 'agent-mike',
  方案确认: 'agent-emma',
  架构设计: 'agent-bob',
  代码生成: 'agent-alex',
  测试: 'agent-alex',
  预览: 'agent-alex',
}

/** 同一项目计划卡最多被拒绝的次数；达到上限后只能批准 */
export const MAX_PLAN_DECLINES = 2

/**
 * 状态机命令的规范名。对话指令经 matchCommand 归一到这些名字，
 * 卡片按钮直接派发同样的名字——双入口驱动同一状态机。
 */
export const WORKFLOW_COMMANDS = [
  'describe-requirements',
  'approve-plan',
  'decline-plan',
  'start-build',
  'view-progress',
  'build-finished',
  'view-test-report',
  'replay-build',
] as const

export type WorkflowCommandName = (typeof WORKFLOW_COMMANDS)[number]

/** engine 纯状态机的最小状态；卡片交互等 UI 状态由 workflow store 另行维护 */
export interface WorkflowMachineState {
  stage: WorkflowStage
  declineCount: number
}

export const INITIAL_MACHINE_STATE: WorkflowMachineState = {
  stage: INITIAL_STAGE,
  declineCount: 0,
}

/**
 * 合法转移表：当前阶段 → 可接受的命令 → 目标阶段。
 * describe-requirements = 需求分析阶段用户提交了问题卡的回答；
 * build-finished = 构建动画完成（由动画接缝派发，非用户指令）；
 * view-progress / replay-build 目标阶段等于当前阶段（只产出消息/信号，不推进）。
 * decline-plan 的目标阶段是需求分析（回退），重出方案由编排层紧接推进回方案确认。
 */
const TRANSITIONS: Record<WorkflowStage, Partial<Record<WorkflowCommandName, WorkflowStage>>> = {
  需求分析: { 'describe-requirements': '方案确认' },
  方案确认: { 'approve-plan': '架构设计', 'decline-plan': '需求分析' },
  架构设计: { 'start-build': '代码生成' },
  代码生成: { 'view-progress': '代码生成', 'build-finished': '测试' },
  测试: { 'view-test-report': '预览' },
  预览: { 'replay-build': '预览' },
}

export function canTransition(state: WorkflowMachineState, command: WorkflowCommandName): boolean {
  if (command === 'decline-plan' && state.declineCount >= MAX_PLAN_DECLINES) return false
  return TRANSITIONS[state.stage][command] !== undefined
}

/** 返回转移后的新状态；非法转移返回 null（纯函数，无副作用） */
export function transition(state: WorkflowMachineState, command: WorkflowCommandName): WorkflowMachineState | null {
  if (!canTransition(state, command)) return null
  const nextStage = TRANSITIONS[state.stage][command]!
  return {
    stage: nextStage,
    declineCount: command === 'decline-plan' ? state.declineCount + 1 : state.declineCount,
  }
}

/** 当前阶段可执行的命令（含拒绝上限约束），用于提示与测试 */
export function availableCommands(state: WorkflowMachineState): WorkflowCommandName[] {
  return WORKFLOW_COMMANDS.filter((command) => canTransition(state, command))
}
