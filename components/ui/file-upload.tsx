"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FileUploadProps {
  value?: string | null
  onFileChange?: (file: File | null) => void
  accept?: string
  className?: string
}

export function FileUpload({ value = null, onFileChange, accept = "image/*", className = "" }: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(value)

  React.useEffect(() => {
    setPreview(value ?? null)
  }, [value])

  const handleFile = (file?: File) => {
    if (!file) {
      setPreview(null)
      onFileChange?.(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileChange?.(file)
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-4">
        <label className="w-28 h-28 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm text-muted-foreground">Preview</div>
          )}
        </label>

        <div className="flex flex-col gap-2">
          <Input
            type="file"
            accept={accept}
            onChange={(e) => {
              const f = e.target.files?.[0]
              handleFile(f)
            }}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleFile(undefined)}>
              Xóa
            </Button>
            {preview && (
              <a className="text-sm text-primary underline" href={preview} target="_blank" rel="noreferrer">
                Mở ảnh
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUpload;