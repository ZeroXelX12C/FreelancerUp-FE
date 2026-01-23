'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { freelancerService } from '../services/freelancerService';
import type { RegisterFreelancerRequest, FreelancerSkill } from '@/types/api';
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
import { toast } from 'sonner';

type Availability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export function FreelancerRegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<
    Omit<RegisterFreelancerRequest, 'skills'>
  >({
    bio: '',
    hourlyRate: 0,
    availability: 'AVAILABLE',
  });
  const [skills, setSkills] = useState<FreelancerSkill[]>([]);

  const mutation = useMutation({
    mutationFn: (data: RegisterFreelancerRequest) =>
      freelancerService.register(data),
    onSuccess: () => {
      toast.success('Freelancer registration successful!');
      setTimeout(() => {
        window.location.href = '/dashboard/freelancer';
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.hourlyRate <= 0) {
      toast.error('Please enter a valid hourly rate');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    mutation.mutate({
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
        <CardTitle>Register as Freelancer</CardTitle>
        <CardDescription>
          Complete your profile to start bidding on projects
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell clients about your experience, expertise, and what makes you unique..."
              value={formData.bio}
              onChange={handleChange}
              disabled={mutation.isPending}
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
                placeholder="50"
                value={formData.hourlyRate || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourlyRate: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={mutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Current Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={handleAvailabilityChange}
                disabled={mutation.isPending}
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

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Processing...' : 'Complete Registration'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
