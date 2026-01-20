"use client"

import { useState } from "react"
import { useAuth } from "@/app/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AxiosError } from 'axios';

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      // Redirect đã được xử lý bên trong AuthContext
    } catch (error: unknown) {
      // --- XỬ LÝ LỖI AN TOÀN (TYPE-SAFE) ---
      let message = "Đăng nhập thất bại. Vui lòng thử lại."

      if (error instanceof AxiosError) {
        // Ưu tiên lấy message từ Backend trả về
        message = error.response?.data?.message || "Email hoặc mật khẩu không chính xác"
      } else if (error instanceof Error) {
        message = error.message
      }

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">FreelancerUp</CardTitle>
          <CardDescription>Đăng nhập để kết nối</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-blue-600 hover:underline font-medium">
              Đăng ký ngay
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}