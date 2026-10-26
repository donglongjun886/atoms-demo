import { AGENT_TEAM } from '@/engine/agents'
import { STAGE_AGENT, type WorkflowStage } from '@/engine/workflow'
import type { Message } from '@/store/types'

export const STAGE_COMMANDS: Record<WorkflowStage, string[]> = {
  需求分析: ['描述你的需求'],
  方案确认: ['批准方案', '拒绝方案'],
  架构设计: ['开始构建'],
  代码生成: ['查看构建进度'],
  测试: ['查看测试报告'],
  预览: ['再看一遍'],
}

export interface MatchedCommand {
  name: string
  stage: WorkflowStage
}

export function matchCommand(content: string, stage: WorkflowStage): MatchedCommand | null {
  void content
  void stage
  return null
}

export function createMessage(input: { projectId: string; senderId: string; content: string }): Message {
  return {
    id: `msg-${crypto.randomUUID()}`,
    projectId: input.projectId,
    senderId: input.senderId,
    content: input.content,
    createdAt: Date.now(),
  }
}

export function buildFallbackMessages(projectId: string, stage: WorkflowStage): Message[] {
  const agent = AGENT_TEAM.find((a) => a.id === STAGE_AGENT[stage])
  const commands = STAGE_COMMANDS[stage].map((c) => `「${c}」`).join('、')
  return [
    createMessage({
      projectId,
      senderId: agent?.id ?? 'agent-mike',
      content: `我还在理解你的想法。当前处于「${stage}」阶段，你可以试试这些指令：${commands}。`,
    }),
  ]
}

export function dispatchUserMessage(input: {
  projectId: string
  content: string
  stage: WorkflowStage
}): Message[] {
  const matched = matchCommand(input.content, input.stage)
  if (matched) return []
  return buildFallbackMessages(input.projectId, input.stage)
}
