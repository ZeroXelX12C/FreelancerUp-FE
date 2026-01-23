'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import type { ProjectSearchRequest, ProjectStatus, ProjectType } from '@/types/api';

interface ProjectFiltersProps {
  onFiltersChange: (filters: Partial<ProjectSearchRequest>) => void;
  currentFilters?: Partial<ProjectSearchRequest>;
}

const STATUS_OPTIONS: ProjectStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TYPE_OPTIONS: ProjectType[] = ['FIXED_PRICE', 'HOURLY'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Posted Date' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'budget', label: 'Budget' },
];

export function ProjectFilters({ onFiltersChange, currentFilters = {} }: ProjectFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>(
    currentFilters.statuses || []
  );
  const [selectedType, setSelectedType] = useState<ProjectType | undefined>(
    currentFilters.type
  );
  const [minBudget, setMinBudget] = useState(currentFilters.minBudget?.toString() || '');
  const [maxBudget, setMaxBudget] = useState(currentFilters.maxBudget?.toString() || '');
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'createdAt');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>(
    currentFilters.sortDirection || 'DESC'
  );

  const handleStatusChange = (status: ProjectStatus, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter((s) => s !== status);
    setSelectedStatuses(newStatuses);
  };

  const handleApplyFilters = () => {
    const filters: Partial<ProjectSearchRequest> = {
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      type: selectedType,
      minBudget: minBudget ? parseFloat(minBudget) : undefined,
      maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
      sortBy,
      sortDirection,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof ProjectSearchRequest] === undefined) {
        delete filters[key as keyof ProjectSearchRequest];
      }
    });

    onFiltersChange(filters);
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedType(undefined);
    setMinBudget('');
    setMaxBudget('');
    setSortBy('createdAt');
    setSortDirection('DESC');
    onFiltersChange({});
    setIsExpanded(false);
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedType !== undefined ||
    minBudget !== '' ||
    maxBudget !== '';

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={isExpanded ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-primary-foreground text-primary text-xs rounded-full">
              Active
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Project Status</Label>
              <div className="grid grid-cols-2 gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => handleStatusChange(status, !!checked)}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type">Project Type</Label>
              <Select
                value={selectedType || 'all'}
                onValueChange={(value) =>
                  setSelectedType(value === 'all' ? undefined : (value as ProjectType))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'FIXED_PRICE' ? 'Fixed Price' : 'Hourly'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <Label>Budget Range (USD)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="minBudget" className="text-xs text-muted-foreground">
                    Min
                  </Label>
                  <Input
                    id="minBudget"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxBudget" className="text-xs text-muted-foreground">
                    Max
                  </Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    min="0"
                    placeholder="Any"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortDirection">Order</Label>
                <Select
                  value={sortDirection}
                  onValueChange={(value) => setSortDirection(value as 'ASC' | 'DESC')}
                >
                  <SelectTrigger id="sortDirection">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Descending</SelectItem>
                    <SelectItem value="ASC">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
