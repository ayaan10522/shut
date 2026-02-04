import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Shield, 
  Bell, 
  Users, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Navbar } from '@/components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/30" />
        
        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Shield className="h-4 w-4" />
              Trusted by Schools. Built for Parents.
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-up stagger-1">
              One Place for{' '}
              <span className="text-primary">Official</span>{' '}
              School Updates
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
              No more WhatsApp chaos. No more missed notices. 
              EduNotice is the trusted platform where schools share official updates, 
              and parents stay informed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/signup/school">Register Your School</Link>
              </Button>
            </div>

            <div className="mt-4 animate-fade-up stagger-3">
              <Link to="/feed" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center justify-center gap-1">
                Browse posts as guest <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-6 animate-fade-up stagger-3">
               <span className="text-muted-foreground">Already have an account? </span>
               <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              School Communication is Broken
            </h2>
            <p className="text-muted-foreground text-lg">
              Parents and students miss important updates every day
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <ProblemCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="WhatsApp Chaos"
              description="Messages get lost in endless forwards and group chats"
            />
            <ProblemCard
              icon={<FileText className="h-6 w-6" />}
              title="Scattered Information"
              description="Updates spread across websites, emails, and social media"
            />
            <ProblemCard
              icon={<AlertTriangle className="h-6 w-6" />}
              title="Missed Notices"
              description="Critical information doesn't reach parents in time"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Trust & Clarity
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything schools and parents need, nothing they don't
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Verified Schools Only"
              description="Only schools can post. No spam, no misinformation."
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Instant Alerts"
              description="Emergency posts notify parents immediately."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Follow Schools"
              description="Follow your children's schools. See all updates in one feed."
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6" />}
              title="Categorized Posts"
              description="Notices, exams, events, holidays - all clearly labeled."
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="City Discovery"
              description="Find and follow schools in your city easily."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Links & Documents"
              description="Schools can share PDFs, images, and important links."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the Movement
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10">
              Be part of the change. Make school communication simple, official, and reliable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="xl" 
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link to="/signup">
                  Sign Up as Parent
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/signup/school">Register as School</Link>
              </Button>
            </div>
            
            <div className="mt-6">
               <span className="text-primary-foreground/80">Already have an account? </span>
               <Link to="/login" className="text-white hover:underline font-medium">Log in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold text-foreground">EduNotice</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 EduNotice. The official voice of schools.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ProblemCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ProblemCard({ icon, title, description }: ProblemCardProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
