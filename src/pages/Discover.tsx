import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Users, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllSchools, followSchool, unfollowSchool, isFollowing, type UserData } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [schools, setSchools] = useState<UserData[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    if (user && schools.length > 0) {
      checkFollowingStatus();
    }
  }, [user, schools]);

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const schoolsData = await getAllSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowingStatus = async () => {
    if (!user) return;
    
    const statusMap: Record<string, boolean> = {};
    for (const school of schools) {
      statusMap[school.id] = await isFollowing(user.id, school.id);
    }
    setFollowingMap(statusMap);
  };

  const handleFollow = async (schoolId: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to follow schools.',
        variant: 'destructive',
      });
      return;
    }

    setFollowingLoading(schoolId);
    try {
      if (followingMap[schoolId]) {
        await unfollowSchool(user.id, schoolId);
        setFollowingMap(prev => ({ ...prev, [schoolId]: false }));
        toast({
          title: 'Unfollowed',
          description: 'You will no longer see updates from this school.',
        });
      } else {
        await followSchool(user.id, schoolId);
        setFollowingMap(prev => ({ ...prev, [schoolId]: true }));
        toast({
          title: 'Following!',
          description: 'You will now see updates from this school in your feed.',
        });
      }
      // Reload schools to update follower counts
      await loadSchools();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setFollowingLoading(null);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Discover Schools</h1>
          <p className="text-muted-foreground text-sm">Find and follow schools in your city</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by school name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Schools List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredSchools.map((school) => (
              <Card key={school.id} className="animate-fade-up">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={school.profilePhotoUrl} alt={school.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {(school.schoolName || school.name).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-foreground truncate">
                          {school.schoolName || school.name}
                        </h3>
                        <Badge variant="school" className="shrink-0">School</Badge>
                      </div>
                      {school.city && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{school.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{(school.followersCount || 0).toLocaleString()} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{school.postsCount || 0} posts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {user && user.id !== school.id && (
                    <Button
                      variant={followingMap[school.id] ? 'outline' : 'default'}
                      className="w-full mt-4"
                      onClick={() => handleFollow(school.id)}
                      disabled={followingLoading === school.id}
                    >
                      {followingLoading === school.id 
                        ? 'Loading...' 
                        : followingMap[school.id] 
                        ? 'Following' 
                        : 'Follow'
                      }
                    </Button>
                  )}
                  {!user && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => handleFollow(school.id)}
                    >
                      Follow
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No schools found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Try adjusting your search query.'
                : 'No schools have registered yet.'
              }
            </p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
