import { useState } from 'react';
import { MapPin, Users, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { School } from '@/types';

interface SchoolCardProps {
  school: School;
}

export function SchoolCard({ school }: SchoolCardProps) {
  const [isFollowing, setIsFollowing] = useState(school.isFollowing || false);
  const [followers, setFollowers] = useState(school.followers);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
  };

  return (
    <Card variant="school" className="animate-fade-up">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={school.profilePhotoUrl} alt={school.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {school.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground truncate">{school.name}</h3>
              <Badge variant="school" className="shrink-0">School</Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="h-3.5 w-3.5" />
              <span>{school.city}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{followers.toLocaleString()} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{school.postsCount} posts</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant={isFollowing ? 'outline' : 'default'}
          className="w-full mt-4"
          onClick={handleFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardContent>
    </Card>
  );
}
