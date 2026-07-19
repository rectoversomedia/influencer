'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Upload,
  Link as LinkIcon,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  TwitterLogo,
  FacebookLogo,
  Plus,
  Trash,
  Megaphone,
  Briefcase,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  X
} from './icons';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo },
  { value: 'youtube', label: 'YouTube', icon: YoutubeLogo },
  { value: 'twitter', label: 'X / Twitter', icon: TwitterLogo },
  { value: 'facebook', label: 'Facebook', icon: FacebookLogo },
];

const METRICS = ['impressions', 'reach', 'views', 'likes', 'comments', 'shares', 'saves'];

interface Post {
  id: string;
  platform: string;
  url: string;
  screenshot: File | null;
  screenshotPreview: string | null;
  metrics: Record<string, string>;
}

export default function Home() {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const time = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const [campaign, setCampaign] = useState('');
  const [campaigns, setCampaigns] = useState<{id: string, name: string}[]>([]);
  const [posts, setPosts] = useState<Post[]>([createEmptyPost()]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Load campaigns from API
  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCampaigns(data.map((c: any) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {
        // Use default campaigns
        setCampaigns([
          { id: 'fifgo', name: 'FIFGO Download & Rating' },
          { id: 'summer', name: 'Summer Campaign 2024' },
          { id: 'tech', name: 'Tech Product Launch' },
        ]);
      });
  }, []);

  function createEmptyPost(): Post {
    const metrics: Record<string, string> = {};
    METRICS.forEach(m => metrics[m] = '');
    return {
      id: crypto.randomUUID(),
      platform: 'instagram',
      url: '',
      screenshot: null,
      screenshotPreview: null,
      metrics,
    };
  }

  const addPost = () => {
    if (posts.length < 10) {
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

  const handleScreenshot = (postId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updatePost(postId, {
        screenshot: file,
        screenshotPreview: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      setError('Nama lengkap harus diisi');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Email valid harus diisi');
      return;
    }
    if (!campaign) {
      setError('Pilih campaign terlebih dahulu');
      return;
    }
    if (posts.some(p => !p.url.trim())) {
      setError('Link post harus diisi untuk semua entries');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/public-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_code: campaign,
          influencer_name: name,
          influencer_email: email,
          influencer_phone: phone,
          posts: posts.map(p => ({
            platform: p.platform,
            url: p.url,
            metrics: p.metrics
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setPosts([createEmptyPost()]);
    setName('');
    setEmail('');
    setPhone('');
    setCampaign('');
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center border border-gray-100">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Berhasil!</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Report kamu sudah diterima dan akan direview oleh tim kami.
          </p>
          <button
            onClick={resetForm}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all text-lg"
          >
            Submit Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">rectoverso.</h1>
                <p className="text-xs text-gray-500">Report Submission</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {today} • {time}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">

          {/* Campaign Selection */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
            <label className="block text-xs font-medium text-indigo-200 mb-2">
              Campaign
            </label>
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full h-12 px-4 pr-10 bg-white/20 backdrop-blur text-white font-medium rounded-xl border-0 focus:ring-2 focus:ring-white/50 cursor-pointer appearance-none"
            >
              <option value="" className="text-gray-900">Pilih Campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.name} className="text-gray-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Information */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Informasi Influencer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Email</label>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">No. HP (opsional)</label>
                <input
                  type="tel"
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Post & Metrics</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {posts.length} post{posts.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Post Cards */}
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-900">Post #{index + 1}</span>
                    </div>
                    {posts.length > 1 && (
                      <button
                        onClick={() => removePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-5 space-y-5">
                    {/* Platform & URL Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Platform</label>
                        <div className="flex flex-wrap gap-2">
                          {PLATFORMS.map((p) => (
                            <button
                              key={p.value}
                              onClick={() => updatePost(post.id, { platform: p.value })}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                                post.platform === p.value
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
                              }`}
                            >
                              <p.icon className="w-4 h-4" />
                              <span className="text-xs font-medium">{p.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Link Post
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/p/..."
                          value={post.url}
                          onChange={(e) => updatePost(post.id, { url: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Screenshot & Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          Screenshot (untuk OCR)
                        </label>
                        {post.screenshotPreview ? (
                          <div className="relative">
                            <img
                              src={post.screenshotPreview}
                              alt="Screenshot"
                              className="w-full h-24 object-cover rounded-xl border border-gray-200"
                            />
                            <button
                              onClick={() => updatePost(post.id, { screenshot: null, screenshotPreview: null })}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
                            <Upload className="w-8 h-8 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500">Klik untuk upload</p>
                            <p className="text-xs text-gray-400">PNG, JPG (max 10MB)</p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleScreenshot(post.id, file);
                              }}
                            />
                          </label>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Metrics</label>
                        <div className="grid grid-cols-4 gap-2">
                          {METRICS.map((metric) => (
                            <div key={metric} className="relative">
                              <input
                                type="number"
                                placeholder={metric}
                                value={post.metrics[metric]}
                                onChange={(e) => updatePost(post.id, {
                                  metrics: { ...post.metrics, [metric]: e.target.value }
                                })}
                                className="w-full h-9 px-2 bg-white border border-gray-200 rounded-lg text-xs text-center capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <span className="absolute -top-1 left-1 text-[8px] text-gray-400 capitalize">
                                {metric.substring(0, 3)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Post Button */}
            {posts.length < 10 && (
              <button
                onClick={addPost}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 flex items-center justify-center gap-2 transition text-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                Tambah Post
              </button>
            )}
          </div>

          {/* Submit Footer */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              * Screenshot akan diproses otomatis untuk ekstraksi metrics
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Submit Report
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Access Cards */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 text-center mb-4">Akses Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/auth/login?role=client"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Client Dashboard</h4>
                <p className="text-xs text-gray-500">Lihat & approve reports</p>
              </div>
            </Link>

            <Link
              href="/auth/login?role=superadmin"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center group-hover:scale-105 transition">
                <Shield className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Superadmin</h4>
                <p className="text-xs text-gray-500">Manage campaigns & users</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Track Submission</h4>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        © 2024 Rectoverso Media. All rights reserved.
      </footer>
    </div>
  );
}
