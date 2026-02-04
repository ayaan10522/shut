import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Bell, Construction } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground text-sm">Stay updated with important alerts</p>
        </div>

        <div className="text-center py-16">
          <div className="relative inline-block">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <Construction className="h-6 w-6 absolute -bottom-1 -right-1 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Push notifications for emergency posts and important updates will be available soon.
          </p>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
