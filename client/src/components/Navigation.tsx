import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, MapIcon, Users, BookOpen, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  
  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
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
            <span className="text-xl font-bold font-serif text-primary">
              PandaHoHo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/triplists" data-testid="link-triplists">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 hover-elevate ${
                  isActive("/triplists")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Triplists
              </Button>
            </Link>
            <Link href="/guides" data-testid="link-guides">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 hover-elevate ${
                  isActive("/guides")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Survival Guides
              </Button>
            </Link>
            <Link href="/membership" data-testid="link-membership">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 hover-elevate ${
                  isActive("/membership")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Crown className="w-4 h-4" />
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
                    {currentUser.profileImageUrl ? (
                      <img
                        src={currentUser.profileImageUrl}
                        alt={currentUser.firstName || "User"}
                        className="w-8 h-8 rounded-full"
                        data-testid="img-profile"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
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
