import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, MapIcon, BookOpen, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType, Branding } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  
  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
  });

  const { data: branding } = useQuery<Branding>({
    queryKey: ["/api/branding"],
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
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                {currentUser.isAdmin && (
                  <Link href="/admin" data-testid="link-admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile" data-testid="link-profile">
                  <div className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1.5 cursor-pointer">
                    <Avatar className="w-8 h-8" data-testid="avatar-profile">
                      <AvatarImage src={currentUser.profileImageUrl || undefined} alt={currentUser.firstName || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {currentUser.firstName ? 
                          currentUser.firstName.charAt(0).toUpperCase() + (currentUser.lastName?.charAt(0).toUpperCase() || '') :
                          <User className="w-4 h-4" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block">
                      <div className="text-sm font-medium" data-testid="text-user-name">
                        {currentUser.firstName || currentUser.email?.split('@')[0] || 'User'}
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <a href="/api/login" data-testid="link-login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
