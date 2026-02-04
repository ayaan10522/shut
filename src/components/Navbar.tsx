import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Home, Search, Bell, User, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthPage = location.pathname.includes('/signup') || location.pathname.includes('/login');

  if (isAuthPage) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-foreground">SchoolPost</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/feed" icon={<Home className="h-4 w-4" />}>Feed</NavLink>
          <NavLink to="/discover" icon={<Search className="h-4 w-4" />}>Discover</NavLink>
          <NavLink to="/notifications" icon={<Bell className="h-4 w-4" />}>Notifications</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.userType === 'school' && (
                <Button size="sm" asChild className="hidden sm:flex">
                  <Link to="/create-post">
                    <Plus className="h-4 w-4 mr-1" />
                    New Post
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.userType === 'school' && (
                    <DropdownMenuItem asChild>
                      <Link to="/create-post" className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavLink({ to, icon, children }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
