import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import HeroCarousel from "@/components/HeroCarousel";
import CityCard from "@/components/CityCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { City } from "@shared/schema";
import { trackPageView } from "@/lib/analytics";

export default function HomePage() {
  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const activeCities = cities.filter((city) => city.isActive).slice(0, 8);

  useEffect(() => {
    trackPageView({
      pageType: "home",
      pageUrl: window.location.pathname,
      pageTitle: "Home - PandaHoHo",
    });
  }, []);

  return (
    <div>
      <HeroCarousel />

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-3" data-testid="section-title-cities">
              Explore Chinese Cities
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover curated travel experiences across China's most exciting destinations
            </p>
          </div>
          <Link href="/cities" data-testid="link-all-cities">
            <Button variant="ghost" className="gap-2">
              View all
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activeCities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground" data-testid="text-no-cities">
              No cities available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-semibold mb-6" data-testid="section-title-membership">
              Unlock Premium Travel Experiences
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join PandaHoHo membership for exclusive access to curated triplists,
              insider tips, and connect with fellow travelers
            </p>
            <Link href="/membership" data-testid="link-membership-cta">
              <Button size="lg" variant="default">
                Explore Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
