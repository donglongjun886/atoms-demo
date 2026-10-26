# Atoms（原 MGX / MetaGPT X）调研报告

> 调研时间：2026-10-26。目的：为 Atoms-Demo 的 Mock 演示脚本提供交互细节、术语与台词风格的参照。
>
> 来源分级：本报告区分 **【官方】**（atoms.dev、mgx.dev、help.atoms.dev 官方帮助中心，support.mgx.dev 重定向至此）与 **【第三方】**（媒体实测、评测聚合站）。官方帮助中心共约 80 篇文章，重点抓取了约 12 篇核心文章。

---

## 0. 背景与品牌沿革

- **【官方/第三方交叉确认】** 产品原名 **MGX（MetaGPT X）**，由深圳 DeepWisdom 出品，2025-02-19 正式发布，2025-03 连续霸榜 Product Hunt（日榜第一、周榜第一）；创始人吴承霖（Chenglin Wu）同时是开源多智能体框架 MetaGPT 的作者。后更名为 **Atoms**，定位从「AI 开发团队」扩展为「AI 原生创业平台」——研究、产品定义、架构、工程、SEO、数据分析、部署与增长一条龙。来源：[MetaGPT GitHub README](https://raw.githubusercontent.com/geekan/MetaGPT/main/README.md)、[Product Hunt MGX](https://www.producthunt.com/products/metagpt-x)、[Pandaily 报道](https://pandaily.com/ai-programming-company-deep-wisdom-raises-30-6-million-launches-product-atoms)、[AiToolMap 评测](https://aitoolmap.org/tools/atoms/)
- **【官方】** 官网 Slogan：「Turn ideas into products that sell — AI employees to validate ideas, build products, and acquire customers. In minutes. Without coding.」来源：[atoms.dev](https://atoms.dev/)
- **【官方】** 帮助中心现托管在 `help.atoms.dev`（`support.mgx.dev` 与其等价/重定向）。来源：[help.atoms.dev sitemap](https://support.mgx.dev/sitemap.xml)

---

## 1. Agent 团队构成【官方确认】

官方帮助中心「Input Chat」与「Working with Agents」两文给出了完整的 Agent 名单与职责表（[input-chat](https://help.atoms.dev/en/articles/12129552-input-chat)、[working-with-agents](https://help.atoms.dev/en/articles/12129548-working-with-agents)），官网首页卡片另有精炼的一句话介绍（[atoms.dev](https://atoms.dev/)）。合并如下：

| Agent | 角色（官方英文名） | 官方职责描述 | 使用时机 |
|---|---|---|---|
| **Mike** | Team Leader（组长） | 端到端推进计划、协调各 Agent、向用户请求审批（approval），让用户保持知情 | 任务跨多个阶段、需要规划/分派/协调时 |
| **Emma** | Product Manager（产品经理） | 把想法变成清晰的规格与范围，处理需求、用户、优先级、范围、功能取舍 | 需要澄清需求或做功能权衡时 |
| **Bob** | Architect（架构师） | 设计系统蓝图，处理系统结构、数据模型、集成与技术约束 | 需要架构与技术方案时 |
| **Alex** | Engineer（工程师） | 构建生产级全栈应用（前端+后端+集成+部署），实现功能、修复问题、测试 | 需要构建、修改、修复、测试实现时 |
| **David** | Data Analyst（数据分析师） | 分析海量数据，处理数据、文件、指标、趋势，产出洞察 | 需要数据分析时 |
| **Iris** | Deep Researcher（深度研究员） | 通过 Deep Research 发现真实需求与细分市场，产出有信源的研究报告 | 需要市场/竞品/用户/技术研究时 |
| **Sarah** | SEO Specialist（SEO 专家） | 规划并撰写 SEO 内容页面，通过审批后由 Alex 集成进项目 | 需要 SEO 内容时（仅部分项目模板可用） |
| **Adrian** | Ads Specialist（广告专家） | 创建、跟踪、优化 Google Ads 广告系列 | 需要投放广告时（仅已发布的支持项目可用） |

**官方确认的细节：**

- 默认 Group Members（群成员）列表为 **Alex、Bob、David、Emma、Mike** 五人；**Sarah 和 Adrian 只在支持 shadcn/ui 模板或启用 Atoms Cloud 的项目中出现**；**开启 Deep Research 后 @ 选择器只显示 Iris**。
- Team Mode 关闭时，只有 Alex 响应（即 Engineer Mode）；开启后可通过 @ 直接点名任意在场 Agent，或不点名、由 Mike 自行分派。
- 用户可以在同一条消息里 @ 多个 Agent，但官方建议仅用于互不依赖的任务；有依赖关系的工作应交 Mike 排序协调。
- **【第三方】** 界面中每个 Agent 是有颜色的「坨坨」卡通形象：Mike 黄、Alex 蓝、Emma 紫、David 绿、Bob 白；每条 Agent 消息带身份标签（如 `Mike | Team Leader`）。来源：[人人都是产品经理实测](https://www.woshipm.com/ai/6277746.html)、[project-chat 官方文](https://help.atoms.dev/en/articles/12129550-project-chat)

**与 Demo 范围的关系**：我们确认的 4 个角色（产品经理、架构师、工程师、测试工程师）中前三者与官方完全对齐；官方没有专职「测试工程师」Agent，测试职责由 Alex（Engineer）兼任（官方描述含 "fixes technical issues / test the project implementation"）。

---

## 2. 工作流交互【官方确认】

### 2.1 模式体系

- **Team Mode / Engineer Mode**：输入框旁 `+` 菜单中的开关。关闭=Engineer Mode（仅 Alex）；开启=团队模式，Mike 进场协调。来源：[working-with-agents](https://help.atoms.dev/en/articles/12129548-working-with-agents)
- **Build / Goal 两种构建方式**：Build 菜单中，Build 标注为「General building mode」，**Goal 标注为「Mike plans and assigns the build」**（Mike 规划并分派）。来源：[input-chat](https://help.atoms.dev/en/articles/12129552-input-chat)
- **Deep Research**：`+` 菜单开启后进入 Iris 专属的独立研究工作流，期间 Team Mode 开关被锁定，Group Members 只剩 Iris。与 Race Mode 互斥。
- **Race Mode**：把同一请求并行发给多个模型配置（Turbo / Standard「Balanced performance」/ Custom「手动选模型，最多 4 个，可设全局创意度 Balanced/Creative」），产出多个版本供比较挑选。官方 glossary 定义：「Allows you to run the same prompt across multiple models simultaneously to compare their outputs.」来源：[choose-an-llm](https://help.atoms.dev/en/articles/12129549-choose-an-llm)、[key-terms-glossary](https://help.atoms.dev/en/articles/12129604-key-terms-glossary)、[input-chat](https://help.atoms.dev/en/articles/12129552-input-chat)

### 2.2 典型任务流转（官方 project-chat 一文描述的完整链路）

1. 用户在输入框用日常语言描述需求（官方示例：*「Create me a landing page to promote my medical equipment.」*）。
2. **Mike（Team Leader）先接单**：发出一张活动卡片（activity card），标题形如 **「Processed N steps」**，可展开逐步查看过程叙述；随后 Mike 写出一份**详细任务简报（brief）**：包含板块、约束、质量规则，然后用 **@ 提及** 把简报交接给对应的专家 Agent。交接全程对用户可见——「The whole handoff happens in front of you, so you always know who is doing what.」
3. 专家 Agent（如 Alex）接受交接并开始工作。每条 Agent 回复都带活动卡片，展开可见每一步的叙述 + **工具卡片**（tool cards）：读文件、写代码、跑终端命令、生成图片、审查渲染页面等。
4. 任务结束时产出收尾总结（说明改了什么、如何验证），并钉上一张 **Version card（版本卡片）**，带可引用的名字，如 *「Version 1: Launch publishing hero」*。
5. 后续迭代用普通追问即可（*「I need the theme to be green.」*），走同样的「Mike 简报 → 专家执行 → 新版本卡片」闭环，产出 Version 2、3…。

来源：[project-chat](https://help.atoms.dev/en/articles/12129550-project-chat)

### 2.3 审批/确认节点（approval 机制）

官方明确的人工介入节点（[working-with-agents](https://help.atoms.dev/en/articles/12129548-working-with-agents)）：

| 卡片/状态 | 含义 | 用户操作 |
|---|---|---|
| **Working Process** 显示某 Agent 活跃 | 当前步骤执行中 | 等待；可排队下一条指令 |
| **Question card（问题卡）** | Mike 需要信息才能继续 | 逐题回答，多页时用 Next，最后 Submit |
| **Plan card（计划卡）** | 计划已就绪，**尚未开始执行** | 点 **Approve** 继续；点 Approve 旁箭头选 **Decline** 打回修改 |
| **Agent 最终回复** | 该 Agent 完成自己这步 | 检查 Working Process 和后续消息，不等于整体完成 |
| **另一个 Agent 开始工作** | 发生了交接 | 跟进新 Agent 的消息 |
| **Version card** | 产出了可预览的版本 | 最新版点 Preview；历史版先 Load preview 再 View Preview |

**关键产品语义**：「一份文字回答、计划或研究摘要本身不代表项目被改动」——必须以 Version card 出现并在 App Viewer 验证为准。

SEO 与 Ads 这两个专员工作流有更重的审批设计（来源：[seo-agent](https://help.atoms.dev/en/articles/12129581-seo-agent)、[ads-agent](https://help.atoms.dev/en/articles/12129582-ads-agent)）：

- **Sarah（SEO）**：先扫描站点 → 给出可勾选的页面标题计划 → 用户可 **Edit Plans / Update Plan** 修改 → **Approve** 后才开始生成（明确提示「Approval starts generation and uses credits」）→ 生成完由 Team Mode **自动交接给 Alex 集成**，用户无需单独找 Alex。
- **Adrian（Ads）**：双重审批——先弹「真实花费警告卡」（须工作区 owner 点 I Understand），再弹「Campaign plan 确认卡」（含预算、关键词、广告文案、两周成本预估，Confirm 后才创建，且新广告系列默认 paused 暂停状态）。

### 2.4 消息队列、中断与回滚

- **Prompt Queue（消息队列）**：Agent 干活时用户可继续输入，消息进入输入框上方的 Queue 面板，可编辑、删除、拖拽排序；队列头提供 Clear queue / Pause / Resume。来源：[project-chat](https://help.atoms.dev/en/articles/12129550-project-chat)、[working-with-agents](https://help.atoms.dev/en/articles/12129548-working-with-agents)
- **Stop**：输入框右侧方形停止按钮，tooltip 为「Click if you want to stop all tasks」，确认「Yes, I'm Sure」后停止全部任务，被打断的回复标记为 **Response stopped**。**已完成的部分会被保留**，补充信息后 Mike 把新信息并入更新版简报，从当前状态继续而非推倒重来。
- **Revert（消息级撤销）**：Agent 消息下有回退箭头，可把项目回滚到该消息变更之前的状态。
- **Versions / Restore / Remix**：聊天面板右上角 Versions 打开版本历史；Restore 将当前项目恢复到历史版本（可选 Sync database，默认勾选）；Remix 则从历史版本**分叉出一个独立新项目**（可选 Copy database data），原项目不动。官方用一张对照表区分：要回滚用 Restore，要分叉用 Remix。来源：[project-history](https://help.atoms.dev/en/articles/12129557-project-history)
- **Issue Report（问题报告）**：构建出错时左下角弹通知卡，带 **Resolve** 按钮让 AI 自动分析修复；可展开在右侧面板看错误日志和堆栈。官方强调「Click once, then wait」（重复点击会产生重复修复任务）。
- **消息检索**：History → Messages 是消息时间线索引，可搜索并 Jump to message（只移动阅读位置，不改项目状态）。来源：[message-timeline](https://help.atoms.dev/en/articles/12129556-message-timeline)
- 每条已完成 turn 的最后一条 Agent 消息可在 `…` 菜单查看 **Worked for / Credits used**（耗时与积分消耗）。

---

## 3. 文档站核心概念与术语【官方确认】

来源：[key-terms-glossary](https://help.atoms.dev/en/articles/12129604-key-terms-glossary)、[output-types](https://help.atoms.dev/en/articles/12129547-output-types)

**Atoms 专有术语：**

- **Team Mode**：激活 AI Agent 团队处理复杂需求（含 PM、Engineer、Data Scientist、Deep Researcher、Architect）。
- **Engineer Mode**：仅 Alex 工作。
- **Race Mode**：同一 prompt 并行跑多个模型，对比产出。
- **Deep Research**：深度研究功能，产出带信源的专业报告（学术论文、商业分析、市场报告）。
- **App Viewer**：预览结果、直接在页面上修改任意可视元素。
- **Remix**：把任意项目复制到自己聊天里继续构建。
- **Publish**：为当前应用生成稳定分享链接。
- **App World**：作品展示平台（广场），可上首页。

**输出类型（Output types）**：Web（默认，含网站/落地页/仪表盘/工具/游戏）、App（手机端体验，不支持 Deep Research）、Video（生成视频，会强制关闭 Race Mode / Deep Research / Atoms Cloud / Theme）、Slides/文档/报告（无单独选择器，直接在 prompt 里说明即可）。

**值得注意的定位表述**：官方把用户定义为 **Human-in-the-Loop**——「你是 manager，不再是 writer，而是 reviewer」。官方还把核心循环概括为：**Describe → Check → Change → Test → Publish → Verify → Update**（[quick-start](https://help.atoms.dev/en/articles/12129545-quick-start)）。

**角色比喻（glossary 原文，适合台词参考）**：Product Manager 是「功能的 CEO」；Engineer 是「the builder」；Architect 是「软件的 city planner」；Data Scientist 是「the detective」；Deep Researcher 负责「钻进论文、技术文档与长报告里综合出答案」。

---

## 4. 界面布局与特色功能

### 4.1 整体布局

- **【官方】** 项目页 = **聊天面板（Chat）+ 产物区**：Agent 完成任务后 **App Viewer 出现在页面上方**；任务运行期间**右侧 Terminal 面板**实时显示文件创建、代码生成与报错。App Viewer 工具栏（从左到右）：**Design**（可视化编辑开关）、**Device toggle**（桌面/移动切换）、Refresh、Home、**Page selector**（页面下拉）、Open in new tab、**Console**（日志/报错）。来源：[app-viewer](https://help.atoms.dev/en/articles/12129554-app-viewer)
- **【第三方】** 任务页为**两栏结构：左侧看每个 Agent 在做什么，右侧是项目预览**。首页输入区可见默认团队成员头像与 @ 召唤；有一个开关可关闭 Agent 团队退回单模型模式。来源：[人人都是产品经理实测](https://www.woshipm.com/ai/6277746.html)

### 4.2 可视化编辑（Design Mode / Visual Editor）【官方】

- 预览下方有可折叠的可视化编辑工具栏：**Select element**（点选元素 + 描述需求交给 AI 改，支持 Ctrl/Cmd 多选）、**Edit Text**（直接在预览里改文字，多处修改后统一 Save/Discard）、**Theme**（全局主题）。
- 点选元素后元素出现描边 + 标签（如 `h1`、按钮），弹出内联的 **「Ask the Atoms to change…」** 输入条，左侧面板可手调颜色、间距、字体、布局；改动**实时反映在预览**。
- **Theme（主题系统）**：15 个设计师预设（Featured），主题面板分 Color / Fonts / Effects 三个 tab，内置 Undo/Redo/Reset/Export/Import；官方建议**尽早定主题**（「Choose a theme early」），否则带固定值的元素不会被主题覆盖。预设名示例：Zen、Terracotta & Clay、Notion、Material You、Golden Honey、Nordic Moss & Stone、White Beach。
- 来源：[design-and-preview](https://help.atoms.dev/en/articles/12129553-design-and-preview)、[app-viewer](https://help.atoms.dev/en/articles/12129554-app-viewer)

### 4.3 特色功能速览

- **Race Mode**：同一 prompt 并行多模型出多个版本，用户挑最好的；官方宣传语「消除 AI 抽卡（AI lottery）」。**【第三方】** 视频演示中是「3 个 AI agent 同时为你构建，选最优结果」。来源：[atoms.dev](https://atoms.dev/)、[atoms.dev 视频页](https://atoms.dev/video/qaamzbrayzc)
- **分支/撤销**：见 2.4（Revert 消息级回滚、Versions/Restore 版本级回滚、Remix 分叉）。
- **实时渲染**：官方 use case 页特性列表原文：「Live Rendering — Instant updates with images, branch support, undo at any step and one click deploy」。来源：[mgx.dev/usecases](https://mgx.dev/usecases/ai-website-coder)
- **发布**：Publish 生成稳定公开链接（免费项目默认 Public，付费可 Private）；发布后按钮变 Update；支持自定义域名。
- **其他**：代码可导出并同步 GitHub（「Stay fully in control」）；Atoms Cloud 提供登录/数据库/托管后端；可连 Supabase、Stripe、GA4、Search Console、Google Ads。

---

## 5. 官方推荐的演示/使用最佳实践【官方确认】

来源：[prompting-guide](https://help.atoms.dev/en/articles/12129551-prompting-guide)、[quick-start](https://help.atoms.dev/en/articles/12129545-quick-start)、[welcome](https://help.atoms.dev/en/articles/12129543-welcome-to-atoms)

1. **首提示四要素**：做什么、给谁用、为什么用、主行动（CTA）。官方示例：*「Build a one-page site for a budgeting app aimed at freelancers. The main CTA is 'Start Saving Smarter.' Use a bold, expressive look with large types and punchy colors.」*
2. **让团队先提问再动手**：在模糊的大需求末尾加一句 *「Ask me anything you need to fully understand what you want before you start.」*（触发 Question card 机制）。
3. **描述结果而非实现**：「加一个三档定价区、中间那档突出」优于告诉它怎么写代码。
4. **按组件迭代，不按页面迭代**：一次只做一个组件（hero、特性网格、定价表），「full-page request produces noise; a component request produces signal」。
5. **一次只做一处有意义的修改**，每步验证后再走下一步；明确说什么要改、**什么必须保持不变**（"fence off the parts you like"）。
6. **用真实文案而非占位符**；尽早设定视觉基调词（minimal / playful / cinematic…）。
7. 首个项目选「一个小而可试的目标」；发布前逐项点验所有交互、桌面+移动双端、替换占位内容。
8. 结构化 prompt 五段式：Context → Goal → Requirements & Constraints → Expected Result → References。

**【第三方】** 官方 YouTube 合作视频给的最佳实践：*「Use Iris + Race Mode together to move from idea → insight → production-ready app faster」*（先用 Iris 做调研，再用 Race Mode 构建）。来源：[atoms.dev 视频页](https://atoms.dev/video/qaamzbrayzc)

---

## 6. 对我们 Mock 演示的启示

### 6.1 交互细节值得模仿的

1. **Mike 接单 → 写简报 → @ 交接的三段式**是 Atoms 工作流最有辨识度的交互：Mike 的消息不是泛泛而谈，而是一份含「板块、约束、质量规则」的结构化 brief，并以 @ 提及下一位 Agent 收尾；下一位 Agent 有明确的「接受交接」话术。我们的 Mock 脚本应完整复刻这三拍。
2. **「Processed N steps」活动卡片**：Agent 回复挂一张可折叠的过程卡，展开是逐步叙述 + 工具卡（读文件/写代码/跑命令/生成图片/审查页面）。Mock 中可用「已处理 N 步」+ 折叠面板模拟，成本极低但辨识度极高。
3. **Plan card 审批是核心仪式感**：计划就绪后必须用户点 **Approve** 才执行，旁有箭头可 **Decline** 打回；还有 **Question card**（Mike 反问，逐题答，最后 Submit）。我们的「方案确认」阶段应做成真正的卡片按钮，而不是一句「可以吗？」。
4. **Version card 命名制**：每个完成节点钉一张带名字的版本卡（如「Version 1: Launch publishing hero」）。给我们的建议：构建完成后生成「Version 1：任务管理应用首版」样式的卡片，并可回滚（对应 Restore）——我们已定「不做版本历史」，但至少消息里的 Revert/版本卡视觉可以出现。
5. **身份标签**：每条消息都带 `名字 | 角色`（如 `Emma | Product Manager`），且 Agent 有固定颜色头像（Mike 黄、Alex 蓝、Emma 紫、Bob 白、David 绿）。我们的群聊消息应复刻这个标签格式与配色。
6. **队列与打断的真实感**：Agent 干活时允许继续发消息进入 Queue；Stop 按钮的确认文案「Yes, I'm Sure」、打断后标记「Response stopped」、且「已完成部分保留，从当前状态继续」——这些文案可直接汉化沿用。
7. **布局**：左侧聊天/Agent 活动流 + 右侧预览（官方是两栏，我们三栏方案与之兼容）；Agent 工作时右侧 Terminal 面板滚动「创建文件/生成代码」日志——这正是我们构建动画的参照物。
8. **交接的可见性**：官方反复强调「The whole handoff happens in front of you」——Agent 之间不私聊，所有分工都在用户可见的消息流里发生。Mock 脚本里 Agent 间的对话也应全部公开呈现。
9. **收尾总结格式**：任务完成消息 = 「改了什么 + 如何验证的 + Version 卡」，而不是简单说「完成了」。

### 6.2 术语对齐建议

- 直接沿用：**Team Mode / Engineer Mode**（团队模式/工程师模式）、**Plan card / Question card / Version card**（计划卡/问题卡/版本卡）、**Working Process**（工作过程）、**App Viewer**（应用预览）、**Deep Research / Race Mode**（可作为「后续版本」彩蛋按钮置灰展示）。
- 我们的 Workflow 阶段（需求分析 → 方案确认 → 架构设计 → 代码生成 → 测试 → 预览）与官方角色交接顺序一致（Emma→确认→Bob→Alex→测试→预览），可把「方案确认」显式做成 Plan card 的 Approve 节点——这是官方 approval 机制的核心。
- 用户定位话术可借用官方 glossary：「你是 manager，不是 writer——Human-in-the-Loop」。

### 6.3 台词风格参考

- **Mike（组长）**：调度口吻、结论先行。「收到。我先把需求拆成简报：目标…约束…验收标准…@Emma 请先产出需求规格。」工作完成时给结构化总结。
- **Emma（产品经理）**：自信、有产品经理气场（第三方实测评价「非常有产品经理的气势」），产出含用户故事、竞品分析、范围取舍；口头禅式句式：「从用户视角看…」「这个需求我建议收敛为 MVP 范围…」。
- **Bob（架构师）**：「city planner」视角，讲结构与技术选型理由：「为了让应用可扩展且可靠，我采用…」。
- **Alex（工程师）**：动手派，消息以工具动作为主（「正在创建文件 src/App.tsx…」「构建完成，预览已就绪」），并会在自我反思时承认不足（第三方实测中 Alex 曾主动说 UI 渲染部分做得差并改进）——适当的「自我修正」台词反而更真实。
- **官方整体语气**：简洁、指令式、面向结果（describe outcomes, not implementations）；中文站译风克制，少用感叹号。示例首提示可用官方咖啡馆例子汉化：「为一家社区咖啡馆建网站：菜单、营业时间、位置和品牌故事，暖色调，手机上易读。」

### 6.4 不建议模仿的

- Race Mode 的多模型并行、真实积分消耗、Supabase/Stripe/广告集成等超出 Demo 范围；第三方实测也暴露了「多 Agent 强行全员协作会分工混乱、串岗」的失败案例（坦克大战实验），这恰好支持我们「确定性脚本 + 固定分工」的 Mock 路线——演示效果比真实系统更稳定。

---

## 附：主要来源清单

**官方一手：**

- 官网首页与 Agent 介绍：https://atoms.dev/
- 帮助中心（即 support.mgx.dev 现址）：https://help.atoms.dev/en/
  - Welcome：https://help.atoms.dev/en/articles/12129543-welcome-to-atoms
  - Quick start：https://help.atoms.dev/en/articles/12129545-quick-start
  - Output types：https://help.atoms.dev/en/articles/12129547-output-types
  - Working with agents：https://help.atoms.dev/en/articles/12129548-working-with-agents
  - Choose an LLM（含 Race Mode）：https://help.atoms.dev/en/articles/12129549-choose-an-llm
  - Project chat：https://help.atoms.dev/en/articles/12129550-project-chat
  - Prompting guide：https://help.atoms.dev/en/articles/12129551-prompting-guide
  - Input chat（输入区全控件）：https://help.atoms.dev/en/articles/12129552-input-chat
  - Design and preview：https://help.atoms.dev/en/articles/12129553-design-and-preview
  - App Viewer：https://help.atoms.dev/en/articles/12129554-app-viewer
  - Project history（Versions/Restore/Remix）：https://help.atoms.dev/en/articles/12129557-project-history
  - SEO Agent（Sarah）：https://help.atoms.dev/en/articles/12129581-seo-agent
  - Ads Agent（Adrian）：https://help.atoms.dev/en/articles/12129582-ads-agent
  - Key terms glossary：https://help.atoms.dev/en/articles/12129604-key-terms-glossary
- Use case 特性页（Live Rendering 等）：https://mgx.dev/usecases/ai-website-coder
- 官方视频聚合页：https://atoms.dev/video/qaamzbrayzc
- MetaGPT GitHub（MGX 发布公告）：https://raw.githubusercontent.com/geekan/MetaGPT/main/README.md

**第三方：**

- 人人都是产品经理实测（团队配色、两栏布局、Deep Research 流程、坦克大战失败案例）：https://www.woshipm.com/ai/6277746.html
- AiToolMap 深度评测：https://aitoolmap.org/tools/atoms/
- Product Hunt：https://www.producthunt.com/products/metagpt-x
- Pandaily 融资/更名报道：https://pandaily.com/ai-programming-company-deep-wisdom-raises-30-6-million-launches-product-atoms
