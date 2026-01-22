'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClientStatsResponse } from '@/types/api';
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface ClientStatsCardProps {
  stats: ClientStatsResponse;
}

export function ClientStatsCard({ stats }: ClientStatsCardProps) {
  const statItems = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Completed Projects',
      value: stats.completedProjects,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Spent',
      value: `$${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className={`p-3 rounded-full ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
