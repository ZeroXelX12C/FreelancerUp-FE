"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { freelancerApi } from "@/lib/api"
import ProfileForm from "@/components/freelancer/ProfileForm"
import { Button } from "@/components/ui/button"

export default function FreelancerProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [useMock, setUseMock] = React.useState<boolean>(true)
  const [lastAction, setLastAction] = React.useState<string | null>(null)

  const SAMPLE_PROFILE = {
    id: 'sample-1',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    avatar: 'https://i.pravatar.cc/300?u=ng-v-a',
    bio: 'Kỹ sư phần mềm với 5 năm kinh nghiệm về React và Node.js. Thích xây dựng sản phẩm sáng tạo.',
    skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    hourlyRate: 45,
    experience: [{ role: 'Senior Frontend', company: 'ACME Corp', years: '2019-2023' }],
    education: [{ school: 'Đại học Bách Khoa', degree: 'Công nghệ thông tin', years: '2014-2018' }],
    updatedAt: new Date().toISOString(),
  }

  React.useEffect(() => {
    fetchProfile()
  }, [])

  const loadSample = () => {
    setProfile(SAMPLE_PROFILE)
    setLoading(false)
    setLastAction('Loaded sample profile')
  }

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      if (useMock) {
        // simulate fetch delay
        await new Promise((r) => setTimeout(r, 300))
        setProfile(SAMPLE_PROFILE)
        setLastAction('Fetched sample profile (mock)')
      } else {
        const data = await freelancerApi.getProfile()
        setProfile(data)
        setLastAction('Fetched profile from API')
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể lấy profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (payload: any) => {
    setSaving(true)
    setLastAction(null)
    try {
      if (useMock) {
        await new Promise((r) => setTimeout(r, 700))
        const merged = { ...(profile || {}), ...payload, updatedAt: new Date().toISOString() }
        setProfile(merged)
        setLastAction('Saved profile locally (mock)')
        return merged
      } else {
        const res = await freelancerApi.updateProfile(payload as any)
        setProfile(res)
        setLastAction('Saved profile via API')
        return res
      }
    } catch (err: any) {
      setLastAction('Save failed: ' + (err?.message || String(err)))
      throw err
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Quản lý Profile - Freelancer</h1>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline" onClick={loadSample}>Load sample</Button>
          <Button size="sm" variant={useMock ? 'secondary' : 'outline'} onClick={() => setUseMock(!useMock)}>
            Mock: {useMock ? 'On' : 'Off'}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : profile ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="p-4 border rounded-md">
              <h2 className="text-lg font-medium">Thông tin cơ bản</h2>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-4">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-20 h-20 object-cover rounded-md" />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">No avatar</div>
                  )}

                  <div>
                    <div className="font-medium">{profile.fullName}</div>
                    <div className="text-sm text-muted-foreground">{profile.email}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Kỹ năng</div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {(profile.skills || []).map((s: string) => (
                      <div key={s} className="text-sm px-2 py-1 bg-accent/40 rounded-md">{s}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Bio</div>
                  <div className="mt-1">{profile.bio || '—'}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Mức giá / giờ</div>
                  <div className="mt-1">{profile.hourlyRate ? `$${profile.hourlyRate}` : '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-4 border rounded-md">
            <h2 className="text-lg font-medium mb-4">Chỉnh sửa</h2>
            <ProfileForm initialData={profile} onSubmit={handleSubmit} />
            {saving && <div className="mt-2">Đang lưu...</div>}
            {lastAction && <div className="mt-2 text-sm text-muted-foreground">Last action: {lastAction}</div>}
          </div>
        </div>
      ) : (
        <div>Không có profile</div>
      )}
    </div>
  )
}