import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import TriplistCard from "@/components/TriplistCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Utensils, ShoppingBag, Music, Sparkles, Palette, Landmark, Coffee } from "lucide-react";
import type { City, Triplist, ContentTravelType } from "@shared/schema";
import { trackPageView } from "@/lib/analytics";

const categoryIcons: Record<string, any> = {
  "All": MapPin,
  "Relaxing": Coffee,
  "Attractions": Landmark,
  "Eating": Utensils,
  "Shopping": ShoppingBag,
  "Nightlife": Music,
  "Spa": Sparkles,
  "Art": Palette,
};

export default function CityDetailPage() {
  const [, params] = useRoute("/cities/:slug");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: city, isLoading: cityLoading } = useQuery<City>({
    queryKey: [`/api/cities/${params?.slug}`],
    enabled: !!params?.slug,
  });

  const { data: allTriplists = [] } = useQuery<Triplist[]>({
    queryKey: ["/api/triplists"],
  });

  const { data: travelTypes = [] } = useQuery<ContentTravelType[]>({
    queryKey: ["/api/content/travel-types"],
  });

  const cityTriplists = city
    ? allTriplists.filter((t) => t.cityId === city.id && t.isActive)
    : [];

  const triplists = categoryFilter
    ? cityTriplists.filter((t) => t.category === categoryFilter)
    : cityTriplists;

  // Get unique categories from city triplists
  const triplistCategories = Array.from(new Set(cityTriplists.map((t) => t.category).filter(Boolean)));
  
  // Sort categories by displayOrder from content settings
  const categories = triplistCategories.sort((a, b) => {
    const typeA = travelTypes.find((t) => t.name === a);
    const typeB = travelTypes.find((t) => t.name === b);
    const orderA = typeA?.displayOrder ?? 999;
    const orderB = typeB?.displayOrder ?? 999;
    return orderA - orderB;
  });

  useEffect(() => {
    if (city) {
      trackPageView({
        pageType: "city",
        pageUrl: window.location.pathname,
        pageTitle: `${city.name} - PandaHoHo`,
        relatedEntityId: city.id,
        relatedEntityName: city.name,
      });
    }
  }, [city]);

  if (cityLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-[50vh] bg-muted animate-pulse" />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <p className="text-muted-foreground" data-testid="text-not-found">
          City not found
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[50vh]">
        <img
          src={city.imageUrl}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pb-12">
            <Link href="/cities" data-testid="link-back">
              <Button
                variant="ghost"
                className="mb-6 bg-white/10 backdrop-blur text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cities
              </Button>
            </Link>

            <h1 className="font-serif text-5xl font-semibold text-white mb-4" data-testid="city-name">
              {city.name}
            </h1>
            <p className="text-lg text-white/90" data-testid="city-tagline">
              {city.tagline}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3" data-testid="section-title-triplists">
            Triplists in {city.name}
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover curated travel experiences in this destination
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={categoryFilter === null ? "default" : "secondary"}
              className="rounded-full gap-2"
              onClick={() => setCategoryFilter(null)}
              data-testid="filter-category-all"
            >
              {categoryIcons["All"] && <MapPin className="w-4 h-4" />}
              All
            </Button>
            {categories.map((category) => {
              const Icon = categoryIcons[category || ""];
              return (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "secondary"}
                  className="rounded-full gap-2"
                  onClick={() => setCategoryFilter(category!)}
                  data-testid={`filter-category-${category}`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {category}
                </Button>
              );
            })}
          </div>
        )}

        {triplists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground" data-testid="text-no-triplists">
              No triplists available for this city yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {triplists.map((triplist) => (
              <TriplistCard key={triplist.id} triplist={triplist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
