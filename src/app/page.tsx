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
  Shield
} from './icons';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo },
  { value: 'youtube', label: 'YouTube', icon: YoutubeLogo },
  { value: 'twitter', label: 'X / Twitter', icon: TwitterLogo },
  { value: 'facebook', label: 'Facebook', icon: FacebookLogo },
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
  const today = new Date().toLocaleDateString('id-ID');
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
      setError('Mohon isi semua field yang diperlukan');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
          <p className="text-slate-500 mb-6">Terima kasih! Report kamu akan segera diproses oleh tim kami.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setPosts([createEmptyPost()]);
              setName('');
              setEmail('');
              setCampaign('');
            }}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            Submit Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">rectoverso.</h1>
              <p className="text-xs text-slate-500">Report Submission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
          {error && (
            <div className="m-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}

          {/* Date, Time, Campaign */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-indigo-200 mb-1">Tanggal</label>
                <div className="h-11 px-4 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium flex items-center">
                  {today}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-indigo-200 mb-1">Waktu</label>
                <div className="h-11 px-4 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium flex items-center">
                  {time}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-indigo-200 mb-1">Campaign</label>
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full h-11 px-4 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium [&option]:text-slate-900 border-0 focus:ring-2 focus:ring-white/50"
                >
                  <option value="" className="text-slate-900">Pilih Campaign</option>
                  {CAMPAIGNS.map((c) => (
                    <option key={c.value} value={c.value} className="text-slate-900">{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Informasi Kontak</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">No. HP</label>
                <input
                  type="tel"
                  placeholder="08XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Post & Metrics</h3>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-slate-900">Post #{index + 1}</h4>
                    </div>
                    {posts.length > 1 && (
                      <button
                        onClick={() => removePost(post.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Platform & URL */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Platform</label>
                        <div className="flex gap-2">
                          {PLATFORMS.map((p) => (
                            <button
                              key={p.value}
                              onClick={() => updatePost(post.id, { platform: p.value })}
                              className={`p-3 rounded-xl border-2 transition-all ${post.platform === p.value
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-slate-300'}`}
                            >
                              <p.icon className={`h-5 w-5 ${post.platform === p.value ? 'text-indigo-600' : 'text-slate-400'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          <LinkIcon className="inline h-3.5 w-3.5 mr-1" />
                          Link Post
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/p/..."
                          value={post.url}
                          onChange={(e) => updatePost(post.id, { url: e.target.value })}
                          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Screenshot & Metrics */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          <Upload className="inline h-3.5 w-3.5 mr-1" />
                          Screenshot (untuk OCR)
                        </label>
                        {post.screenshotPreview ? (
                          <div className="relative">
                            <img
                              src={post.screenshotPreview}
                              alt="Screenshot"
                              className="w-full h-24 object-cover rounded-xl border border-slate-200"
                            />
                            <button
                              onClick={() => updatePost(post.id, { screenshot: null, screenshotPreview: null })}
                              className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                            <Upload className="h-6 w-6 text-slate-400 mb-2" />
                            <p className="text-xs text-slate-500">Upload Screenshot</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
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
                            <div key={key}>
                              <input
                                type="number"
                                placeholder={key}
                                value={post.metrics[key as keyof typeof post.metrics]}
                                onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, [key]: e.target.value } })}
                                className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          ))}
                          {['comments', 'shares', 'saves'].map((key) => (
                            <div key={key} className="col-span-2">
                              <input
                                type="number"
                                placeholder={key}
                                value={post.metrics[key as keyof typeof post.metrics]}
                                onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, [key]: e.target.value } })}
                                className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
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
                className="w-full mt-4 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="h-5 w-5" />
                Tambah Post
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              * Screenshot akan diproses secara otomatis untuk ekstraksi metrics
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengirim...
                </>
              ) : (
                <>
                  Submit Report
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Links */}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200/60">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 text-center">Akses Dashboard</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/auth/login?role=client"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Client Dashboard</h4>
                <p className="text-xs text-slate-500">Lihat & approve reports</p>
              </div>
            </Link>

            <Link
              href="/auth/login?role=superadmin"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Superadmin</h4>
                <p className="text-xs text-slate-500">Manage campaigns & users</p>
              </div>
            </Link>

            <a
              href="#"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all opacity-50 cursor-not-allowed"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Influencer</h4>
                <p className="text-xs text-slate-500">Track submissions</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-slate-400">
        © 2024 Rectoverso Media. All rights reserved.
      </div>
    </div>
  );
}
