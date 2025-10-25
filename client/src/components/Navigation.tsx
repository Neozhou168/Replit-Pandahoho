import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
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

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/cities" data-testid="link-cities">
              <span
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/cities")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Cities
              </span>
            </Link>
            <Link href="/triplists" data-testid="link-triplists">
              <span
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/triplists")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Triplists
              </span>
            </Link>
            <Link href="/guides" data-testid="link-guides">
              <span
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/guides")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Survival Guides
              </span>
            </Link>
            <Link href="/membership" data-testid="link-membership">
              <span
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/membership")
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Membership
              </span>
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
                  <Button variant="ghost" size="icon" data-testid="button-profile">
                    {currentUser.profileImageUrl ? (
                      <img
                        src={currentUser.profileImageUrl}
                        alt={currentUser.firstName || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Button>
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
