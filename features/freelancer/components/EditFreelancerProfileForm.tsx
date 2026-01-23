'use client';

import { useState } from 'react';
import type {
  FreelancerProfileResponse,
  UpdateFreelancerProfileRequest,
  FreelancerSkill,
} from '@/types/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SkillSelector } from './SkillSelector';

type Availability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

interface EditFreelancerProfileFormProps {
  profile: FreelancerProfileResponse;
  onUpdate: (data: UpdateFreelancerProfileRequest) => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export function EditFreelancerProfileForm({
  profile,
  onUpdate,
  onCancel,
  isUpdating,
}: EditFreelancerProfileFormProps) {
  const [formData, setFormData] = useState<
    Omit<UpdateFreelancerProfileRequest, 'skills'>
  >({
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    availability: profile.availability,
  });
  const [skills, setSkills] = useState<FreelancerSkill[]>(profile.skills || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if ((formData.hourlyRate ?? 0) <= 0) {
      toast.error('Hourly rate must be greater than 0');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    onUpdate({
      ...formData,
      skills,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvailabilityChange = (value: Availability) => {
    setFormData({
      ...formData,
      availability: value,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your freelancer profile information
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell clients about your experience..."
              value={formData.bio || ''}
              onChange={handleChange}
              disabled={isUpdating}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">
                Hourly Rate (USD) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="1"
                step="1"
                value={formData.hourlyRate || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourlyRate: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={isUpdating}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Current Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={handleAvailabilityChange}
                disabled={isUpdating}
              >
                <SelectTrigger id="availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SkillSelector skills={skills} onChange={setSkills} maxSkills={20} />

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
