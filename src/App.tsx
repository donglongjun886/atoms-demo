import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { LoginPage } from '@/pages/LoginPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { WorkspacePage } from '@/pages/WorkspacePage'
import { useProjectsStore } from '@/store/projects'
import { useUsersStore } from '@/store/users'

function RequireAuth({ children }: { children: JSX.Element }) {
  const currentUserId = useUsersStore((s) => s.currentUserId)
  if (!currentUserId) return <Navigate to="/login" replace />
  return children
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const currentUserId = useUsersStore((s) => s.currentUserId)
  if (currentUserId) return <Navigate to="/" replace />
  return children
}

function WorkspaceGuard() {
  const { projectId } = useParams<{ projectId: string }>()
  const currentUserId = useUsersStore((s) => s.currentUserId)
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId))

  if (!project || !currentUserId || !project.memberIds.includes(currentUserId)) {
    return <Navigate to="/" replace />
  }
  return <WorkspacePage />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <ProjectsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <RequireAuth>
              <WorkspaceGuard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
