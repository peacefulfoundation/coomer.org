import { HeartIcon, LockIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

interface DonateButtonProps {
  postId: string;
  isLoggedIn: boolean;
  kofiUsername: string;
}

export function DonateButton({ postId, isLoggedIn, kofiUsername }: DonateButtonProps) {
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

  const handleDonate = async () => {
    if (!isLoggedIn) {
      // Redirect to Discord login first
      await authClient.signIn.social({
        provider: 'discord',
        callbackURL: window.location.href,
      });
      return;
    }

    setIsCreatingIntent(true);

    try {
      // Create donation intent
      const response = await fetch('/api/donate/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to start donation');
        return;
      }

      const { intentId } = await response.json();

      // Store intent ID in localStorage for later retrieval
      localStorage.setItem('pendingDonationIntent', JSON.stringify({
        intentId,
        postId,
        timestamp: Date.now(),
      }));

      // Open Ko-fi in new tab
      window.open(`https://ko-fi.com/${kofiUsername}`, '_blank');

      // Show instructions
      alert(
        'A new tab has opened with Ko-fi. After completing your donation, ' +
        'return here and click "Complete Donation" to leave your comment!'
      );
    } catch (error) {
      console.error('Error creating donation intent:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleDonate}
      disabled={isCreatingIntent}
      showLock={!isLoggedIn}
      className="gap-1"
    >
      <HeartIcon className="h-4 w-4 text-pink-500" />
      {isCreatingIntent ? 'Starting...' : 'Donate & Comment'}
      {!isLoggedIn && <span className="text-xs ml-1">(login)</span>}
    </Button>
  );
}
