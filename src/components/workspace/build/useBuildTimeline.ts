import { useCallback, useEffect, useRef, useState } from 'react'

import { useProjectsStore } from '@/store/projects'
import { useWorkflowStore } from '@/store/workflow'
import { BUILD_MODULES } from './modules'

export type ModuleBuildStatus = 'waiting' | 'building' | 'done'

export interface BuildTimelineView {
  moduleStatus: ModuleBuildStatus[]
  visibleFiles: number[]
  animating: boolean
  built: boolean
}

export const MODULE_BUILD_MS = 2500
export const TOTAL_BUILD_MS = BUILD_MODULES.length * MODULE_BUILD_MS

/**
 * 构建动画时间线：消费 workflow store 的 buildSignal（nonce 变化启动），
 * 模块按 BUILD_MODULES 顺序 等待 → 构建中 → 完成，模块窗口内文件逐个出现。
 * mode 'build' 完成后回调 finishBuild 推进到测试阶段；mode 'replay' 纯 UI 回放。
 * 刷新/切换项目后若 signal 仍是 mode 'build'（中途打断），自动重播。
 */
export function useBuildTimeline(projectId: string): BuildTimelineView {
  const built = useProjectsStore((s) => {
    const stage = s.projects.find((p) => p.id === projectId)?.stage
    return stage === '测试' || stage === '预览'
  })
  const signal = useWorkflowStore((s) => s.byProject[projectId]?.buildSignal ?? null)
  const finishBuild = useWorkflowStore((s) => s.finishBuild)

  const [animation, setAnimation] = useState<Omit<BuildTimelineView, 'built'> | null>(null)
  const timersRef = useRef<number[]>([])
  const seenRef = useRef<{ projectId: string; nonce: number } | null>(null)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }, [])

  const start = useCallback(
    (mode: 'build' | 'replay') => {
      clearTimers()
      setAnimation({
        moduleStatus: BUILD_MODULES.map(() => 'waiting'),
        visibleFiles: BUILD_MODULES.map(() => 0),
        animating: true,
      })
      const schedule = (delay: number, fn: () => void) => {
        timersRef.current.push(window.setTimeout(fn, delay))
      }
      BUILD_MODULES.forEach((mod, moduleIndex) => {
        const moduleStart = moduleIndex * MODULE_BUILD_MS
        schedule(moduleStart, () =>
          setAnimation((prev) =>
            prev
              ? { ...prev, moduleStatus: prev.moduleStatus.map((s, i) => (i === moduleIndex ? 'building' : s)) }
              : prev,
          ),
        )
        mod.files.forEach((_, fileIndex) => {
          schedule(moduleStart + ((fileIndex + 1) * MODULE_BUILD_MS) / (mod.files.length + 1), () =>
            setAnimation((prev) =>
              prev
                ? { ...prev, visibleFiles: prev.visibleFiles.map((n, i) => (i === moduleIndex ? n + 1 : n)) }
                : prev,
            ),
          )
        })
        schedule(moduleStart + MODULE_BUILD_MS, () =>
          setAnimation((prev) =>
            prev ? { ...prev, moduleStatus: prev.moduleStatus.map((s, i) => (i === moduleIndex ? 'done' : s)) } : prev,
          ),
        )
      })
      schedule(TOTAL_BUILD_MS, () => {
        setAnimation(null)
        if (mode === 'build') finishBuild({ projectId })
      })
    },
    [clearTimers, finishBuild, projectId],
  )

  useEffect(() => {
    if (!signal) return
    const seen = seenRef.current
    if (seen && seen.projectId === projectId && seen.nonce === signal.nonce) return
    const firstForProject = !seen || seen.projectId !== projectId
    seenRef.current = { projectId, nonce: signal.nonce }
    // 持久化的 replay signal（重播后刷新）不自动回放；只有中途打断的 build 才自动重播
    if (firstForProject && signal.mode === 'replay') return
    start(signal.mode)
  }, [signal, projectId, start])

  useEffect(
    () => () => {
      clearTimers()
      setAnimation(null)
    },
    [clearTimers, projectId],
  )

  if (animation) return { ...animation, built }
  return {
    moduleStatus: BUILD_MODULES.map(() => (built ? 'done' : 'waiting')),
    visibleFiles: BUILD_MODULES.map((mod) => (built ? mod.files.length : 0)),
    animating: false,
    built,
  }
}
