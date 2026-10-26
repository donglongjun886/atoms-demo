import { describe, expect, it } from 'vitest'

import { createPlanTemplate } from '@/store/plans'
import { splitPlanSections } from './sections'

describe('splitPlanSections', () => {
  it('按 h2 标题切分，标题行归属其后的段落', () => {
    const sections = splitPlanSections('# 标题\n\n## 目标\n内容一\n\n## 范围\n内容二\n')
    expect(sections.map((s) => s.title)).toEqual([null, '目标', '范围'])
    expect(sections[1].markdown).toContain('## 目标')
    expect(sections[1].markdown).toContain('内容一')
    expect(sections[2].markdown).toContain('内容二')
  })

  it('没有 h2 时整体为引言段，不产生可批注章节', () => {
    const sections = splitPlanSections('# 只有标题\n一段正文')
    expect(sections).toHaveLength(1)
    expect(sections[0].title).toBeNull()
  })

  it('忽略 h3 及以下标题，仍归属当前 h2 段落', () => {
    const sections = splitPlanSections('## 目标\n### 子标题\n内容')
    expect(sections).toHaveLength(1)
    expect(sections[0].title).toBe('目标')
    expect(sections[0].markdown).toContain('### 子标题')
  })

  it('方案模板可切出 目标/核心功能/页面与交互/技术要点 四个可批注章节', () => {
    const titles = splitPlanSections(createPlanTemplate('演示')).map((s) => s.title)
    expect(titles).toEqual([null, '目标', '核心功能', '页面与交互', '技术要点'])
  })
})
