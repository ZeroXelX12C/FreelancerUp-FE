"use client"

import { useState } from "react"
import { useAuth } from "@/app/hooks/useAuth"
import { useRouter } from "next/navigation"
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
import { RegisterRequest } from "@/app/types/api.types"
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const { register, isLoading } = useAuth() // Giả sử context có export isLoading
  const router = useRouter()
  
  // State form data
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "FREELANCER" // Mặc định
  })
  
  const [error, setError] = useState<string | null>(null)

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  // Xử lý chọn Role
  const setRole = (role: 'FREELANCER' | 'CLIENT') => {
    setFormData({ ...formData, role })
  }

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate cơ bản
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    try {
      await register(formData)
      // Redirect đã được xử lý trong AuthContext
    } catch (error: unknown) {
      // --- XỬ LÝ LỖI AN TOÀN (TYPE-SAFE) ---
      let message = "Đăng ký thất bại. Vui lòng thử lại."

      if (error instanceof AxiosError) {
        // Lấy message từ backend (nếu có)
        message = error.response?.data?.message || message
      } else if (error instanceof Error) {
        message = error.message
      }
      
      setError(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">FreelancerUp</CardTitle>
          <CardDescription>Tạo tài khoản để bắt đầu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Bạn là?</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formData.role === 'CLIENT' ? 'default' : 'outline'}
                  onClick={() => setRole('CLIENT')}
                  className="w-full"
                >
                  Client
                </Button>
                <Button
                  type="button"
                  variant={formData.role === 'FREELANCER' ? 'default' : 'outline'}
                  onClick={() => setRole('FREELANCER')}
                  className="w-full"
                >
                  Freelancer
                </Button>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full" disabled={false}>
               Đăng ký
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Đăng nhập ngay
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}