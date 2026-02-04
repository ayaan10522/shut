import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = location.pathname.includes('/signup') || location.pathname.includes('/login');
  const isLandingPage = location.pathname === '/';

  if (isAuthPage || isLandingPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 px-4">
        <MobileNavLink to="/feed" icon={<Home className="h-5 w-5" />} label="Feed" />
        <MobileNavLink to="/discover" icon={<Search className="h-5 w-5" />} label="Discover" />
        {user?.userType === 'school' && (
          <Link
            to="/create-post"
            className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg -mt-4"
          >
            <Plus className="h-6 w-6" />
          </Link>
        )}
        <MobileNavLink to="/notifications" icon={<Bell className="h-5 w-5" />} label="Alerts" />
        <MobileNavLink to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
      </div>
    </nav>
  );
}

interface MobileNavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function MobileNavLink({ to, icon, label }: MobileNavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
