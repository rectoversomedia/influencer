'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, Link as LinkIcon, InstagramLogo, TiktokLogo, YoutubeLogo, TwitterLogo, FacebookLogo, Plus, Trash } from '@/app/icons';

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
  screenshot: File | null;
  screenshotPreview: string | null;
  metrics: { impressions: string; reach: string; views: string; likes: string; comments: string; shares: string; };
}

export default function InfluencerPortal() {
  const today = new Date().toLocaleDateString('id-ID');
  const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const [campaign, setCampaign] = useState('');
  const [posts, setPosts] = useState<Post[]>([createEmptyPost()]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
      metrics: { impressions: '', reach: '', views: '', likes: '', comments: '', shares: '' },
    };
  }

  const addPost = () => {
    if (posts.length < 5) setPosts([...posts, createEmptyPost()]);
  };

  const removePost = (id: string) => {
    if (posts.length > 1) setPosts(posts.filter(p => p.id !== id));
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
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
          <p className="text-slate-500 mb-6">Terima kasih. Report kamu akan segera diproses.</p>
          <button
            onClick={() => { setSubmitted(false); setPosts([createEmptyPost()]); setName(''); setEmail(''); setCampaign(''); }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
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
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">rectoverso.</h1>
            <p className="text-xs text-slate-500">Submit Report</p>
          </div>
          <Link href="/client" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Lihat Dashboard →
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Date, Time, Campaign */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
              <input type="text" value={today} readOnly className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Waktu</label>
              <input type="text" value={time} readOnly className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Campaign</label>
              <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Pilih Campaign</option>
                <option value="1">Campaign A</option>
                <option value="2">Campaign B</option>
                <option value="3">Campaign C</option>
              </select>
            </div>
          </div>

          {/* Device Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-500">Device Info (Auto-captured)</p>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={post.id} className="border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Post #{index + 1}</h3>
                  {posts.length > 1 && (
                    <button onClick={() => removePost(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Platform & URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {PLATFORMS.map((p) => (
                        <button key={p.value} onClick={() => updatePost(post.id, { platform: p.value })}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm transition ${post.platform === p.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                          <p.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">Link Post</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="url" placeholder="https://..." value={post.url} onChange={(e) => updatePost(post.id, { url: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>

                  {/* Screenshot & Metrics */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Screenshot</label>
                    {post.screenshotPreview ? (
                      <div className="relative mb-4">
                        <img src={post.screenshotPreview} alt="Screenshot" className="w-full h-24 object-cover rounded-xl border" />
                        <button onClick={() => updatePost(post.id, { screenshot: null, screenshotPreview: null })}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 mb-4">
                        <Upload className="h-6 w-6 text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">Upload Screenshot</p>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleScreenshot(post.id, file);
                        }} />
                      </label>
                    )}

                    <label className="block text-sm font-medium text-slate-700 mb-2">Metrics</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.keys(post.metrics).map((key) => (
                        <input key={key} type="number" placeholder={key} value={post.metrics[key as keyof typeof post.metrics]}
                          onChange={(e) => updatePost(post.id, { metrics: { ...post.metrics, [key]: e.target.value } })}
                          className="h-10 px-3 border border-slate-200 rounded-lg text-sm capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Post */}
          {posts.length < 5 && (
            <button onClick={addPost} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 mt-4">
              <Plus className="h-5 w-5" />
              Tambah Post
            </button>
          )}

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
              <input type="text" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
