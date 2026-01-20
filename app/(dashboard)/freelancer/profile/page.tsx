"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { freelancerApi } from "@/lib/api"
import ProfileForm from "@/components/freelancer/ProfileForm"
import { Button } from "@/components/ui/button"
import { FreelancerProfile, UpdateFreelancerProfileRequest } from "@/app/types/api.types"
import { AxiosError } from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function FreelancerProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = React.useState<FreelancerProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // State để chuyển đổi chế độ Xem/Sửa
  const [isEditing, setIsEditing] = React.useState(false)

  // Hàm lấy dữ liệu Profile từ API
  const fetchProfile = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await freelancerApi.getProfile()
      setProfile(data)
    } catch (err: unknown) {
      // Nếu lỗi 404 (chưa có profile), ta sẽ không báo lỗi mà để profile null -> hiển thị màn hình chào mừng/tạo mới
      if (err instanceof AxiosError && err.response?.status === 404) {
        setProfile(null)
      } else {
        let msg = "Không thể lấy thông tin profile"
        if (err instanceof AxiosError) {
          msg = err.response?.data?.message || msg
        } else if (err instanceof Error) {
          msg = err.message
        }
        setError(msg)
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Hàm xử lý khi user nhấn Lưu ở Form
  const handleSave = async (payload: UpdateFreelancerProfileRequest) => {
    // Promise toast để tạo hiệu ứng loading đẹp mắt
    const promise = freelancerApi.updateProfile(payload);

    toast.promise(promise, {
        loading: 'Đang lưu hồ sơ...',
        success: (res) => {
            setProfile(res);
            setIsEditing(false);
            return 'Cập nhật hồ sơ thành công!';
        },
        error: (err) => {
            let msg = "Lỗi khi lưu hồ sơ";
            if (err instanceof AxiosError) {
                msg = err.response?.data?.message || msg;
            }
            return msg;
        }
    });

    try {
        await promise;
    } catch (error) {
        // Lỗi đã được xử lý trong toast.promise
    }
  }

  // Nếu đang loading
  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Đang tải dữ liệu hồ sơ...</div>
  }

  // Nếu có lỗi hệ thống (không phải 404)
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-destructive mb-4">Lỗi: {error}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Tạo hồ sơ Freelancer</h1>
        <p className="text-muted-foreground mb-6">Hãy cập nhật thông tin để bắt đầu nhận việc.</p>
        <div className="bg-white p-6 border rounded-lg shadow-sm">
           {/* Form tạo mới không cần nút Hủy */}
           <ProfileForm onSubmit={handleSave} />
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Chỉnh sửa hồ sơ</h1>
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <ProfileForm 
            initialData={profile} 
            onSubmit={handleSave} 
            onCancel={() => setIsEditing(false)} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <div className="space-x-2">
            <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
            {/* Nút kích hoạt chế độ sửa */}
            <Button onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</Button>
        </div>
      </div>

      {/* 1. Card Thông tin chính */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="shrink-0">
               {profile.avatar ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={profile.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
               ) : (
                 <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium text-lg">
                   No Avatar
                 </div>
               )}
            </div>

            {/* Thông tin */}
            <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                <p className="text-gray-500 font-medium">{profile.email}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {profile.hourlyRate ? `$${profile.hourlyRate}/giờ` : 'Chưa cập nhật giá'}
                    </span>
                    {/* Hiển thị Skills */}
                    {profile.skills?.map(skill => (
                        <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: Giới thiệu */}
          <div className="md:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Giới thiệu (Bio)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {profile.bio || "Chưa có thông tin giới thiệu."}
                    </p>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Kinh nghiệm làm việc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {profile.experience && profile.experience.length > 0 ? (
                        profile.experience.map((exp, index) => (
                            <div key={index} className="flex gap-4 border-b last:border-0 pb-4 last:pb-0">
                                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                                    {exp.company?.charAt(0) || "C"}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg">{exp.position}</h4>
                                    <p className="text-gray-600">{exp.company}</p>
                                    <p className="text-sm text-gray-400 mt-1">{exp.years}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Chưa cập nhật kinh nghiệm.</p>
                    )}
                </CardContent>
             </Card>
          </div>

          {/* Cột phải: Học vấn & Khác */}
          <div className="space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle>Học vấn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {profile.education && profile.education.length > 0 ? (
                        profile.education.map((edu, index) => (
                            <div key={index} className="pl-4 border-l-2 border-purple-200">
                                <h4 className="font-semibold">{edu.schoolName}</h4>
                                <p className="text-sm text-gray-600">{edu.degree} - {edu.fieldOfStudy}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Chưa cập nhật học vấn.</p>
                    )}
                </CardContent>
              </Card>
          </div>
      </div>
    </div>
  )
}