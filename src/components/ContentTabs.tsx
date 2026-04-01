import { LockIcon, ImageIcon, VideoIcon } from 'lucide-react';
import { useState } from 'react';
import { PostList } from '@/components/PostList';
import { VideoList } from '@/components/VideoList';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

interface ContentTabsProps {
  isLoggedIn: boolean;
  isKofiMember: boolean;
  workerUrl: string;
  kofiUsername?: string;
}

type TabType = 'images' | 'videos';

export function ContentTabs({ isLoggedIn, isKofiMember, workerUrl, kofiUsername = 'coomerorg' }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('images');

  const handleVideoTabClick = async () => {
    if (!isLoggedIn) {
      await authClient.signIn.social({
        provider: 'discord',
        callbackURL: window.location.href,
      });
      return;
    }
    
    if (!isKofiMember) {
      return;
    }
    
    setActiveTab('videos');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">begin the scrooooooling!!!</h1>
      
      <div className="flex flex-grow space-x-3">
        <Button
          variant={activeTab === 'images' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('images')}
          showLock={false}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          memes
        </Button>
        
        <Button
          variant={activeTab === 'videos' ? 'default' : 'secondary'}
          onClick={handleVideoTabClick}
          disabled={isLoggedIn && !isKofiMember}
          showLock={!isLoggedIn || !isKofiMember}
        >
          <VideoIcon className="mr-2 h-4 w-4" />
          video memes
          {!isLoggedIn && (
            <span className="ml-1 text-xs">(login)</span>
          )}
          {isLoggedIn && !isKofiMember && (
            <span className="ml-1 text-xs">(ko-fi)</span>
          )}
        </Button>
      </div>

      {activeTab === 'images' && (
        <PostList workerUrl={workerUrl} isLoggedIn={isLoggedIn} kofiUsername={kofiUsername} />
      )}
      
      {activeTab === 'videos' && isLoggedIn && isKofiMember && (
        <VideoList />
      )}
      
      {activeTab === 'videos' && isLoggedIn && !isKofiMember && (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <LockIcon className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Ko-fi Members Only</h2>
          <p className="max-w-md text-muted-foreground">
            Video memes are exclusive to our monthly Ko-fi supporters. 
            Join our Ko-fi to unlock access to all video content!
          </p>
          <a
            href="https://ko-fi.com/coomerorg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border-[1.5px] border-black bg-black px-6 py-2.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white hover:text-black"
          >
            Support on Ko-fi
          </a>
          <p className="text-sm text-muted-foreground">
            Already a member?{' '}
            <a href="/profile" className="underline hover:text-foreground">
              Refresh your status
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
