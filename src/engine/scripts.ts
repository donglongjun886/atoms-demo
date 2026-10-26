import { AGENT_TEAM } from '@/engine/agents'
import { STAGE_AGENT, type WorkflowCommandName, type WorkflowStage } from '@/engine/workflow'
import type { Message, MessageCard } from '@/store/types'

export const STAGE_COMMANDS: Record<WorkflowStage, string[]> = {
  需求分析: ['描述你的需求'],
  方案确认: ['批准方案', '拒绝方案'],
  架构设计: ['开始构建'],
  代码生成: ['查看构建进度'],
  测试: ['查看测试报告'],
  预览: ['再看一遍'],
}

export interface MatchedCommand {
  name: WorkflowCommandName
  stage: WorkflowStage
}

/** 各阶段可被对话指令匹配的命令（按钮入口直接派发命令名，不经过文本匹配） */
const STAGE_MATCHABLE_COMMANDS: Record<WorkflowStage, WorkflowCommandName[]> = {
  需求分析: ['describe-requirements'],
  方案确认: ['approve-plan', 'decline-plan'],
  架构设计: ['start-build'],
  代码生成: ['view-progress'],
  测试: ['view-test-report'],
  预览: ['replay-build'],
}

/** 命令的文本等价物；短语支持包含匹配，单词条只做精确匹配避免误伤 */
const COMMAND_SYNONYMS: Record<WorkflowCommandName, string[]> = {
  'describe-requirements': ['描述你的需求', '描述需求', '我的需求'],
  'approve-plan': ['批准方案', '批准', '确认方案', '同意', '通过'],
  'decline-plan': ['拒绝方案', '拒绝', '不满意', '重做'],
  'start-build': ['开始构建', '开始', '构建', '生成代码'],
  'view-progress': ['查看构建进度', '构建进度'],
  'build-finished': [],
  'view-test-report': ['查看测试报告', '测试报告'],
  'replay-build': ['再看一遍', '重播', '回放', '再来一遍'],
}

function normalize(content: string): string {
  return content.trim().toLowerCase().replace(/[\s。！？!?,，.~～]+$/, '')
}

export function matchCommand(content: string, stage: WorkflowStage): MatchedCommand | null {
  const text = normalize(content)
  if (!text) return null
  for (const name of STAGE_MATCHABLE_COMMANDS[stage]) {
    for (const synonym of COMMAND_SYNONYMS[name]) {
      const normalizedSynonym = normalize(synonym)
      if (text === normalizedSynonym) return { name, stage }
      if (normalizedSynonym.length >= 3 && text.includes(normalizedSynonym)) return { name, stage }
    }
  }
  return null
}

/** 同一事件的话术按触发次数轮转：count 为该项目该事件已触发次数（0 起） */
export function pickVariant<T>(variants: readonly T[], count: number): T {
  return variants[count % variants.length]
}

export function createMessage(input: {
  projectId: string
  senderId: string
  content: string
  card?: MessageCard
}): Message {
  return {
    id: `msg-${crypto.randomUUID()}`,
    projectId: input.projectId,
    senderId: input.senderId,
    content: input.content,
    createdAt: Date.now(),
    ...(input.card ? { card: input.card } : {}),
  }
}

export const MIKE_QUESTIONS = [
  '这个应用主要给谁用？（个人自用 / 小团队协作 / 其他）',
  '最核心的三个功能是什么？',
  '希望的整体风格？（简洁 / 专业 / 活泼）',
]

const MIKE_QUESTION_INTROS = [
  '收到！为了把需求对齐，我需要确认三个问题，请在下方问题卡中一次答完。',
  '明白了，方向我大致清楚了。开工前还有三个问题需要你确认，请在问题卡中一次答完。',
]

export function buildQuestionCardMessages(projectId: string, count: number): Message[] {
  return [
    createMessage({
      projectId,
      senderId: 'agent-mike',
      content: pickVariant(MIKE_QUESTION_INTROS, count),
      card: { type: 'question', questions: [...MIKE_QUESTIONS] },
    }),
  ]
}

const EMMA_PLAN_FIRST = [
  '三个问题都收到，需求已经对齐。我整理了一份方案，请在计划卡中确认。',
  '需求已梳理完毕。基于你的回答我产出了一版方案，请在计划卡中批准或提出意见。',
]

const EMMA_PLAN_REISSUE = [
  '收到，我们回到需求分析重新梳理了一轮。这是调整后的第二版方案，请再确认。',
  '根据你的反馈又收敛了一版。这版已经兼顾了前两版的意见，如果没有原则性问题，建议直接批准，我们尽快进入开发。',
]

const PLAN_SUMMARY_V1 = [
  '- 任务列表：添加、勾选完成、删除任务',
  '- 筛选视图：全部 / 进行中 / 已完成',
  '- 数据本地持久化，刷新不丢',
  '- 技术栈：React + Zustand + Tailwind CSS',
].join('\n')

const PLAN_SUMMARY_REVISIONS = [
  [
    '- 任务列表：添加、勾选完成、删除任务（新增任务优先级标记）',
    '- 筛选视图：全部 / 进行中 / 已完成，默认聚焦进行中',
    '- 数据本地持久化，刷新不丢',
    '- 技术栈：React + Zustand + Tailwind CSS',
  ].join('\n'),
  [
    '- 任务列表：添加、勾选完成、删除任务，优先级标记可开关',
    '- 筛选视图：全部 / 进行中 / 已完成，默认聚焦进行中',
    '- 空列表给出引导文案，降低首次使用门槛',
    '- 数据本地持久化，刷新不丢；技术栈：React + Zustand + Tailwind CSS',
  ].join('\n'),
]

const EMMA_PLAN_ACTIVITY = ['需求归纳', '功能拆解', '方案撰写']

/** Emma 方案完整文档（写入方案共编 Tab；declineCount=0 为首版） */
export function buildPlanDocument(projectName: string, declineCount: number): string {
  const version = declineCount + 1
  const summary = declineCount === 0 ? PLAN_SUMMARY_V1 : PLAN_SUMMARY_REVISIONS[Math.min(declineCount - 1, 1)]
  return [
    `# ${projectName}方案（第 ${version} 版）`,
    '',
    '## 目标',
    '',
    '交付一个可交互的任务管理应用，支持任务的完整生命周期管理。',
    '',
    '## 核心功能',
    '',
    summary,
    '',
    '## 页面与交互',
    '',
    '- 单页应用：顶部输入框添加任务，列表展示，筛选栏切换视图',
    '- 勾选切换完成状态，悬停出现删除入口',
    '',
    '## 技术要点',
    '',
    '- React 18 + TypeScript + Tailwind CSS',
    '- Zustand 管理任务状态，localStorage 持久化',
  ].join('\n')
}

/** Emma 产出计划卡。declineCount=0 为首版，1/2 为拒绝后的重出版（第 2 次重出的话术引导批准） */
export function buildPlanMessages(projectId: string, declineCount: number, count: number): Message[] {
  const version = declineCount + 1
  const intro =
    declineCount === 0 ? pickVariant(EMMA_PLAN_FIRST, count) : EMMA_PLAN_REISSUE[Math.min(declineCount - 1, 1)]
  const summary = declineCount === 0 ? PLAN_SUMMARY_V1 : PLAN_SUMMARY_REVISIONS[Math.min(declineCount - 1, 1)]
  return [
    createMessage({ projectId, senderId: 'agent-emma', content: intro }),
    createMessage({
      projectId,
      senderId: 'agent-emma',
      content: '方案要点如下，完整内容见右侧「方案」标签。',
      card: { type: 'activity', title: '已处理 3 个步骤', steps: [...EMMA_PLAN_ACTIVITY] },
    }),
    createMessage({
      projectId,
      senderId: 'agent-emma',
      content: summary,
      card: { type: 'plan', title: `任务管理应用方案（第 ${version} 版）`, summary, version },
    }),
  ]
}

const EMMA_DECLINE_ACKS = ['好的，方案打回重做。', '明白，这版方案不算数。']

export function buildDeclineMessages(projectId: string, count: number): Message[] {
  return [
    createMessage({
      projectId,
      senderId: 'agent-emma',
      content: pickVariant(EMMA_DECLINE_ACKS, count),
    }),
  ]
}

const EMMA_APPROVE_HANDOFFS = [
  '方案已批准，需求确认完毕。@Bob 接手架构设计。',
  '收到批准，需求阶段收尾。@Bob，架构设计交给你了。',
]

const BOB_ARCH_INTROS = [
  '收到。我基于方案划分了四个模块，架构图见右侧「架构图」标签。确认无误后，点下方卡片的「开始构建」，或直接在对话里输入「开始构建」。',
  '好的，方案我已过目。模块架构已设计完成（见右侧架构图），确认后点「开始构建」按钮或输入指令即可开工。',
]

const BOB_ARCH_ACTIVITY = ['模块划分', '数据流设计', '接口定义']

export const BOB_MODULE_LINES = [
  '数据层：localStorage 持久化封装',
  '状态层：任务 Store（增删勾选筛选）',
  'UI 层：任务输入 / 任务列表 / 筛选栏',
  '样式层：Tailwind 主题与布局',
]

export function buildApproveMessages(projectId: string, count: number): Message[] {
  return [
    createMessage({ projectId, senderId: 'agent-emma', content: pickVariant(EMMA_APPROVE_HANDOFFS, count) }),
    createMessage({
      projectId,
      senderId: 'agent-bob',
      content: '架构设计完成，产出如下。',
      card: { type: 'activity', title: '已处理 3 个步骤', steps: [...BOB_ARCH_ACTIVITY] },
    }),
    createMessage({
      projectId,
      senderId: 'agent-bob',
      content: pickVariant(BOB_ARCH_INTROS, count),
      card: {
        type: 'action',
        title: '模块架构已就绪',
        body: BOB_MODULE_LINES.map((line) => `- ${line}`).join('\n'),
        actionLabel: '开始构建',
        command: 'start-build',
      },
    }),
  ]
}

const ALEX_BUILD_STARTS = [
  '收到，开始构建！模块会按顺序逐个生成，右侧架构图与代码面板同步更新。',
  '开工！我按模块顺序构建，你可以盯着右侧架构图看进度。',
]

const ALEX_BUILD_ACTIVITY = ['初始化项目结构', '生成数据层', '生成状态层', '生成 UI 组件']

export function buildStartBuildMessages(projectId: string, count: number): Message[] {
  return [
    createMessage({ projectId, senderId: 'agent-alex', content: pickVariant(ALEX_BUILD_STARTS, count) }),
    createMessage({
      projectId,
      senderId: 'agent-alex',
      content: '构建任务已就绪，正在逐模块生成。',
      card: { type: 'activity', title: '构建进行中', steps: [...ALEX_BUILD_ACTIVITY] },
    }),
  ]
}

const ALEX_PROGRESS_REPORTS = [
  '正在构建中，右侧架构图可以看到模块逐个变色，代码文件同步出现。',
  '构建仍在进行，模块按顺序生成中，完成后我会报测试覆盖率。',
]

export function buildViewProgressMessages(projectId: string, count: number): Message[] {
  return [
    createMessage({ projectId, senderId: 'agent-alex', content: pickVariant(ALEX_PROGRESS_REPORTS, count) }),
  ]
}

export const ALEX_COVERAGE_LINES = [
  '数据层（localStorage 持久化）：96%',
  '状态层（任务 Store）：92%',
  'UI 层（任务输入 / 列表 / 筛选栏）：88%',
  '样式层（Tailwind 主题与布局）：95%',
  '整体覆盖率：92%',
]

/** 构建动画完成后由编排层（finishBuild）调用：Alex 报测试覆盖率，进入测试阶段 */
export function buildBuildFinishedMessages(projectId: string): Message[] {
  return [
    createMessage({
      projectId,
      senderId: 'agent-alex',
      content: `构建完成，全部模块已生成并通过测试。覆盖率如下：\n${ALEX_COVERAGE_LINES.map((l) => `- ${l}`).join('\n')}`,
    }),
    createMessage({
      projectId,
      senderId: 'agent-alex',
      content: '测试执行完毕，输入「查看测试报告」查看结论并进入预览。',
      card: { type: 'activity', title: '已处理 3 个步骤', steps: ['单元测试', '集成测试', '覆盖率统计'] },
    }),
  ]
}

const ALEX_TEST_REPORTS = [
  '测试报告：全部用例通过，整体覆盖率 92%。应用已就绪，请到右侧「预览」标签体验。',
  '测试全部通过，覆盖率 92% 达标。应用已经可以用了，右侧「预览」标签见。',
]

export function buildTestReportMessages(projectId: string, count: number): Message[] {
  return [
    createMessage({ projectId, senderId: 'agent-alex', content: pickVariant(ALEX_TEST_REPORTS, count) }),
  ]
}

const MIKE_NUDGES = [
  '先回答上面的问题卡，我们就可以出方案了。',
  '问题卡还差你的回答，答完我马上整理方案。',
]

/** Mike 提醒先答问题卡（2 套轮转） */
export function buildMikeNudgeMessage(projectId: string, count: number): Message {
  return createMessage({ projectId, senderId: 'agent-mike', content: pickVariant(MIKE_NUDGES, count) })
}

/** 拒绝次数已达上限时，对「拒绝」指令的确定性回应（按钮此时已禁用） */
export function buildDeclineLimitMessages(projectId: string): Message[] {
  return [
    createMessage({
      projectId,
      senderId: 'agent-emma',
      content: '这版方案已经按前两轮反馈收敛过，大方向没有变化。建议直接批准，细节我们可以在方案文档里继续改。',
    }),
  ]
}

const FALLBACK_VARIANTS: ((stage: WorkflowStage, commands: string) => string)[] = [
  (stage, commands) => `我还在理解你的想法。当前处于「${stage}」阶段，你可以试试这些指令：${commands}。`,
  (stage, commands) => `这个我暂时接不住。当前是「${stage}」阶段，可用指令有：${commands}。`,
]

export function buildFallbackMessages(projectId: string, stage: WorkflowStage, count = 0): Message[] {
  const agent = AGENT_TEAM.find((a) => a.id === STAGE_AGENT[stage])
  const commands = STAGE_COMMANDS[stage].map((c) => `「${c}」`).join('、')
  return [
    createMessage({
      projectId,
      senderId: agent?.id ?? 'agent-mike',
      content: pickVariant(FALLBACK_VARIANTS, count)(stage, commands),
    }),
  ]
}
