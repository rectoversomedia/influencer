'use client';

import { useState } from 'react';
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
  Loader2
} from './icons';

const PLATFORMS = [
  { value: 'instagram', label: 'IG', icon: InstagramLogo },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo },
  { value: 'youtube', label: 'YT', icon: YoutubeLogo },
  { value: 'twitter', label: 'X', icon: TwitterLogo },
  { value: 'facebook', label: 'FB', icon: FacebookLogo },
];

const CAMPAIGNS = [
  { value: 'FIFGO Download & Rating', label: 'FIFGO Download & Rating' },
  { value: 'Summer Campaign 2024', label: 'Summer Campaign 2024' },
  { value: 'Tech Product Launch', label: 'Tech Product Launch' },
];

interface Post {
  id: string;
  platform: string;
  url: string;
  screenshot: File | null;
  screenshotPreview: string | null;
  metrics: {
    impressions: string;
    reach: string;
    views: string;
    likes: string;
    comments: string;
    shares: string;
    saves: string;
  };
}

export default function Home() {
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const [campaign, setCampaign] = useState('');
  const [posts, setPosts] = useState<Post[]>([createEmptyPost()]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function createEmptyPost(): Post {
    return {
      id: crypto.randomUUID(),
      platform: 'instagram',
      url: '',
      screenshot: null,
      screenshotPreview: null,
      metrics: {
        impressions: '',
        reach: '',
        views: '',
        likes: '',
        comments: '',
        shares: '',
        saves: ''
      },
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
      updatePost(postId, { screenshot: file, screenshotPreview: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !campaign) {
      setError('Nama, email, dan campaign harus diisi');
      return;
    }

    const postsWithoutUrls = posts.filter(p => !p.url.trim());
    if (postsWithoutUrls.length > 0) {
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
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
          <p className="text-gray-500 mb-6">Report kamu sudah diterima. Tim kami akan mereview secepatnya.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setPosts([createEmptyPost()]);
              setName('');
              setEmail('');
              setPhone('');
              setCampaign('');
            }}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            Submit Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">rectoverso.</h1>
              <p className="text-xs text-gray-500">Influencer Report</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">{today} • {time}</div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

          {/* Campaign Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
            <label className="block text-xs font-medium text-indigo-200 mb-2">Campaign</label>
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full h-12 px-4 bg-white/20 backdrop-blur rounded-xl text-white font-medium border-0 focus:ring-2 focus:ring-white/50 cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
            >
              <option value="" className="text-gray-900">Pilih Campaign</option>
              {CAMPAIGNS.map((c) => (
                <option key={c.value} value={c.value} className="text-gray-900">{c.label}</option>
              ))}
            </select>
          </div>

          {/* Contact Info */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Influencer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">No. HP</label>
                <input
                  type="tel"
                  placeholder="0812xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Post & Metrics</h3>
              <span className="text-xs text-gray-400">{posts.length} post(s)</span>
            </div>

            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={post.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">Post #{index + 1}</span>
                    </div>
                    {posts.length > 1 && (
                      <button
                        onClick={() => removePost(post.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left - Platform & URL */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Platform</label>
                        <div className="flex gap-2">
                          {PLATFORMS.map((p) => (
                            <button
                              key={p.value}
                              onClick={() => updatePost(post.id, { platform: p.value })}
                              className={`p-2.5 rounded-xl border-2 transition-all ${
                                post.platform === p.value
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              title={p.label}
                            >
                              <p.icon className={`w-5 h-5 ${
                                post.platform === p.value ? 'text-indigo-600' : 'text-gray-400'
                              }`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          <LinkIcon className="inline w-3 h-3 mr-1" />
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

                    {/* Right - Screenshot & Metrics */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          <Upload className="inline w-3 h-3 mr-1" />
                          Screenshot
                        </label>
                        {post.screenshotPreview ? (
                          <div className="relative">
                            <img
                              src={post.screenshotPreview}
                              alt="Screenshot"
                              className="w-full h-20 object-cover rounded-xl border border-gray-200"
                            />
                            <button
                              onClick={() => updatePost(post.id, { screenshot: null, screenshotPreview: null })}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow transition"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500">Upload</p>
                            <p className="text-xs text-gray-400">PNG, JPG</p>
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

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Metrics</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['impressions', 'reach', 'views', 'likes'].map((key) => (
                            <input
                              key={key}
                              type="number"
                              placeholder={key}
                              value={post.metrics[key as keyof typeof post.metrics]}
                              onChange={(e) => updatePost(post.id, {
                                metrics: { ...post.metrics, [key]: e.target.value }
                              })}
                              className="h-9 px-2 bg-white border border-gray-200 rounded-lg text-xs text-center capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {['comments', 'shares', 'saves'].map((key) => (
                            <input
                              key={key}
                              type="number"
                              placeholder={key}
                              value={post.metrics[key as keyof typeof post.metrics]}
                              onChange={(e) => updatePost(post.id, {
                                metrics: { ...post.metrics, [key]: e.target.value }
                              })}
                              className="h-9 px-2 bg-white border border-gray-200 rounded-lg text-xs text-center capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Post */}
            {posts.length < 10 && (
              <button
                onClick={addPost}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 flex items-center justify-center gap-2 transition text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Post
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-400">* Screenshot diproses otomatis untuk ekstraksi metrics</p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Submit Report
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Links */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 text-center mb-4">Akses Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/auth/login?role=client"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Client Dashboard</h4>
                <p className="text-xs text-gray-500">Lihat & approve reports</p>
              </div>
            </Link>

            <Link
              href="/auth/login?role=superadmin"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center group-hover:scale-105 transition">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Superadmin</h4>
                <p className="text-xs text-gray-500">Manage campaigns & users</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 opacity-60">
              <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Track Submission</h4>
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
