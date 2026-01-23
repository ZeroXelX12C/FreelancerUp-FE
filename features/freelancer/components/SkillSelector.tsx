'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SkillBadge } from './SkillBadge';
import { Plus } from 'lucide-react';
import type { FreelancerSkill, ProficiencyLevel } from '@/types/api';

interface SkillSelectorProps {
  skills: FreelancerSkill[];
  onChange: (skills: FreelancerSkill[]) => void;
  maxSkills?: number;
}

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'PHP',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'UI/UX Design',
  'Figma',
  'Adobe XD',
  'Sketch',
  'Project Management',
  'Agile',
  'Scrum',
  'Data Analysis',
  'Machine Learning',
  'DevOps',
];

export function SkillSelector({
  skills,
  onChange,
  maxSkills = 20,
}: SkillSelectorProps) {
  const [newSkill, setNewSkill] = useState<{
    name: string;
    proficiencyLevel: ProficiencyLevel;
    yearsOfExperience: string;
  }>({
    name: '',
    proficiencyLevel: 'INTERMEDIATE',
    yearsOfExperience: '',
  });
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;

    const skill: FreelancerSkill = {
      skillId: `skill-${Date.now()}`,
      name: newSkill.name.trim(),
      proficiencyLevel: newSkill.proficiencyLevel,
      yearsOfExperience: newSkill.yearsOfExperience
        ? parseInt(newSkill.yearsOfExperience, 10)
        : undefined,
    };

    // Check for duplicates
    if (
      skills.some(
        (s) => s.name.toLowerCase() === skill.name.toLowerCase()
      )
    ) {
      return;
    }

    if (skills.length >= maxSkills) {
      return;
    }

    onChange([...skills, skill]);

    // Reset form
    setNewSkill({
      name: '',
      proficiencyLevel: 'INTERMEDIATE',
      yearsOfExperience: '',
    });
    setShowCustomInput(false);
  };

  const handleRemoveSkill = (skillToRemove: FreelancerSkill) => {
    onChange(skills.filter((skill) => skill.skillId !== skillToRemove.skillId));
  };

  const handleQuickAdd = (skillName: string) => {
    setNewSkill({ ...newSkill, name: skillName });
    setShowCustomInput(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add your technical skills and proficiency level ({skills.length}/{maxSkills})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display existing skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillBadge
                key={skill.skillId}
                skill={skill}
                onRemove={() => handleRemoveSkill(skill)}
                showExperience
              />
            ))}
          </div>
        )}

        {/* Quick-add suggestions */}
        {!showCustomInput && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Common skills (click to add):
            </Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.slice(0, 12).map((skillName) =>
                skills.some(
                  (s) => s.name.toLowerCase() === skillName.toLowerCase()
                ) ? null : (
                  <Button
                    key={skillName}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(skillName)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {skillName}
                  </Button>
                )
              )}
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setShowCustomInput(true)}
              className="p-0"
            >
              + Add custom skill
            </Button>
          </div>
        )}

        {/* Custom skill input */}
        {showCustomInput && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="skill-name">
                Skill Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="skill-name"
                placeholder="e.g., React, Python, Project Management"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proficiency">Proficiency Level</Label>
                <Select
                  value={newSkill.proficiencyLevel}
                  onValueChange={(value: ProficiencyLevel) =>
                    setNewSkill({ ...newSkill, proficiencyLevel: value })
                  }
                >
                  <SelectTrigger id="proficiency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">
                  Years of Experience (Optional)
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 3"
                  value={newSkill.yearsOfExperience}
                  onChange={(e) =>
                    setNewSkill({
                      ...newSkill,
                      yearsOfExperience: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddSkill}
                disabled={!newSkill.name.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Skill
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
