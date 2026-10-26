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
