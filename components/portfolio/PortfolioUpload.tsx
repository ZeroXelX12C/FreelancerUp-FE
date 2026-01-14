"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import type { AxiosProgressEvent } from 'axios'

type UploadStatus = "ready" | "uploading" | "done" | "error"

export interface UploadedImage {
  id: string
  file?: File
  previewUrl?: string
  progress: number
  status: UploadStatus
  url?: string
  error?: string
}

interface PortfolioUploadProps {
  max?: number
  maxFileSize?: number // bytes
  accept?: string[]
  onChange?: (images: UploadedImage[]) => void
  initialImages?: string[]
}

export function PortfolioUpload({
  max = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  accept = ["image/jpeg", "image/png", "image/webp"],
  onChange,
  initialImages = [],
}: PortfolioUploadProps) {
  const [images, setImages] = React.useState<UploadedImage[]>(() =>
    initialImages.map((url, i) => ({ id: `init-${i}`, previewUrl: url, progress: 100, status: "done", url }))
  )
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    onChange?.(images)
  }, [images, onChange])

  // track created blob urls so we can revoke them on unmount or on remove
  const blobUrlsRef = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    const created = blobUrlsRef.current
    return () => {
      const urls = Array.from(created)
      urls.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {
          // ignore
        }
      })
      created.clear()
    }
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const next = Array.from(files)

    if (images.length + next.length > max) {
      setError(`Tối đa ${max} ảnh`) // Vietnamese message as repo language
      return
    }

    const mapped = next.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      const preview = URL.createObjectURL(file)
      // track created blob url
      blobUrlsRef.current.add(preview)

      if (!accept.includes(file.type)) {
        return {
          id,
          file,
          previewUrl: preview,
          progress: 0,
          status: "error" as UploadStatus,
          error: "Sai định dạng file",
        }
      }

      if (file.size > maxFileSize) {
        return {
          id,
          file,
          previewUrl: preview,
          progress: 0,
          status: "error" as UploadStatus,
          error: "File quá lớn",
        }
      }

      return {
        id,
        file,
        previewUrl: preview,
        progress: 0,
        status: "ready" as UploadStatus,
      }
    })

    setImages((prev) => {
      const merged = [...prev, ...mapped]
      return merged
    })

    // start uploading valid files
    mapped.forEach((m) => {
      if (m.status === "ready" && m.file) {
        uploadFile(m.id, m.file)
      }
    })
  }

  const uploadFile = async (id: string, file: File) => {
    setImages((prev) => prev.map((p) => (p.id === id ? { ...p, status: "uploading", progress: 0 } : p)))

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = (await api.post<{ url: string }>('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev: AxiosProgressEvent) => {
          const loaded = ev.loaded ?? 0
          const total = ev.total ?? 0
          const percent = total ? Math.round((loaded * 100) / total) : 0
          setImages((prev) => prev.map((p) => (p.id === id ? { ...p, progress: percent } : p)))
        },
      })) as unknown as { url?: string }

      const url = res?.url ?? ''

      setImages((prev) => prev.map((p) => (p.id === id ? { ...p, status: "done", progress: 100, url } : p)))
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message : String(err)
      setImages((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error", error: message || 'Upload failed' } : p)))
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const toRemove = prev.find((p) => p.id === id)
      if (toRemove?.previewUrl && toRemove.previewUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(toRemove.previewUrl)
        } catch {
          // ignore
        }
        blobUrlsRef.current.delete(toRemove.previewUrl)
      }
      return prev.filter((p) => p.id !== id)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          "cursor-pointer rounded-md border-2 border-dashed p-6 text-center bg-muted/30 hover:bg-muted/40",
          "flex flex-col items-center justify-center"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          className="hidden"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="text-sm text-muted-foreground">Kéo thả ảnh vào đây hoặc click để chọn (tối đa {max})</div>
        <div className="text-xs text-muted-foreground mt-2">Định dạng: {accept.join(', ')} | Kích thước tối đa: {Math.round(maxFileSize / 1024 / 1024)}MB</div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative rounded overflow-hidden border bg-white">
            {img.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.previewUrl} alt="preview" className="w-full h-28 object-cover" />
            ) : (
              <div className="w-full h-28 flex items-center justify-center text-sm text-muted-foreground">No preview</div>
            )}

            <div className="p-2 flex items-center justify-between gap-2">
              <div className="flex-1 truncate text-sm">{img.file?.name ?? img.url?.split('/').pop()}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => removeImage(img.id)}>
                  Xóa
                </Button>
                {img.url && (
                  <a href={img.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                    Mở
                  </a>
                )}
              </div>
            </div>

            <div className="absolute left-0 right-0 bottom-0">
              <div className="h-1 bg-neutral-200">
                <div style={{ width: `${img.progress}%` }} className={"h-1 bg-primary transition-all"} />
              </div>
              {img.status === 'error' && <div className="text-xs text-destructive p-1">{img.error}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PortfolioUpload
