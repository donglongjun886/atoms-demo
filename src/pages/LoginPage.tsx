import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from '@/components/UserAvatar'
import { resetDemoData, useUsersStore } from '@/store/users'

export function LoginPage() {
  const navigate = useNavigate()
  const users = useUsersStore((s) => s.users)
  const login = useUsersStore((s) => s.login)
  const loginWithPassword = useUsersStore((s) => s.loginWithPassword)
  const register = useUsersStore((s) => s.register)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [resetOpen, setResetOpen] = useState(false)

  const handleLogin = (userId: string) => {
    login(userId)
    navigate('/')
  }

  const handlePasswordLogin = () => {
    const user = loginWithPassword(loginEmail.trim(), loginPassword)
    if (!user) {
      setLoginError('邮箱或密码不正确')
      return
    }
    navigate('/')
  }

  const handleRegister = () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('请填写昵称、邮箱和密码')
      return
    }
    register({ name: regName.trim(), email: regEmail.trim(), password: regPassword })
    navigate('/')
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/40 px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Atoms-Demo</h1>
        <p className="mt-2 text-muted-foreground">多人与 Agent 团队共创的应用生成演示</p>
      </div>

      <Card className="w-full max-w-xl">
        <Tabs defaultValue="demo">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="demo">Demo 账号</TabsTrigger>
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="demo">
            <CardContent className="grid grid-cols-1 gap-3">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user.id)}
                  className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                >
                  <UserAvatar name={user.name} color={user.color} />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </TabsContent>

          <TabsContent value="login">
            <CardContent className="space-y-3">
              <Input
                placeholder="邮箱"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="密码"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
              />
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button className="w-full" onClick={handlePasswordLogin}>
                登录
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="register">
            <CardContent className="space-y-3">
              <Input placeholder="昵称" value={regName} onChange={(e) => setRegName(e.target.value)} />
              <Input placeholder="邮箱" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              <Input
                type="password"
                placeholder="密码"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
              {regError && <p className="text-sm text-destructive">{regError}</p>}
              <Button className="w-full" onClick={handleRegister}>
                注册并登录
              </Button>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="mt-6 text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            重置 Demo 数据
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置 Demo 数据</DialogTitle>
            <DialogDescription>
              将清空本地存储的全部数据（账号、项目等）并重新注入种子数据，此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={resetDemoData}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
