import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Building, Mail, Lock, Image, Phone, Globe, MapPin, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createUser, getUserByEmail } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupSchool() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    password: '',
    profilePhotoUrl: '',
    city: '',
    address: '',
    phone: '',
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(formData.email);
      if (existingUser) {
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Please login.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create new school user
      const user = await createUser({
        name: formData.schoolName,
        schoolName: formData.schoolName,
        email: formData.email,
        password: formData.password,
        profilePhotoUrl: formData.profilePhotoUrl || undefined,
        city: formData.city,
        address: formData.address,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        userType: 'school',
      });

      login(user);
      toast({
        title: "School registered!",
        description: `Welcome to SchoolPost, ${user.schoolName}!`,
      });
      navigate('/feed');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/30 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-foreground">SchoolPost</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CardTitle className="text-2xl">Register Your School</CardTitle>
              <Badge variant="school">School</Badge>
            </div>
            <CardDescription>
              Create an official school account to post updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Photo Preview */}
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarImage src={formData.profilePhotoUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {formData.schoolName ? formData.schoolName.slice(0, 2).toUpperCase() : <Building className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="schoolName"
                    placeholder="Official school name"
                    className="pl-10"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">School Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@schoolname.edu"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      placeholder="City"
                      className="pl-10"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="School address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">School Website (optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://schoolname.edu"
                    className="pl-10"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePhotoUrl">School Logo URL (optional)</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profilePhotoUrl"
                    type="url"
                    placeholder="https://example.com/school-logo.jpg"
                    className="pl-10"
                    value={formData.profilePhotoUrl}
                    onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a link to your school's logo
                </p>
              </div>

              <Button type="submit" variant="school" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Register School
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already registered? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link 
                to="/signup" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Are you a parent or student? Sign up here →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
