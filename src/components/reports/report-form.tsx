'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash,
  Upload,
  Image,
  Spinner,
  Check,
  ArrowLeft,
  ArrowRight,
  Eye,
  X,
  Link as LinkIcon,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  TwitterLogo,
  FacebookLogo,
} from '@/app/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Platform, MetricType } from '@/types/database';

const PLATFORMS: { value: Platform; label: string; icon: any }[] = [
  { value: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo },
  { value: 'youtube', label: 'YouTube', icon: YoutubeLogo },
  { value: 'twitter', label: 'X / Twitter', icon: TwitterLogo },
  { value: 'facebook', label: 'Facebook', icon: FacebookLogo },
];

interface PostForm {
  id: string;
  post_number: number;
  platform: Platform;
  post_url: string;
  screenshot: File | null;
  screenshotPreview: string | null;
  caption: string;
  metrics: {
    impressions: string;
    reach: string;
    views: string;
    clicks: string;
    likes: string;
    comments: string;
    shares: string;
    saves: string;
  };
  isProcessing: boolean;
  ocrData: any;
}

interface ReportFormProps {
  campaignId: string;
  campaign: {
    name: string;
    required_metrics: MetricType[];
    min_posts_required: number;
  };
}

export default function NewReportForm({ campaignId, campaign }: ReportFormProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostForm[]>([
    createEmptyPost(1)
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  function createEmptyPost(num: number): PostForm {
    return {
      id: crypto.randomUUID(),
      post_number: num,
      platform: 'instagram',
      post_url: '',
      screenshot: null,
      screenshotPreview: null,
      caption: '',
      metrics: {
        impressions: '',
        reach: '',
        views: '',
        clicks: '',
        likes: '',
        comments: '',
        shares: '',
        saves: '',
      },
      isProcessing: false,
      ocrData: null,
    };
  }

  const addPost = () => {
    if (posts.length < 10) {
      setPosts([...posts, createEmptyPost(posts.length + 1)]);
    }
  };

  const removePost = (id: string) => {
    if (posts.length > 1) {
      setPosts(posts.filter(p => p.id !== id).map((p, i) => ({ ...p, post_number: i + 1 })));
    }
  };

  const updatePost = (id: string, updates: Partial<PostForm>) => {
    setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleScreenshotUpload = async (postId: string, file: File) => {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const preview = e.target?.result as string;
      updatePost(postId, {
        screenshot: file,
        screenshotPreview: preview,
        isProcessing: true,
      });

      // Process OCR
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('platform', posts[postIndex].platform);

        const response = await fetch('/api/ocr/process', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.metrics) {
          updatePost(postId, {
            metrics: {
              impressions: data.metrics.impressions?.toString() || '',
              reach: data.metrics.reach?.toString() || '',
              views: data.metrics.views?.toString() || '',
              clicks: data.metrics.clicks?.toString() || '',
              likes: data.metrics.likes?.toString() || '',
              comments: data.metrics.comments?.toString() || '',
              shares: data.metrics.shares?.toString() || '',
              saves: data.metrics.saves?.toString() || '',
            },
            ocrData: data,
            isProcessing: false,
          });
        } else {
          updatePost(postId, { isProcessing: false });
        }
      } catch (error) {
        console.error('OCR error:', error);
        updatePost(postId, { isProcessing: false });
      }
    };
    reader.readAsDataURL(file);
  };

  const calculateTotals = () => {
    return posts.reduce(
      (acc, post) => ({
        impressions: acc.impressions + (parseInt(post.metrics.impressions) || 0),
        reach: acc.reach + (parseInt(post.metrics.reach) || 0),
        views: acc.views + (parseInt(post.metrics.views) || 0),
        clicks: acc.clicks + (parseInt(post.metrics.clicks) || 0),
        likes: acc.likes + (parseInt(post.metrics.likes) || 0),
        comments: acc.comments + (parseInt(post.metrics.comments) || 0),
        shares: acc.shares + (parseInt(post.metrics.shares) || 0),
        saves: acc.saves + (parseInt(post.metrics.saves) || 0),
      }),
      { impressions: 0, reach: 0, views: 0, clicks: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
    );
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate
      const newErrors: Record<string, string> = {};

      if (posts.length < campaign.min_posts_required) {
        newErrors.posts = `Minimum ${campaign.min_posts_required} post(s) required`;
      }

      posts.forEach((post, index) => {
        if (!post.post_url) {
          newErrors[`post_${index}_url`] = 'Post URL is required';
        }
        if (!post.screenshot) {
          newErrors[`post_${index}_screenshot`] = 'Screenshot is required';
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Create report
      const totals = calculateTotals();

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          status,
          ...totals,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create report');
      }

      // Upload screenshots and create posts
      for (const post of posts) {
        if (post.screenshot) {
          const formData = new FormData();
          formData.append('file', post.screenshot);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadResponse.json();

          if (uploadResponse.ok) {
            await fetch('/api/reports/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                report_id: data.id,
                post_number: post.post_number,
                platform: post.platform,
                post_url: post.post_url,
                caption: post.caption,
                screenshot_url: uploadData.path,
                screenshot_public_url: uploadData.publicUrl,
                ...Object.fromEntries(
                  Object.entries(post.metrics).map(([k, v]) => [k, parseInt(v) || 0])
                ),
                ocr_data: post.ocrData,
              }),
            });
          }
        }
      }

      router.push(`/influencer/reports/${data.id}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/influencer/reports"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Submit Report</h1>
          <p className="text-slate-500 mt-1">{campaign.name}</p>
        </div>
      </div>

      {/* Required Metrics Info */}
      <Card gradient="indigo">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
              <Image className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-indigo-900">Required Metrics</p>
              <p className="text-sm text-indigo-700">
                {campaign.required_metrics.join(', ')} • Min. {campaign.min_posts_required} post(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  Post #{index + 1}
                </CardTitle>
                {posts.length > 1 && (
                  <button
                    onClick={() => removePost(post.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Platform
                </label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.value}
                      onClick={() => updatePost(post.id, { platform: platform.value })}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200
                        ${post.platform === platform.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }
                      `}
                    >
                      <platform.icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Post URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <LinkIcon className="inline h-4 w-4 mr-1" />
                  Post URL
                </label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/p/..."
                  value={post.post_url}
                  onChange={(e) => updatePost(post.id, { post_url: e.target.value })}
                  error={errors[`post_${index}_url`]}
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Screenshot (for OCR)
                </label>

                {post.screenshotPreview ? (
                  <div className="relative">
                    <img
                      src={post.screenshotPreview}
                      alt="Screenshot preview"
                      className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-slate-50"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {post.isProcessing && (
                        <div className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full flex items-center gap-2">
                          <Spinner className="h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      )}
                      {post.ocrData && (
                        <div className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          OCR Done
                        </div>
                      )}
                      <button
                        onClick={() => updatePost(post.id, {
                          screenshot: null,
                          screenshotPreview: null,
                          metrics: { impressions: '', reach: '', views: '', clicks: '', likes: '', comments: '', shares: '', saves: '' },
                          ocrData: null,
                        })}
                        className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`
                    flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                    ${errors[`post_${index}_screenshot`]
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                    }
                  `}>
                    <Upload className="h-10 w-10 text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 font-medium">
                      Click to upload screenshot
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotUpload(post.id, file);
                      }}
                    />
                  </label>
                )}
                {errors[`post_${index}_screenshot`] && (
                  <p className="text-sm text-rose-500 mt-1">{errors[`post_${index}_screenshot`]}</p>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Caption (optional)
                </label>
                <Textarea
                  placeholder="Add post caption..."
                  value={post.caption}
                  onChange={(e) => updatePost(post.id, { caption: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Metrics */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Metrics
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {campaign.required_metrics.map((metric) => (
                    <div key={metric}>
                      <label className="block text-xs text-slate-500 mb-1 capitalize">
                        {metric}
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={post.metrics[metric] || ''}
                        onChange={(e) => updatePost(post.id, {
                          metrics: { ...post.metrics, [metric]: e.target.value }
                        })}
                        className="h-12"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Post Button */}
      {posts.length < 10 && (
        <button
          onClick={addPost}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Another Post
        </button>
      )}

      {/* Summary */}
      <Card gradient="violet">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(totals).map(([key, value]) => (
              campaign.required_metrics.includes(key as MetricType) && (
                <div key={key} className="text-center p-3 bg-white/50 rounded-xl">
                  <p className="text-2xl font-bold text-violet-700">
                    {value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(1)}K`
                      : value}
                  </p>
                  <p className="text-xs text-violet-600 capitalize">{key}</p>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      {errors.submit && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-sm text-rose-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pb-8">
        <Button
          variant="outline"
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit('submitted')}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Report
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
