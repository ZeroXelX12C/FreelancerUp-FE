"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FileUpload from "@/components/ui/file-upload"
import SkillTagInput from "@/components/freelancer/SkillTagInput"
import { FreelancerProfile, UpdateFreelancerProfileRequest } from "@/app/types/api.types"

interface ExperienceItem { position?: string; company?: string; years?: string }
interface EducationItem { schoolName?: string; degree?: string; fieldOfStudy?: string }

interface ProfileFormProps {
  initialData?: FreelancerProfile | null
  onSubmit: (data: UpdateFreelancerProfileRequest) => Promise<void>
  onCancel?: () => void
}

export function ProfileForm({ initialData = null, onSubmit, onCancel }: ProfileFormProps) {
  const [fullName, setFullName] = React.useState(initialData?.fullName ?? "")
  const [bio, setBio] = React.useState(initialData?.bio ?? "")
  const [hourlyRate, setHourlyRate] = React.useState<number | undefined>(initialData?.hourlyRate)
  const [skills, setSkills] = React.useState<string[]>(initialData?.skills ?? [])
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(initialData?.avatar ?? null)

  const [experience, setExperience] = React.useState<ExperienceItem[]>(
    initialData?.experience?.length ? initialData.experience : []
  )
  const [education, setEducation] = React.useState<EducationItem[]>(
    initialData?.education?.length ? initialData.education : []
  )

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setFullName(initialData?.fullName ?? "")
    setBio(initialData?.bio ?? "")
    setHourlyRate(initialData?.hourlyRate)
    setSkills(initialData?.skills ?? [])
    setAvatarPreview(initialData?.avatar ?? null)
    setExperience(initialData?.experience?.length ? initialData.experience : [])
    setEducation(initialData?.education?.length ? initialData.education : [])
  }, [initialData])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const cleanExperience = experience.filter(e => e.position || e.company);
      const cleanEducation = education.filter(e => e.schoolName || e.degree);

      const payload: UpdateFreelancerProfileRequest = {
        fullName,
        bio,
        hourlyRate: hourlyRate ?? undefined,
        skills,
        experience: cleanExperience, 
        education: cleanEducation,
      }

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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Kinh nghiệm */}
      <div>
        <Label className="mb-1">Kinh nghiệm</Label>
        <div className="space-y-3">
          {experience.map((exp, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-4">
                  <Input placeholder="Vai trò (VD: Java Dev)" value={exp.position} onChange={(e) => { const next = [...experience]; next[idx] = { ...next[idx], position: e.target.value }; setExperience(next) }} />
              </div>
              <div className="col-span-4">
                  <Input placeholder="Công ty" value={exp.company} onChange={(e) => { const next = [...experience]; next[idx] = { ...next[idx], company: e.target.value }; setExperience(next) }} />
              </div>
              <div className="col-span-3">
                  <Input placeholder="Năm (VD: 2020-2023)" value={exp.years} onChange={(e) => { const next = [...experience]; next[idx] = { ...next[idx], years: e.target.value }; setExperience(next) }} />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button variant="destructive" size="icon" type="button" onClick={() => { setExperience(experience.filter((_, i) => i !== idx)) }}>
                    <span className="sr-only">Xóa</span>
                    ×
                </Button>
              </div>
            </div>
          ))}
          <Button size="sm" type="button" variant="outline" onClick={() => setExperience([...experience, { position: "", company: "", years: "" }])}>
            + Thêm kinh nghiệm
          </Button>
        </div>
      </div>

      {/* Học vấn */}
      <div>
        <Label className="mb-1">Học vấn</Label>
        <div className="space-y-3">
          {education.map((edu, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-4">
                 <Input placeholder="Trường" value={edu.schoolName} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], schoolName: e.target.value }; setEducation(next) }} />
              </div>
              <div className="col-span-4">
                 <Input placeholder="Bằng cấp" value={edu.degree} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], degree: e.target.value }; setEducation(next) }} />
              </div>
              <div className="col-span-3">
                 <Input placeholder="Năm (VD: 2020-2023)" value={edu.fieldOfStudy} onChange={(e) => { const next = [...education]; next[idx] = { ...next[idx], fieldOfStudy: e.target.value }; setEducation(next) }} />
              </div>
              <div className="col-span-1 flex justify-end">
                 <Button variant="destructive" size="icon" type="button" onClick={() => setEducation(education.filter((_, i) => i !== idx))}>
                    <span className="sr-only">Xóa</span>
                    ×
                 </Button>
              </div>
            </div>
          ))}
          <Button size="sm" type="button" variant="outline" onClick={() => setEducation([...education, { schoolName: "", degree: "", fieldOfStudy: "" }])}>
             + Thêm học vấn
          </Button>
        </div>  
      </div>

      {error && <div className="text-destructive font-medium">{error}</div>}

      <div className="flex items-center gap-2 pt-4 border-t">
        <Button type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
        {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Hủy bỏ
            </Button>
        )}
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