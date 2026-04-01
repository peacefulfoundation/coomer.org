import { CheckCircleIcon, SendIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PendingDonation {
  id: string;
  postId: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export function CompleteDonation() {
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPending() {
      try {
        const response = await fetch('/api/donate/pending', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in to view your pending donations');
            return;
          }
          throw new Error('Failed to fetch pending donations');
        }
        
        const data = await response.json();
        setPendingDonations(data.donations);
      } catch (err) {
        setError('Could not load pending donations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPending();
  }, []);

  const handleSubmit = async (donationId: string) => {
    const content = comments[donationId]?.trim();
    
    if (!content) {
      alert('Please enter a comment');
      return;
    }

    if (content.length > 500) {
      alert('Comment must be 500 characters or less');
      return;
    }

    setSubmitting(donationId);

    try {
      const response = await fetch('/api/comments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ donationId, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit comment');
      }

      setSubmitted(prev => new Set(prev).add(donationId));
      setPendingDonations(prev => prev.filter(d => d.id !== donationId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (pendingDonations.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">
            {submitted.size > 0
              ? 'Your comment has been submitted for approval!'
              : 'You have no pending donations to complete.'}
          </p>
          <a
            href="/"
            className="inline-block mt-4 text-sm text-primary underline underline-offset-4"
          >
            Back to memes
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Complete Your Donation</h1>
        <p className="text-muted-foreground">
          Leave a comment for your donation. It will appear after approval.
        </p>
      </div>

      {pendingDonations.map((donation) => (
        <Card key={donation.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Post: {donation.postId}</span>
              <span className="text-pink-500">${donation.amount}</span>
            </CardTitle>
            <CardDescription>
              Donated on {new Date(donation.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Comment
              </label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Leave a nice comment..."
                maxLength={500}
                value={comments[donation.id] || ''}
                onChange={(e) =>
                  setComments((prev) => ({
                    ...prev,
                    [donation.id]: e.target.value,
                  }))
                }
                disabled={submitting === donation.id}
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {(comments[donation.id] || '').length}/500
              </div>
            </div>

            <Button
              onClick={() => handleSubmit(donation.id)}
              disabled={submitting === donation.id || !comments[donation.id]?.trim()}
              className="w-full"
              showLock={false}
            >
              {submitting === donation.id ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <SendIcon className="mr-2 h-4 w-4" />
                  Submit Comment
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Comments are reviewed before appearing on posts
            </p>
          </CardContent>
        </Card>
      ))}

      <div className="text-center">
        <a
          href="/"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Skip for now
        </a>
      </div>
    </div>
  );
}
