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
  Loader2,
  X
} from './icons';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { value: 'tiktok', label: 'TikTok', icon: TiktokLogo },
  { value: 'youtube', label: 'YouTube', icon: YoutubeLogo },
  { value: 'twitter', label: 'X', icon: TwitterLogo },
  { value: 'facebook', label: 'Facebook', icon: FacebookLogo },
];

interface Post {
  id: string;
  platform: string;
  url: string;
  screenshotPreview: string | null;
  likes: string;
  comments: string;
  shares: string;
  views: string;
  reach: string;
  saves: string;
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
      screenshotPreview: null,
      likes: '',
      comments: '',
      shares: '',
      views: '',
      reach: '',
      saves: '',
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

  const handleScreenshot = (postId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatePost(postId, { screenshotPreview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !campaign) {
      setError('Nama, email, dan campaign wajib diisi');
      return;
    }
    if (posts.some(p => !p.url.trim())) {
      setError('Link post wajib diisi');
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
            metrics: {
              likes: p.likes,
              comments: p.comments,
              shares: p.shares,
              views: p.views,
              reach: p.reach,
              saves: p.saves,
            }
          }))
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Submit failed');
      }
    } catch {
      setError('Gagal submit. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
          <p className="text-gray-500 mb-6">Report kamu sudah diterima.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setPosts([createEmptyPost()]);
              setName('');
              setEmail('');
              setPhone('');
              setCampaign('');
            }}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl"
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
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">rectoverso.</h1>
              <p className="text-xs text-gray-500">Report Submission</p>
            </div>
          </div>
          <span className="text-sm text-gray-400">{today}</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

          {/* Campaign */}
          <div className="bg-indigo-600 px-6 py-4">
            <label className="block text-indigo-200 text-xs mb-1">Campaign</label>
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full h-12 px-4 bg-white/20 text-white font-medium rounded-lg border-0 cursor-pointer"
            >
              <option value="" className="text-gray-900">Pilih Campaign</option>
              <option value="FIFGO Download & Rating" className="text-gray-900">FIFGO Download & Rating</option>
              <option value="Summer Campaign 2024" className="text-gray-900">Summer Campaign 2024</option>
              <option value="Tech Product Launch" className="text-gray-900">Tech Product Launch</option>
            </select>
          </div>

          {/* Info */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Informasi Influencer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">No. HP</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm"
                  placeholder="0812xxxx"
                />
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Post & Metrics</h2>
              <span className="text-xs text-gray-400">{posts.length} post</span>
            </div>

            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={post.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">Post #{index + 1}</span>
                    </div>
                    {posts.length > 1 && (
                      <button
                        onClick={() => removePost(post.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Platform */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Platform</label>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => updatePost(post.id, { platform: p.value })}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm ${
                              post.platform === p.value
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 text-gray-600'
                            }`}
                          >
                            <p.icon className="w-4 h-4" />
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Link */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Link Post</label>
                      <input
                        type="url"
                        value={post.url}
                        onChange={(e) => updatePost(post.id, { url: e.target.value })}
                        className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm"
                        placeholder="https://instagram.com/p/..."
                      />
                    </div>

                    {/* Screenshot */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Screenshot</label>
                      {post.screenshotPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={post.screenshotPreview}
                            alt="Screenshot"
                            className="h-24 rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => updatePost(post.id, { screenshotPreview: null })}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400">
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Upload Screenshot</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleScreenshot(post.id, e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* Metrics */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Metrics</label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[
                          { key: 'likes', label: 'Likes' },
                          { key: 'comments', label: 'Comments' },
                          { key: 'shares', label: 'Shares' },
                          { key: 'views', label: 'Views' },
                          { key: 'reach', label: 'Reach' },
                          { key: 'saves', label: 'Saves' },
                        ].map((metric) => (
                          <div key={metric.key}>
                            <label className="block text-xs text-gray-400 mb-1 text-center">{metric.label}</label>
                            <input
                              type="number"
                              value={post[metric.key as keyof Post]}
                              onChange={(e) => updatePost(post.id, { [metric.key]: e.target.value })}
                              className="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm text-center"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {posts.length < 10 && (
              <button
                onClick={addPost}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600"
              >
                + Tambah Post
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-400">Screenshot diproses otomatis</p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/auth/login?role=client"
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Client Dashboard</h4>
              <p className="text-xs text-gray-500">Lihat & approve reports</p>
            </div>
          </Link>

          <Link
            href="/auth/login?role=superadmin"
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Superadmin</h4>
              <p className="text-xs text-gray-500">Manage campaigns</p>
            </div>
          </Link>

          <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-4 opacity-50">
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <Check className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Track Submission</h4>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        © 2024 Rectoverso Media
      </footer>
    </div>
  );
}
