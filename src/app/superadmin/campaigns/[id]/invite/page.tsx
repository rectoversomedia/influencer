'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Envelope, Copy, Check, Spinner } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // We need to get the campaign ID from params
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Handle params
  useState(() => {
    params.then(p => setCampaignId(p.id));
  });

  const inviteLink = campaignId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/influencer/accept/${campaignId}`
    : '';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setSuccess(`Invite sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!campaignId) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/superadmin/campaigns/${campaignId}`}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invite Influencers</h1>
          <p className="text-slate-500 mt-1">Send invites to influencers for this campaign</p>
        </div>
      </div>

      {/* Email Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Envelope className="h-5 w-5 text-indigo-600" />
            Send Email Invite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <Input
              type="email"
              label="Influencer Email"
              placeholder="influencer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            )}

            <Button type="submit" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Spinner className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Envelope className="h-5 w-5" weight="bold" />
                  Send Invite
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Copy Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-indigo-600" />
            Share Invite Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Share this link with influencers to let them join the campaign
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600"
            />
            <Button onClick={copyLink} variant="outline">
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
