import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { MessageSquare, Bell, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import hohoImage from "@assets/hoho on homepage_1762428276851.jpg";

export default function ChatAssistantComingSoon() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-8">
              <img 
                src={hohoImage} 
                alt="Hoho Chat Assistant" 
                className="w-80 h-auto"
                data-testid="image-hoho"
              />
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <MessageSquare className="w-12 h-12 mx-auto text-primary" />
                <h1 className="font-serif text-4xl font-bold" data-testid="heading-title">
                  Voice Chat Assistant Coming Soon!
                </h1>
              </div>

              <p className="text-lg text-muted-foreground" data-testid="text-description">
                We're building an intelligent voice assistant powered by AI that will help you discover the best travel experiences in China. Chat naturally with Hoho to get personalized recommendations, explore cities, and plan your perfect trip!
              </p>

              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Be the First to Know</h3>
                    <p className="text-sm text-muted-foreground">
                      {user ? (
                        "You're signed in! We'll notify you as soon as the voice chat feature is available."
                      ) : (
                        "Sign up for an account and we'll notify you when this exciting feature launches."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="pt-4">
                  <Link href="/auth">
                    <Button size="lg" className="font-semibold" data-testid="button-signup">
                      Sign Up Now
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-3">
                    Already have an account?{" "}
                    <Link href="/auth" className="text-primary hover:underline" data-testid="link-signin">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}

              {user && (
                <div className="pt-4">
                  <Link href="/">
                    <Button size="lg" variant="outline" data-testid="button-explore">
                      Continue Exploring
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            In the meantime, explore our{" "}
            <Link href="/triplists" className="text-primary hover:underline" data-testid="link-triplists">
              curated triplists
            </Link>
            {" "}and{" "}
            <Link href="/guides" className="text-primary hover:underline" data-testid="link-guides">
              survival guides
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
