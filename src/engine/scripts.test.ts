import { describe, expect, it } from 'vitest'
import {
  STAGE_COMMANDS,
  buildFallbackMessages,
  buildQuestionCardMessages,
  matchCommand,
  pickVariant,
} from '@/engine/scripts'
import { STAGE_AGENT } from '@/engine/workflow'

describe('话术轮转确定性', () => {
  it('pickVariant 按触发次数轮转，数满一圈回到第一套', () => {
    const variants = ['甲', '乙'] as const
    expect(pickVariant(variants, 0)).toBe('甲')
    expect(pickVariant(variants, 1)).toBe('乙')
    expect(pickVariant(variants, 2)).toBe('甲')
    expect(pickVariant(variants, 3)).toBe('乙')
  })

  it('同一事件连触发两次返回不同套话术，第三次环绕回第一套', () => {
    const [first] = buildQuestionCardMessages('p1', 0)
    const [second] = buildQuestionCardMessages('p1', 1)
    const [third] = buildQuestionCardMessages('p1', 2)
    expect(first.content).not.toBe(second.content)
    expect(third.content).toBe(first.content)
  })
})

describe('兜底回复', () => {
  it('包含当前阶段名与该阶段的全部可用指令', () => {
    const [msg] = buildFallbackMessages('p1', '方案确认', 0)
    expect(msg.content).toContain('方案确认')
    for (const command of STAGE_COMMANDS['方案确认']) {
      expect(msg.content).toContain(`「${command}」`)
    }
  })

  it('兜底回复由当前阶段的负责 Agent 发出', () => {
    const [msg] = buildFallbackMessages('p1', '架构设计', 0)
    expect(msg.senderId).toBe(STAGE_AGENT['架构设计'])
  })

  it('兜底话术自身也按次数轮转并环绕', () => {
    const [a] = buildFallbackMessages('p1', '需求分析', 0)
    const [b] = buildFallbackMessages('p1', '需求分析', 1)
    const [c] = buildFallbackMessages('p1', '需求分析', 2)
    expect(a.content).not.toBe(b.content)
    expect(c.content).toBe(a.content)
  })
})

describe('matchCommand 指令匹配', () => {
  it('各阶段指令命中对应命令', () => {
    expect(matchCommand('描述你的需求', '需求分析')).toEqual({ name: 'describe-requirements', stage: '需求分析' })
    expect(matchCommand('批准方案', '方案确认')).toEqual({ name: 'approve-plan', stage: '方案确认' })
    expect(matchCommand('拒绝方案', '方案确认')).toEqual({ name: 'decline-plan', stage: '方案确认' })
    expect(matchCommand('开始构建', '架构设计')).toEqual({ name: 'start-build', stage: '架构设计' })
    expect(matchCommand('查看构建进度', '代码生成')).toEqual({ name: 'view-progress', stage: '代码生成' })
    expect(matchCommand('查看测试报告', '测试')).toEqual({ name: 'view-test-report', stage: '测试' })
    expect(matchCommand('再看一遍', '预览')).toEqual({ name: 'replay-build', stage: '预览' })
  })

  it('支持文本等价：同义词、尾部标点与包含匹配', () => {
    expect(matchCommand('批准', '方案确认')).toEqual({ name: 'approve-plan', stage: '方案确认' })
    expect(matchCommand('不满意！', '方案确认')).toEqual({ name: 'decline-plan', stage: '方案确认' })
    expect(matchCommand('请批准方案吧', '方案确认')).toEqual({ name: 'approve-plan', stage: '方案确认' })
    expect(matchCommand('开始', '架构设计')).toEqual({ name: 'start-build', stage: '架构设计' })
  })

  it('跨阶段指令不命中', () => {
    expect(matchCommand('批准方案', '需求分析')).toBeNull()
    expect(matchCommand('开始构建', '方案确认')).toBeNull()
  })

  it('空白输入与无指令自由输入不命中（交给兜底回复）', () => {
    expect(matchCommand('   ', '需求分析')).toBeNull()
    expect(matchCommand('你是谁', '需求分析')).toBeNull()
  })
})
