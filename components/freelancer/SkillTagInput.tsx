"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SkillTagInputProps {
  value?: string[]
  onChange?: (skills: string[]) => void
  placeholder?: string
}

export function SkillTagInput({ value = [], onChange, placeholder = "Thêm kỹ năng và nhấn Enter" }: SkillTagInputProps) {
  const [skills, setSkills] = React.useState<string[]>(value)
  const [input, setInput] = React.useState("")

  React.useEffect(() => setSkills(value), [value])

  const addSkill = (s: string) => {
    const t = s.trim()
    if (!t) return
    if (skills.includes(t)) return
    const next = [...skills, t]
    setSkills(next)
    onChange?.(next)
  }

  const removeSkill = (index: number) => {
    const next = skills.filter((_, i) => i !== index)
    setSkills(next)
    onChange?.(next)
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-2">
        {skills.map((s, i) => (
          <div key={s + i} className="flex items-center gap-2 bg-accent/40 text-sm rounded-full px-3 py-1">
            <span>{s}</span>
            <button type="button" onClick={() => removeSkill(i)} className="text-muted-foreground">×</button>
          </div>
        ))}
      </div>

      <Input
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            if (input.trim()) {
              addSkill(input)
              setInput("")
            }
          }
          if (e.key === "Backspace" && !input) {
            // remove last
            if (skills.length > 0) {
              removeSkill(skills.length - 1)
            }
          }
        }}
      />

      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => {
          if (input.trim()) {
            addSkill(input)
            setInput("")
          }
        }}>Thêm</Button>
      </div>
    </div>
  )
}

export default SkillTagInput;