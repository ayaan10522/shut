import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { PostCard } from '@/components/PostCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getAllPosts, getPostsForUser, type PostData } from '@/lib/firebase';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import type { Post, PostCategory } from '@/types';

const categories: { value: PostCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'notice', label: 'Notice' },
  { value: 'exam', label: 'Exam' },
  { value: 'event', label: 'Event' },
  { value: 'holiday', label: 'Holiday' },
];

export default function Feed() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      let postsData: PostData[];
      
      if (user && user.userType === 'user') {
        // Regular users see posts from followed schools
        postsData = await getPostsForUser(user.id);
      } else if (user && user.userType === 'school') {
        // Schools see all posts (including their own)
        postsData = await getAllPosts();
      } else {
        // Not logged in - show all posts
        postsData = await getAllPosts();
      }

      const formattedPosts: Post[] = postsData.map(post => ({
        id: post.id,
        schoolId: post.schoolId,
        schoolName: post.schoolName,
        schoolPhotoUrl: post.schoolPhotoUrl,
        content: post.content,
        category: post.category,
        imageUrl: post.imageUrl,
        linkUrl: post.linkUrl,
        linkTitle: post.linkTitle,
        createdAt: new Date(post.createdAt),
        likes: post.likes,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Feed</h1>
          <p className="text-muted-foreground text-sm">
            {user?.userType === 'user' 
              ? 'Updates from schools you follow'
              : user?.userType === 'school'
              ? 'All posts on the platform'
              : 'Latest updates from schools'
            }
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className="shrink-0"
            >
              <Badge
                variant={
                  selectedCategory === category.value
                    ? category.value === 'all'
                      ? 'default'
                      : (category.value as PostCategory)
                    : 'outline'
                }
                className={`cursor-pointer transition-all px-4 py-1.5 ${
                  selectedCategory === category.value ? '' : 'hover:bg-muted'
                }`}
              >
                {category.label}
              </Badge>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Posts */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <div key={post.id} className={`stagger-${Math.min(index + 1, 5)}`}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            {user?.userType === 'user' ? (
              <>
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Follow some schools to see their updates here.
                </p>
                <Button asChild>
                  <Link to="/discover">Discover Schools</Link>
                </Button>
              </>
            ) : user?.userType === 'school' ? (
              <>
                <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first post to share with your followers.
                </p>
                <Button asChild>
                  <Link to="/create-post">Create Post</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">No posts in this category yet.</p>
                <Button asChild variant="outline">
                  <Link to="/signup">Sign up to get started</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
