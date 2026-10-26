export interface AgentDefinition {
  id: string
  name: string
  role: string
  color: string
}

export const AGENT_TEAM: AgentDefinition[] = [
  { id: 'agent-mike', name: 'Mike', role: '组长', color: '#0EA5E9' },
  { id: 'agent-emma', name: 'Emma', role: '产品经理', color: '#8B5CF6' },
  { id: 'agent-bob', name: 'Bob', role: '架构师', color: '#F59E0B' },
  { id: 'agent-alex', name: 'Alex', role: '工程师', color: '#10B981' },
]
