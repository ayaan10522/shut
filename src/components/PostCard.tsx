import { useState, useEffect } from 'react';
import { Heart, Bookmark, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { likePost, unlikePost, savePost, unsavePost, hasLikedPost, hasSavedPost } from '@/lib/firebase';
import type { Post, PostCategory } from '@/types';

interface PostCardProps {
  post: Post;
}

const categoryLabels: Record<PostCategory, string> = {
  notice: 'Notice',
  exam: 'Exam',
  event: 'Event',
  holiday: 'Holiday',
  emergency: 'Emergency',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user, post.id]);

  const checkStatus = async () => {
    if (!user) return;
    const [liked, saved] = await Promise.all([
      hasLikedPost(user.id, post.id),
      hasSavedPost(user.id, post.id),
    ]);
    setIsLiked(liked);
    setIsSaved(saved);
  };

  const handleLike = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isLiked) {
        await unlikePost(user.id, post.id);
        setIsLiked(false);
        setLikes(prev => Math.max(prev - 1, 0));
      } else {
        await likePost(user.id, post.id);
        setIsLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isSaved) {
        await unsavePost(user.id, post.id);
        setIsSaved(false);
      } else {
        await savePost(user.id, post.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmergency = post.category === 'emergency';

  return (
    <Card variant={isEmergency ? 'emergency' : 'post'} className="animate-fade-up">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarImage src={post.schoolPhotoUrl} alt={post.schoolName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {post.schoolName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{post.schoolName}</h3>
              <Badge variant="school" className="text-[10px]">School</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
          <Badge variant={post.category} className="shrink-0">
            {isEmergency && <AlertTriangle className="h-3 w-3 mr-1" />}
            {categoryLabels[post.category]}
          </Badge>
        </div>

        {/* Content */}
        <p className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Image URL Display */}
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border bg-muted/30">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-full h-auto max-h-[400px] object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Link */}
        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm text-secondary-foreground group-hover:text-primary truncate">
              {post.linkTitle || post.linkUrl}
            </span>
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!user}
            className={isLiked ? 'text-holiday' : 'text-muted-foreground hover:text-holiday'}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!user}
            className={isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
