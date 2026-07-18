'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash, Calendar, Target, CurrencyDollar } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import type { MetricType } from '@/types/database';

const METRICS: { value: MetricType; label: string; icon: string }[] = [
  { value: 'impressions', label: 'Impressions', icon: '👁' },
  { value: 'reach', label: 'Reach', icon: '📍' },
  { value: 'views', label: 'Views', icon: '▶' },
  { value: 'clicks', label: 'Clicks', icon: '👆' },
  { value: 'likes', label: 'Likes', icon: '❤️' },
  { value: 'comments', label: 'Comments', icon: '💬' },
  { value: 'shares', label: 'Shares', icon: '↗' },
  { value: 'saves', label: 'Saves', icon: '🔖' },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['impressions', 'reach', 'likes', 'comments']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleMetric = (metric: MetricType) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.get('name')) newErrors.name = 'Campaign name is required';
    if (!formData.get('start_date')) newErrors.start_date = 'Start date is required';
    if (!formData.get('end_date')) newErrors.end_date = 'End date is required';
    if (selectedMetrics.length === 0) newErrors.metrics = 'Select at least one metric';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          brand_name: formData.get('brand_name'),
          start_date: formData.get('start_date'),
          end_date: formData.get('end_date'),
          status: formData.get('status'),
          required_metrics: selectedMetrics,
          min_posts_required: parseInt(formData.get('min_posts_required') as string) || 1,
          budget: parseFloat(formData.get('budget') as string) || null,
          client_id: formData.get('client_id') || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      router.push(`/superadmin/campaigns/${data.id}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Campaign</h1>
        <p className="text-slate-500 mt-1">Set up your influencer marketing campaign</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              name="name"
              label="Campaign Name"
              placeholder="e.g., Summer Product Launch 2024"
              error={errors.name}
              required
            />

            <Input
              name="brand_name"
              label="Brand Name"
              placeholder="e.g., Nike, Starbucks"
            />

            <Textarea
              name="description"
              label="Description"
              placeholder="Describe the campaign objectives and requirements..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Dates & Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <CurrencyDollar className="inline h-4 w-4 mr-1" />
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  name="budget"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Target className="inline h-4 w-4 mr-1" />
                  Minimum Posts Required
                </label>
                <input
                  type="number"
                  name="min_posts_required"
                  defaultValue={1}
                  min={1}
                  max={20}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Required Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Select the metrics that influencers need to report for this campaign
            </p>

            {errors.metrics && (
              <p className="text-sm text-red-500 mb-4">{errors.metrics}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {METRICS.map((metric) => (
                <button
                  key={metric.value}
                  type="button"
                  onClick={() => toggleMetric(metric.value)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                    ${selectedMetrics.includes(metric.value)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }
                  `}
                >
                  <span className="text-xl">{metric.icon}</span>
                  <span className="font-medium text-sm">{metric.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              name="status"
              options={[
                { value: 'draft', label: 'Draft - Save as draft' },
                { value: 'active', label: 'Active - Ready to start' },
              ]}
              defaultValue="draft"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        {errors.submit && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <p className="text-sm text-rose-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <Link href="/superadmin/campaigns">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}
