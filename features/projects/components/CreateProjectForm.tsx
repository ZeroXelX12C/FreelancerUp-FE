'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import type { CreateProjectRequest, ProjectType, ProjectBudget } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';

export function CreateProjectForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<CreateProjectRequest, 'budget'>>({
    title: '',
    description: '',
    requirements: '',
    skills: [],
    type: 'FIXED_PRICE',
    duration: undefined,
    deadline: undefined,
  });

  const [budget, setBudget] = useState<ProjectBudget>({
    minAmount: 0,
    maxAmount: 0,
    currency: 'USD',
    isNegotiable: false,
  });

  const [skillInput, setSkillInput] = useState('');

  const mutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.create(data),
    onSuccess: (project) => {
      toast.success('Project posted successfully!');
      router.push(`/projects/${project.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter project title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter project description');
      return;
    }

    if (budget.minAmount < 0 || budget.maxAmount < 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    if (budget.minAmount > budget.maxAmount) {
      toast.error('Minimum budget cannot be greater than maximum');
      return;
    }

    mutation.mutate({
      ...formData,
      budget,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === 'number'
          ? parseFloat(e.target.value) || undefined
          : e.target.value,
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Post New Project</CardTitle>
        <CardDescription>
          Fill in the details to find the right freelancer
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Website Development for E-commerce"
              value={formData.title}
              onChange={handleChange}
              disabled={mutation.isPending}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project requirements clearly..."
              value={formData.description}
              onChange={handleChange}
              disabled={mutation.isPending}
              rows={6}
              required
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              placeholder="Specific requirements or deliverables..."
              value={formData.requirements || ''}
              onChange={handleChange}
              disabled={mutation.isPending}
              rows={3}
            />
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Project Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ProjectType) =>
                setFormData({ ...formData, type: value })
              }
              disabled={mutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                <SelectItem value="HOURLY">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Budget (USD)</Label>
              <Input
                id="minAmount"
                name="minAmount"
                type="number"
                min="0"
                value={budget.minAmount || ''}
                onChange={(e) =>
                  setBudget({ ...budget, minAmount: parseFloat(e.target.value) || 0 })
                }
                disabled={mutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Budget (USD)</Label>
              <Input
                id="maxAmount"
                name="maxAmount"
                type="number"
                min="0"
                value={budget.maxAmount || ''}
                onChange={(e) =>
                  setBudget({ ...budget, maxAmount: parseFloat(e.target.value) || 0 })
                }
                disabled={mutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isNegotiable">Negotiable</Label>
              <Select
                value={budget.isNegotiable ? 'yes' : 'no'}
                onValueChange={(value) =>
                  setBudget({ ...budget, isNegotiable: value === 'yes' })
                }
                disabled={mutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days, optional)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={formData.duration || ''}
              onChange={handleChange}
              disabled={mutation.isPending}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
              disabled={mutation.isPending}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                disabled={mutation.isPending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                disabled={mutation.isPending}
              >
                Add
              </Button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary cursor-pointer"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Posting...' : 'Post Project'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
