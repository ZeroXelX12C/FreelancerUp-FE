'use client';

import { Badge } from '@/components/ui/badge';
import type { FreelancerSkill, ProficiencyLevel } from '@/types/api';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: FreelancerSkill;
  onRemove?: () => void;
  showExperience?: boolean;
}

const proficiencyConfig: Record<
  ProficiencyLevel,
  { label: string; color: string }
> = {
  BEGINNER: {
    label: 'Beginner',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  ADVANCED: {
    label: 'Advanced',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  EXPERT: {
    label: 'Expert',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
};

export function SkillBadge({
  skill,
  onRemove,
  showExperience = false,
}: SkillBadgeProps) {
  const config = proficiencyConfig[skill.proficiencyLevel];

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-3 py-1 text-sm font-medium',
        config.color,
        onRemove && 'pr-8'
      )}
    >
      <span className="font-semibold">{skill.name}</span>
      <span className="mx-1.5 text-xs opacity-75">•</span>
      <span className="text-xs">{config.label}</span>
      {showExperience && skill.yearsOfExperience && (
        <>
          <span className="mx-1.5 text-xs opacity-75">•</span>
          <span className="text-xs">{skill.yearsOfExperience}y</span>
        </>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 hover:opacity-70 transition-opacity"
          aria-label="Remove skill"
        >
          ×
        </button>
      )}
    </Badge>
  );
}
