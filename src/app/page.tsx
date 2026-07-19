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
  AlertCircle
} from './icons';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: InstagramLogo, color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500' },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo, color: 'hover:bg-gray-900' },
  { value: 'youtube', label: 'YouTube', icon: YoutubeLogo, color: 'hover:bg-red-600' },
  { value: 'twitter', label: 'X', icon: TwitterLogo, color: 'hover:bg-black' },
  { value: 'facebook', label: 'Facebook', icon: FacebookLogo, color: 'hover:bg-blue-600' },
];

const CAMPAIGNS = [
  { value: 'fifgo', label: 'FIFGO Download & Rating' },
  { value: 'summer2024', label: 'Summer Campaign 2024' },
  { value: 'tech_launch', label: 'Tech Product Launch' },
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
    if (!name || !email || !campaign) {
      setError('Mohon isi nama, email, dan pilih campaign');
      return;
    }

    if (posts.some(p => !p.url)) {
      setError('Mohon isi link post untuk setiap entries');
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-indigo-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Berhasil!</h2>
          <p className="text-slate-500 mb-6">Report kamu sudah diterima. Tim kami akan segera mereview.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setPosts([createEmptyPost()]);
              setName('');
              setEmail('');
              setCampaign('');
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            Submit Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">rectoverso.</h1>
              <p className="text-xs text-slate-500">Influencer Report</p>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {today} • {time}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

          {/* Campaign Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
            <label className="block text-xs font-medium text-indigo-200 mb-2">Campaign</label>
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full h-12 px-4 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium border-0 focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              <option value="" className="text-slate-900">Pilih Campaign</option>
              {CAMPAIGNS.map((c) => (
                <option key={c.value} value={c.value} className="text-slate-900">{c.label}</option>
              ))}
            </select>
          </div>

          {/* Contact Info */}
          <div className="px-6 py-6 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Informasi Influencer</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">No. HP</label>
                <input
                  type="tel"
                  placeholder="0812xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">Post & Metrics</h3>
              <span className="text-xs text-slate-400">{posts.length} post(s)</span>
            </div>

            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={post.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-900">Post #{index + 1}</span>
                    </div>
                    {posts.length > 1 && (
                      <button
                        onClick={() => removePost(post.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Left Column - Platform & URL */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Platform</label>
                        <div className="flex gap-2">
                          {PLATFORMS.map((p) => (
                            <button
                              key={p.value}
                              onClick={() => updatePost(post.id, { platform: p.value })}
                              className={`p-2.5 rounded-xl border-2 transition-all ${
                                post.platform === p.value
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              title={p.label}
                            >
                              <p.icon className={`w-5 h-5 ${
                                post.platform === p.value ? 'text-indigo-600' : 'text-slate-400'
                              }`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          <LinkIcon className="inline w-3.5 h-3.5 mr-1" />
                          Link Post
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/p/..."
                          value={post.url}
                          onChange={(e) => updatePost(post.id, { url: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    {/* Right Column - Screenshot & Metrics */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          <Upload className="inline w-3.5 h-3.5 mr-1" />
                          Screenshot
                        </label>
                        {post.screenshotPreview ? (
                          <div className="relative">
                            <img
                              src={post.screenshotPreview}
                              alt="Screenshot"
                              className="w-full h-20 object-cover rounded-xl border border-slate-200"
                            />
                            <button
                              onClick={() => updatePost(post.id, { screenshot: null, screenshotPreview: null })}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow transition"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
                            <Upload className="w-6 h-6 text-slate-400 mb-1" />
                            <p className="text-xs text-slate-500">Upload</p>
                            <p className="text-xs text-slate-400">PNG, JPG</p>
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
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Metrics</label>
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
                              className="h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs text-center capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                              className="h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs text-center capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
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
                className="w-full mt-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 flex items-center justify-center gap-2 transition text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Post
              </button>
            )}
          </div>

          {/* Submit Footer */}
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              * Screenshot akan diproses otomatis untuk ekstraksi metrics
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
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

        {/* Dashboard Access */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 text-center mb-4">Akses Dashboard</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/auth/login?role=client"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Client Dashboard</h4>
                <p className="text-xs text-slate-500">Lihat & approve reports</p>
              </div>
            </Link>

            <Link
              href="/auth/login?role=superadmin"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center group-hover:scale-105 transition">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Superadmin</h4>
                <p className="text-xs text-slate-500">Manage campaigns & users</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 opacity-60">
              <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Track Submission</h4>
                <p className="text-xs text-slate-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-400">
        © 2024 Rectoverso Media. All rights reserved.
      </footer>
    </div>
  );
}
