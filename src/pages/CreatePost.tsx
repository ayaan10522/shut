import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/lib/firebase';
import { FileText, Image, Link as LinkIcon, AlertTriangle, Calendar, BookOpen, Megaphone, Sun } from 'lucide-react';
import type { PostCategory } from '@/types';

const categories: { value: PostCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'notice', label: 'Notice', icon: <FileText className="h-4 w-4" />, description: 'General announcements' },
  { value: 'exam', label: 'Exam', icon: <BookOpen className="h-4 w-4" />, description: 'Exam schedules & results' },
  { value: 'event', label: 'Event', icon: <Calendar className="h-4 w-4" />, description: 'School events & activities' },
  { value: 'holiday', label: 'Holiday', icon: <Sun className="h-4 w-4" />, description: 'Holiday announcements' },
  { value: 'emergency', label: 'Emergency', icon: <AlertTriangle className="h-4 w-4" />, description: 'Urgent notifications' },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('notice');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  // Redirect if not a school
  if (!user || user.userType !== 'school') {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="container max-w-2xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Only school accounts can create posts.</p>
          <Button onClick={() => navigate('/feed')}>Go to Feed</Button>
        </main>
        <MobileNav />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please write something for your post.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await createPost({
        schoolId: user.id,
        schoolName: user.schoolName || user.name,
        schoolPhotoUrl: user.profilePhotoUrl,
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
        linkTitle: linkTitle.trim() || undefined,
      });

      toast({
        title: 'Post created!',
        description: 'Your post has been published successfully.',
      });

      navigate('/feed');
    } catch (error: any) {
      console.error("Create post error:", error);
      toast({
        title: 'Error',
        description: `Failed to create post: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container max-w-2xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Create New Post
            </CardTitle>
            <CardDescription>
              Share updates with your followers. Emergency posts will be highlighted and shown at the top.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as PostCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          {cat.icon}
                          <span>{cat.label}</span>
                          <span className="text-muted-foreground text-xs">- {cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category === 'emergency' && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Emergency posts trigger instant notifications to all followers
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length} characters
                </p>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Image URL (optional)
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                {imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border max-h-48">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div className="space-y-2">
                <Label htmlFor="linkUrl" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Attachment Link (optional)
                </Label>
                <Input
                  id="linkUrl"
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                {linkUrl && (
                  <Input
                    placeholder="Link title (e.g., 'Download Exam Schedule')"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/feed')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !content.trim()}
                >
                  {isLoading ? 'Publishing...' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
