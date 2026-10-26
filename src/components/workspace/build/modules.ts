import filterBarRaw from '@/preview-app/components/FilterBar.tsx?raw'
import taskInputRaw from '@/preview-app/components/TaskInput.tsx?raw'
import taskListRaw from '@/preview-app/components/TaskList.tsx?raw'
import taskAppRaw from '@/preview-app/TaskApp.tsx?raw'
import themeRaw from '@/preview-app/theme.ts?raw'
import useTasksRaw from '@/preview-app/useTasks.ts?raw'
import previewTasksRaw from '@/store/previewTasks.ts?raw'

export interface BuildFile {
  path: string
  code: string
}

export interface BuildModule {
  id: string
  name: string
  description: string
  files: BuildFile[]
}

/** 与 Bob 架构卡片的四层划分一一对应；数组顺序即构建动画与代码文件出现的顺序 */
export const BUILD_MODULES: BuildModule[] = [
  {
    id: 'data',
    name: '数据层',
    description: 'localStorage 持久化封装',
    files: [{ path: 'src/store/previewTasks.ts', code: previewTasksRaw }],
  },
  {
    id: 'state',
    name: '状态层',
    description: '任务 Store（增删勾选筛选）',
    files: [{ path: 'src/preview-app/useTasks.ts', code: useTasksRaw }],
  },
  {
    id: 'ui',
    name: 'UI 层',
    description: '任务输入 / 任务列表 / 筛选栏',
    files: [
      { path: 'src/preview-app/components/TaskInput.tsx', code: taskInputRaw },
      { path: 'src/preview-app/components/FilterBar.tsx', code: filterBarRaw },
      { path: 'src/preview-app/components/TaskList.tsx', code: taskListRaw },
      { path: 'src/preview-app/TaskApp.tsx', code: taskAppRaw },
    ],
  },
  {
    id: 'style',
    name: '样式层',
    description: 'Tailwind 主题与布局',
    files: [{ path: 'src/preview-app/theme.ts', code: themeRaw }],
  },
]
