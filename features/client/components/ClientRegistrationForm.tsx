'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { clientService } from '../services/clientService';
import type { RegisterClientRequest } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';

type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export function ClientRegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterClientRequest>({
    companyName: '',
    industry: '',
    companySize: undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterClientRequest) => clientService.register(data),
    onSuccess: () => {
      toast.success('Client registration successful!');
      setTimeout(() => {
        window.location.href = '/dashboard/client';
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      toast.error('Please enter company name');
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompanySizeChange = (value: CompanySize) => {
    setFormData({
      ...formData,
      companySize: value,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register as Client</CardTitle>
        <CardDescription>
          Complete your company information to start posting projects
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="ABC Technology Corp"
              value={formData.companyName}
              onChange={handleChange}
              disabled={mutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              placeholder="Technology, Marketing, Design..."
              value={formData.industry}
              onChange={handleChange}
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size</Label>
            <Select
              value={formData.companySize}
              onValueChange={handleCompanySizeChange}
              disabled={mutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
