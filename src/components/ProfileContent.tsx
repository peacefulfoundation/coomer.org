import { RefreshCwIcon, CheckCircleIcon, XCircleIcon, LogOutIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth-client';

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    discordId: string | null;
    discordUsername: string | null;
    isKofiMember: boolean;
    lastRoleCheck: string | null;
  };
}

export function ProfileContent({ user }: ProfileContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isKofiMember, setIsKofiMember] = useState(user.isKofiMember);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    setRefreshError(null);

    try {
      const response = await fetch('/api/subscription/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setRefreshError(data.error || 'Failed to refresh');
        return;
      }

      setIsKofiMember(data.isKofiMember);
      setRefreshMessage(data.message);
    } catch (error) {
      setRefreshError('An error occurred. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  const formatLastCheck = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>
            {user.discordUsername && (
              <span className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 127.14 96.36"
                  className="h-4 w-4"
                >
                  <path
                    fill="#5865f2"
                    d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                  />
                </svg>
                {user.discordUsername}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ko-fi Membership</span>
              {isKofiMember ? (
                <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <CheckCircleIcon className="h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  <XCircleIcon className="h-4 w-4" />
                  Inactive
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Last checked: {formatLastCheck(user.lastRoleCheck)}
            </p>
          </div>

          {refreshMessage && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {refreshMessage}
            </div>
          )}

          {refreshError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {refreshError}
            </div>
          )}

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full"
            variant="secondary"
            showLock={false}
          >
            {isRefreshing ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Refresh Subscription Status
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You can refresh your status once per hour. Make sure you have the Ko-fi member role in our Discord server.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          {user.discordId && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discord ID</span>
              <span className="font-mono text-xs">{user.discordId}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!isKofiMember && (
        <Card className="border-[#c9fd8b] bg-[#c9fd8b]/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold">Unlock Video Memes!</h3>
              <p className="text-sm text-muted-foreground">
                Support us on Ko-fi to get access to exclusive video memes.
              </p>
              <a
                href="https://ko-fi.com/coomerorg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border-[1.5px] border-black bg-black px-6 py-2.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white hover:text-black"
              >
                Support on Ko-fi
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSignOut}
        variant="outline"
        className="w-full"
        showLock={false}
      >
        <LogOutIcon className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
