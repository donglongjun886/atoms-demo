export interface PlanSection {
  /** h2 标题文本；null 表示第一个 h2 之前的引言部分（不可批注） */
  title: string | null
  /** 该段落的完整 Markdown（含标题行） */
  markdown: string
}

/** 按 h2 标题切分方案文档，标题行归属其后的段落 */
export function splitPlanSections(content: string): PlanSection[] {
  const lines = content.split('\n')
  const sections: PlanSection[] = []
  let current: PlanSection | null = null
  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line)
    if (match) {
      current = { title: match[1], markdown: line }
      sections.push(current)
    } else if (current) {
      current.markdown += `\n${line}`
    } else if (line.trim() !== '' || sections.length > 0) {
      sections.push({ title: null, markdown: line })
      current = sections[sections.length - 1]
    }
  }
  return sections.filter((s) => s.markdown.trim() !== '')
}
