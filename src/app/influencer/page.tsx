'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, InstagramLogo, TiktokLogo, YoutubeLogo, TwitterLogo, FacebookLogo, Plus, Trash, Check } from '@/app/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo },
  { value: 'youtube', label: 'YouTube', icon: YoutubeLogo },
  { value: 'twitter', label: 'X / Twitter', icon: TwitterLogo },
  { value: 'facebook', label: 'Facebook', icon: FacebookLogo },
];

interface Post {
  id: string;
  platform: string;
  url: string;
  caption: string;
  screenshot: File | null;
  screenshotPreview: string | null;
  metrics: {
    impressions: string;
    reach: string;
    views: string;
    likes: string;
    comments: string;
  };
}

export default function InfluencerPortal() {
  const [posts, setPosts] = useState<Post[]>([createEmptyPost()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function createEmptyPost(): Post {
    return {
      id: crypto.randomUUID(),
      platform: 'instagram',
      url: '',
      caption: '',
      screenshot: null,
      screenshotPreview: null,
      metrics: {
        impressions: '',
        reach: '',
        views: '',
        likes: '',
        comments: '',
      },
    };
  }

  const addPost = () => {
    if (posts.length < 5) {
      setPosts([...posts, createEmptyPost()]);
    }
  };

  const removePost = (id: string) => {
    if (posts.length > 1) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleScreenshotUpload = (postId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updatePost(postId, {
        screenshot: file,
        screenshotPreview: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      setError('Please fill in your name and email');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate submission (in real app, would send to API)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
          <p className="text-slate-500 mb-6">Thank you for submitting your report. We will review it shortly.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setPosts([createEmptyPost()]);
              setName('');
              setEmail('');
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Submit Report</h1>
          <p className="text-slate-500">Upload your social media performance report</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
          <p className="text-sm text-indigo-700">
            <strong>Supported metrics:</strong> Impressions, Reach, Views, Likes, Comments
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Post #{index + 1}</h3>
                {posts.length > 1 && (
                  <button
                    onClick={() => removePost(post.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                  <div className="flex gap-2 flex-wrap">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => updatePost(post.id, { platform: p.value })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                          post.platform === p.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <p.icon className="h-5 w-5" />
                        <span className="text-sm">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <LinkIcon className="inline h-4 w-4 mr-1" />
                    Post URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    value={post.url}
                    onChange={(e) => updatePost(post.id, { url: e.target.value })}
                    className="h-12"
                  />
                </div>

                {/* Screenshot */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Screenshot
                  </label>
                  {post.screenshotPreview ? (
                    <div className="relative">
                      <img src={post.screenshotPreview} alt="Screenshot" className="w-full max-h-48 object-contain rounded-xl border" />
                      <button
                        onClick={() => updatePost(post.id, { screenshot: null, screenshotPreview: null })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400">
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Click to upload screenshot</p>
                      <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotUpload(post.id, file);
                      }} />
                    </label>
                  )}
                </div>

                {/* Metrics */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Metrics</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Impressions"
                        value={post.metrics.impressions}
                        onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, impressions: e.target.value } })}
                        className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Reach"
                        value={post.metrics.reach}
                        onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, reach: e.target.value } })}
                        className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Views"
                        value={post.metrics.views}
                        onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, views: e.target.value } })}
                        className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Likes"
                        value={post.metrics.likes}
                        onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, likes: e.target.value } })}
                        className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Comments"
                        value={post.metrics.comments}
                        onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, comments: e.target.value } })}
                        className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Post Button */}
        {posts.length < 5 && (
          <button
            onClick={addPost}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="h-5 w-5" />
            Add Another Post
          </button>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-8 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Your Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 text-base"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
