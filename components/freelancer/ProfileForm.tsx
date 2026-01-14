"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FileUpload from "@/components/ui/file-upload"
import SkillTagInput from "@/components/freelancer/SkillTagInput"
import { FreelancerProfile, UpdateFreelancerProfileRequest } from "@/app/types/api.types"

interface ExperienceItem { role?: string; company?: string; years?: string }
interface EducationItem { school?: string; degree?: string; years?: string }

interface ProfileFormProps {
  initialData?: FreelancerProfile | null
  onSubmit: (data: UpdateFreelancerProfileRequest) => Promise<void>
}

export function ProfileForm({ initialData = null, onSubmit }: ProfileFormProps) {
  const [fullName, setFullName] = React.useState(initialData?.fullName ?? "")
  const [bio, setBio] = React.useState(initialData?.bio ?? "")
  const [hourlyRate, setHourlyRate] = React.useState<number | undefined>(initialData?.hourlyRate)
  const [skills, setSkills] = React.useState<string[]>(initialData?.skills ?? [])
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(initialData?.avatar ?? null)

  const [experience, setExperience] = React.useState<ExperienceItem[]>([{ role: "", company: "", years: "" }])
  const [education, setEducation] = React.useState<EducationItem[]>([{ school: "", degree: "", years: "" }])

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setFullName(initialData?.fullName ?? "")
    setBio(initialData?.bio ?? "")
    setHourlyRate(initialData?.hourlyRate)
    setSkills(initialData?.skills ?? [])
    setAvatarPreview(initialData?.avatar ?? null)
  }, [initialData])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload: UpdateFreelancerProfileRequest = {
        fullName,
        bio,
        hourlyRate: hourlyRate ?? undefined,
        skills,
        // attach experience & education if provided (backend may ignore)
        experience: experience.length ? experience : undefined,
        education: education.length ? education : undefined,
      }

      // If we have new avatar file, convert to base64 for demo (backend must support multipart)
      if (avatarFile) {
        payload.avatar = await fileToBase64(avatarFile)
      }

      await onSubmit(payload)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Có lỗi xảy ra khi cập nhật profile.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1">Hình đại diện</Label>
          <FileUpload value={avatarPreview} onFileChange={(f) => { setAvatarFile(f); if (!f) setAvatarPreview(null) }} />
        </div>

        <div className="space-y-3">
          <div>
            <Label className="mb-1">Họ và tên</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <Label className="mb-1">Mức giá / giờ (USD)</Label>
            <Input type="number" value={hourlyRate ?? ""} onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : undefined)} />
          </div>

          <div>
            <Label className="mb-1">Kỹ năng</Label>
            <SkillTagInput value={skills} onChange={(s) => setSkills(s)} />
          </div>
        </div>
      </div>

      <div>
        <Label className="mb-1">Bio</Label>
        <textarea className="w-full rounded-md border p-2" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div>
        <Label className="mb-1">Kinh nghiệm</Label>
        <div className="space-y-2">
          {experience.map((exp, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <Input placeholder="Vai trò" value={exp.role} onChange={(e) => { const next = [...experience]; next[idx] = { ...next[idx], role: e.target.value }; setExperience(next) }} />
              <Input placeholder="Công ty" value={exp.company} onChange={(e) => { const next = [...experience]; next[idx] = { ...next[idx], company: e.target.value }; setExperience(next) }} />
              <div className="flex gap-2">
                <Input placeholder="Năm" value={exp.years} onChange={(e) => { const next = [...experience]; next[idx] = { ...next[idx], years: e.target.value }; setExperience(next) }} />
                <Button variant="destructive" size="sm" onClick={() => { setExperience(experience.filter((_, i) => i !== idx)) }}>Xóa</Button>
              </div>
            </div>
          ))}

          <Button size="sm" onClick={() => setExperience([...experience, { role: "", company: "", years: "" }])}>Thêm kinh nghiệm</Button>
        </div>
      </div>

      <div>
        <Label className="mb-1">Học vấn</Label>
        <div className="space-y-2">
          {education.map((edu, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <Input placeholder="Trường" value={edu.school} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], school: e.target.value }; setEducation(next) }} />
              <Input placeholder="Bằng" value={edu.degree} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], degree: e.target.value }; setEducation(next) }} />
              <div className="flex gap-2">
                <Input placeholder="Năm" value={edu.years} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], years: e.target.value }; setEducation(next) }} />
                <Button variant="destructive" size="sm" onClick={() => setEducation(education.filter((_, i) => i !== idx))}>Xóa</Button>
              </div>
            </div>
          ))}

          <Button size="sm" onClick={() => setEducation([...education, { school: "", degree: "", years: "" }])}>Thêm học vấn</Button>
        </div>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</Button>
      </div>
    </form>
  )
}

async function fileToBase64(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(String(reader.result))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default ProfileForm;