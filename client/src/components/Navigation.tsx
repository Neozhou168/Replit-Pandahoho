import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, MapIcon, BookOpen, Crown, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { Branding, User as DbUser } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  const { user, loading } = useAuth();
  
  const { data: branding } = useQuery<Branding>({
    queryKey: ["/api/branding"],
  });

  const { data: dbUser } = useQuery<DbUser>({
    queryKey: ["/api/auth/me"],
    enabled: !!user && !loading,
    retry: 1,
  });

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3">
              {branding?.logoUrl && (
                <img
                  src={branding.logoUrl}
                  alt={branding.appName}
                  className="w-10 h-10 object-contain"
                  data-testid="img-logo"
                />
              )}
              <div>
                <div className="text-xl font-bold font-serif text-primary" data-testid="text-app-name">
                  {branding?.appName || "PandaHoHo"}
                </div>
                {branding?.appSubtitle && (
                  <div className="text-xs text-muted-foreground hidden lg:block" data-testid="text-app-subtitle">
                    {branding.appSubtitle}
                  </div>
                )}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/triplists" data-testid="link-triplists">
              <Button
                variant="ghost"
                className={`gap-2 hover-elevate ${
                  isActive("/triplists")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <MapIcon className="w-5 h-5" />
                Triplists
              </Button>
            </Link>
            <Link href="/guides" data-testid="link-guides">
              <Button
                variant="ghost"
                className={`gap-2 hover-elevate ${
                  isActive("/guides")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Survival Guides
              </Button>
            </Link>
            <Link href="/membership" data-testid="link-membership">
              <Button
                variant="ghost"
                className={`gap-2 hover-elevate ${
                  isActive("/membership")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <Crown className="w-5 h-5" />
                Membership
              </Button>
            </Link>
            {dbUser?.isAdmin && (
              <Link href="/admin" data-testid="link-admin">
                <Button
                  variant="ghost"
                  className={`gap-2 hover-elevate ${
                    isActive("/admin")
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile" data-testid="link-profile">
                  <div className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1.5 cursor-pointer">
                    <Avatar className="w-8 h-8" data-testid="avatar-profile">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url || undefined} 
                        alt={user.user_metadata?.full_name || user.email || "User"} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {user.user_metadata?.full_name ? 
                          user.user_metadata.full_name.charAt(0).toUpperCase() :
                          user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block">
                      <div className="text-sm font-medium" data-testid="text-user-name">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            ) : loading ? (
              <Button variant="ghost" size="sm" disabled>
                Loading...
              </Button>
            ) : (
              <Link href="/auth" data-testid="link-login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
