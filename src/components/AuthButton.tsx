import { LogInIcon, LogOutIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth-client';

interface AuthButtonProps {
  isLoggedIn: boolean;
  user?: {
    name: string;
    image?: string | null;
    discordUsername?: string | null;
  } | null;
}

export function AuthButton({ isLoggedIn, user }: AuthButtonProps) {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'discord',
      callbackURL: window.location.href,
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  if (!isLoggedIn) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={handleSignIn}
        showLock={false}
      >
        <LogInIcon className="mr-2 h-4 w-4" />
        Login with Discord
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <a href="/profile" className="flex items-center space-x-2 hover:opacity-80">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.image || undefined} alt={user?.name} />
          <AvatarFallback>
            <UserIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium md:inline">
          {user?.discordUsername || user?.name}
        </span>
      </a>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        className="h-8 w-8"
        showLock={false}
      >
        <LogOutIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
