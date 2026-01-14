"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import PortfolioUpload, { UploadedImage } from "./PortfolioUpload"
import api from "@/lib/api"

export interface PortfolioFormProps {
  initial?: {
    title?: string
    description?: string
    tags?: string[]
    projectUrl?: string
    images?: string[]
  }
}

export default function PortfolioForm({ initial }: PortfolioFormProps) {
  const [title, setTitle] = React.useState(initial?.title ?? "")
  const [description, setDescription] = React.useState(initial?.description ?? "")
  const [tags, setTags] = React.useState((initial?.tags ?? []).join(", "))
  const [projectUrl, setProjectUrl] = React.useState(initial?.projectUrl ?? "")
  const [images, setImages] = React.useState<UploadedImage[]>(() =>
    (initial?.images ?? []).map((url, i) => ({ id: `init-${i}`, previewUrl: url, progress: 100, status: "done", url }))
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề")
      return
    }

    // ensure uploads finished
    const hasUploading = images.some((i) => i.status === "uploading")
    if (hasUploading) {
      setError("Vui lòng chờ ảnh upload xong trước khi gửi")
      return
    }

    const failed = images.some((i) => i.status === "error")
    if (failed) {
      setError("Có lỗi khi upload ảnh. Vui lòng kiểm tra và thử lại")
      return
    }

    const imageUrls = images.filter((i) => i.url).map((i) => i.url!)

    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        projectUrl: projectUrl.trim() || undefined,
        images: imageUrls,
      }

      await api.post('/api/portfolios', payload)

      // success
      alert('Tạo portfolio thành công')
      // reset to initial values if provided, otherwise empty
      setTitle(initial?.title ?? "")
      setDescription(initial?.description ?? "")
      setTags((initial?.tags ?? []).join(", "))
      setProjectUrl(initial?.projectUrl ?? "")
      setImages(() => (initial?.images ?? []).map((url, i) => ({ id: `init-${i}`, previewUrl: url, progress: 100, status: "done", url })))
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message : String(err)
      setError(message || 'Lỗi khi gửi dữ liệu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên project" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-base"
          placeholder="Mô tả ngắn về project"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (phân cách bằng dấu ,)</label>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, ui-design" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link project (tùy chọn)</label>
        <Input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ảnh project</label>
        <PortfolioUpload
          onChange={(imgs) => setImages(imgs)}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Tạo portfolio'}
        </Button>
        <Button variant="outline" type="button" onClick={() => {
          setTitle("")
          setDescription("")
          setTags("")
          setProjectUrl("")
        }}>
          Huỷ
        </Button>
      </div>
    </form>
  )
}
