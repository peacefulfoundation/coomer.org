import { MessageSquareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  amount: number;
  currency: string;
  opacity: number;
  user: {
    name: string;
    image: string | null;
  };
  visibleUntil: string;
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`/api/comments/${postId}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        setComments(data.comments);
      } catch (err) {
        setError('Could not load comments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [postId]);

  if (loading) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return null; // Silently fail for comments
  }

  if (comments.length === 0) {
    return null; // Don't show empty comment section
  }

  const formatTimeRemaining = (visibleUntil: string): string => {
    const remaining = new Date(visibleUntil).getTime() - Date.now();
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} left`;
    }
    if (days > 7) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} left`;
    }
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquareIcon className="h-4 w-4" />
        <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
      </div>
      
      {comments.map((comment) => (
        <Card
          key={comment.id}
          className="overflow-hidden transition-opacity"
          style={{ opacity: comment.opacity }}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback className="text-xs">
                  {comment.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">
                    {comment.user.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                    <span className="font-medium text-pink-500">
                      ${comment.amount}
                    </span>
                    <span>•</span>
                    <span>{formatTimeRemaining(comment.visibleUntil)}</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-foreground break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
