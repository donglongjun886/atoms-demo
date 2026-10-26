import { describe, expect, it } from 'vitest'
import {
  INITIAL_MACHINE_STATE,
  MAX_PLAN_DECLINES,
  WORKFLOW_COMMANDS,
  WORKFLOW_STAGES,
  availableCommands,
  canTransition,
  transition,
  type WorkflowMachineState,
} from '@/engine/workflow'

function at(stage: WorkflowMachineState['stage'], declineCount = 0): WorkflowMachineState {
  return { stage, declineCount }
}

describe('workflow 状态机', () => {
  it('沿合法命令可从需求分析一路走到预览，覆盖全部六个阶段', () => {
    const visited: string[] = [INITIAL_MACHINE_STATE.stage]
    let state = INITIAL_MACHINE_STATE
    for (const command of [
      'describe-requirements',
      'approve-plan',
      'start-build',
      'build-finished',
      'view-test-report',
    ] as const) {
      const next = transition(state, command)
      expect(next).not.toBeNull()
      state = next!
      visited.push(state.stage)
    }
    expect(visited).toEqual([...WORKFLOW_STAGES])
  })

  it('非法转移返回 null，且不改变原状态', () => {
    expect(transition(at('需求分析'), 'approve-plan')).toBeNull()
    expect(transition(at('需求分析'), 'start-build')).toBeNull()
    expect(transition(at('方案确认'), 'describe-requirements')).toBeNull()
    expect(transition(at('架构设计'), 'approve-plan')).toBeNull()
    expect(transition(at('测试'), 'start-build')).toBeNull()
    expect(transition(at('预览'), 'approve-plan')).toBeNull()
  })

  it('decline-plan 回退到需求分析并累加拒绝次数', () => {
    const back = transition(at('方案确认', 1), 'decline-plan')
    expect(back).toEqual({ stage: '需求分析', declineCount: 2 })
  })

  it(`拒绝次数达到上限 ${MAX_PLAN_DECLINES} 后 decline-plan 返回 null，approve-plan 仍可用`, () => {
    const state = at('方案确认', MAX_PLAN_DECLINES)
    expect(transition(state, 'decline-plan')).toBeNull()
    expect(transition(state, 'approve-plan')).toEqual({ stage: '架构设计', declineCount: MAX_PLAN_DECLINES })
  })

  it('view-progress 与 replay-build 是自环，只产出消息不推进阶段', () => {
    expect(transition(at('代码生成'), 'view-progress')).toEqual(at('代码生成'))
    expect(transition(at('预览'), 'replay-build')).toEqual(at('预览'))
  })

  it('availableCommands 反映当前阶段可用命令与拒绝上限约束', () => {
    expect(availableCommands(INITIAL_MACHINE_STATE)).toEqual(['describe-requirements'])
    expect(availableCommands(at('方案确认'))).toEqual(['approve-plan', 'decline-plan'])
    expect(availableCommands(at('方案确认', MAX_PLAN_DECLINES))).toEqual(['approve-plan'])
    expect(availableCommands(at('架构设计'))).toEqual(['start-build'])
    expect(availableCommands(at('代码生成'))).toEqual(['view-progress', 'build-finished'])
    expect(availableCommands(at('测试'))).toEqual(['view-test-report'])
    expect(availableCommands(at('预览'))).toEqual(['replay-build'])
  })

  it('canTransition 与 availableCommands 对每条命令结论一致', () => {
    for (const state of [INITIAL_MACHINE_STATE, at('方案确认'), at('方案确认', MAX_PLAN_DECLINES), at('预览')]) {
      for (const command of WORKFLOW_COMMANDS) {
        expect(canTransition(state, command)).toBe(availableCommands(state).includes(command))
      }
    }
  })
})
