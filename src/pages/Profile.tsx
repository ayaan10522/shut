import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, getPostsBySchool, getSavedPosts, getFollowedSchools, type PostData, type UserData } from '@/lib/firebase';
import { INDIAN_STATES_AND_CITIES } from '@/lib/locations';
import { User, Bookmark, Users, FileText, MapPin, Edit2, Save, X } from 'lucide-react';
import type { Post } from '@/types';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [followedSchools, setFollowedSchools] = useState<UserData[]>([]);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editState, setEditState] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  const availableCities = editState ? INDIAN_STATES_AND_CITIES[editState] || [] : [];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setEditName(user.schoolName || user.name);
    setEditState(user.state || '');
    setEditCity(user.city || '');
    setEditPhoto(user.profilePhotoUrl || '');
    
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (user.userType === 'school') {
        // Load school's own posts
        const postsData = await getPostsBySchool(user.id);
        setPosts(formatPosts(postsData));
      } else {
        // Load saved posts and followed schools for regular users
        const [saved, followed] = await Promise.all([
          getSavedPosts(user.id),
          getFollowedSchools(user.id),
        ]);
        setSavedPosts(formatPosts(saved));
        setFollowedSchools(followed);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPosts = (postsData: PostData[]): Post[] => {
    return postsData.map(post => ({
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
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updates: Partial<UserData> = {
        name: editName,
        state: editState,
        city: editCity,
        profilePhotoUrl: editPhoto,
      };
      
      if (user.userType === 'school') {
        updates.schoolName = editName;
      }
      
      await updateUserProfile(user.id, updates);
      
      // Update local user state
      updateUser({
        ...user,
        ...updates,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container max-w-2xl px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {(user.schoolName || user.name).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{user.schoolName || user.name}</h1>
                  <Badge variant={user.userType === 'school' ? 'school' : 'secondary'}>
                    {user.userType === 'school' ? 'School' : 'User'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                {user.city && (
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{user.city}</span>
                  </div>
                )}
                
                {user.userType === 'school' && (
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.followersCount || 0}</span>
                      <span className="text-muted-foreground">followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.postsCount || 0}</span>
                      <span className="text-muted-foreground">posts</span>
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4 mr-1" /> : <Edit2 className="h-4 w-4 mr-1" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            
            {/* Edit Form */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {user.userType === 'school' ? 'School Name' : 'Name'}
                  </Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={editState}
                      onValueChange={(value) => {
                        setEditState(value);
                        setEditCity('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(INDIAN_STATES_AND_CITIES).map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select
                      value={editCity}
                      onValueChange={setEditCity}
                      disabled={!editState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo URL</Label>
                  <Input
                    id="photo"
                    type="url"
                    value={editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue={user.userType === 'school' ? 'posts' : 'saved'}>
          <TabsList className="w-full">
            {user.userType === 'school' ? (
              <TabsTrigger value="posts" className="flex-1">
                <FileText className="h-4 w-4 mr-1" />
                My Posts
              </TabsTrigger>
            ) : (
              <>
                <TabsTrigger value="saved" className="flex-1">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Saved
                </TabsTrigger>
                <TabsTrigger value="following" className="flex-1">
                  <Users className="h-4 w-4 mr-1" />
                  Following
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* School Posts */}
          {user.userType === 'school' && (
            <TabsContent value="posts" className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first post to share with followers.</p>
                  <Button asChild>
                    <Link to="/create-post">Create Post</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          {/* User Saved Posts */}
          {user.userType === 'user' && (
            <>
              <TabsContent value="saved" className="mt-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : savedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {savedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No saved posts</h3>
                    <p className="text-muted-foreground">Posts you save will appear here.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="following" className="mt-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : followedSchools.length > 0 ? (
                  <div className="space-y-3">
                    {followedSchools.map((school) => (
                      <Card key={school.id}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={school.profilePhotoUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {(school.schoolName || school.name).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium">{school.schoolName || school.name}</h3>
                            {school.city && (
                              <p className="text-sm text-muted-foreground">{school.city}</p>
                            )}
                          </div>
                          <Badge variant="school">School</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Not following anyone</h3>
                    <p className="text-muted-foreground mb-4">Find schools to follow and get their updates.</p>
                    <Button asChild>
                      <Link to="/discover">Discover Schools</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
