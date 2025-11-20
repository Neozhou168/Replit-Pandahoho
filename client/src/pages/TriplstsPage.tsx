import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TriplistCard from "@/components/TriplistCard";
import { Button } from "@/components/ui/button";
import type { TriplistWithHashtags, Hashtag } from "@shared/schema";

export default function TriplistsPage() {
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);

  const { data: triplists = [], isLoading } = useQuery<TriplistWithHashtags[]>({
    queryKey: ["/api/triplists"],
  });

  const { data: hashtags = [] } = useQuery<Hashtag[]>({
    queryKey: ["/api/hashtags"],
  });

  const activeTriplists = triplists.filter((t) => t.isActive);
  
  const filteredTriplists = activeTriplists.filter((triplist) => {
    const matchesCity = !cityFilter || triplist.location === cityFilter;
    const matchesHashtag = !hashtagFilter || triplist.hashtags.some((h) => h.name === hashtagFilter);
    const matchesSeason = !seasonFilter || triplist.season === seasonFilter;
    return matchesCity && matchesHashtag && matchesSeason;
  });

  const cities = Array.from(new Set(activeTriplists.map((t) => t.location).filter(Boolean)));
  const promotedHashtags = hashtags.filter((h) => h.isPromoted && h.isActive);
  
  // Define custom season order
  const seasonOrder = ["All seasons", "Spring", "Summer", "Autumn", "Winter", "Spring & Autumn"];
  const unsortedSeasons = Array.from(new Set(activeTriplists.map((t) => t.season).filter(Boolean)));
  
  // Sort seasons according to custom order
  const seasons = unsortedSeasons.sort((a, b) => {
    const indexA = seasonOrder.indexOf(a!);
    const indexB = seasonOrder.indexOf(b!);
    // If both are in the custom order, sort by position
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only one is in the custom order, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in the custom order, sort alphabetically
    return (a || "").localeCompare(b || "");
  });

  // Helper function to display city name without country suffix
  const getCityDisplayName = (location: string | null) => {
    if (!location) return "";
    // Remove ", China" or similar country suffixes
    return location.split(",")[0].trim();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3" data-testid="page-title">
          Triplists
        </h1>
        <p className="text-lg text-muted-foreground">
          Curated travel itineraries from locals and seasoned travelers
        </p>
      </div>

      {(cities.length > 0 || promotedHashtags.length > 0 || seasons.length > 0) && (
        <div className="mb-8 space-y-4">
          {cities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">
                City:
              </span>
              <Button
                variant={cityFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setCityFilter(null)}
                data-testid="filter-city-all"
              >
                All
              </Button>
              {cities.map((city) => (
                <Button
                  key={city}
                  variant={cityFilter === city ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCityFilter(city!)}
                  data-testid={`filter-city-${city}`}
                >
                  {getCityDisplayName(city)}
                </Button>
              ))}
            </div>
          )}

          {promotedHashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">
                Hashtag:
              </span>
              <Button
                variant={hashtagFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setHashtagFilter(null)}
                data-testid="filter-hashtag-all"
              >
                All
              </Button>
              {promotedHashtags.map((hashtag) => (
                <Button
                  key={hashtag.id}
                  variant={hashtagFilter === hashtag.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHashtagFilter(hashtag.name)}
                  data-testid={`filter-hashtag-${hashtag.name}`}
                >
                  {hashtag.name}
                </Button>
              ))}
            </div>
          )}

          {seasons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">
                Season:
              </span>
              <Button
                variant={seasonFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSeasonFilter(null)}
                data-testid="filter-season-all"
              >
                All
              </Button>
              {seasons.map((season) => (
                <Button
                  key={season}
                  variant={seasonFilter === season ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeasonFilter(season!)}
                  data-testid={`filter-season-${season}`}
                >
                  {season}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTriplists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground" data-testid="text-no-triplists">
            {cityFilter || hashtagFilter || seasonFilter
              ? "No triplists match your filters. Try adjusting your selection."
              : "No triplists available yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTriplists.map((triplist) => (
            <TriplistCard key={triplist.id} triplist={triplist} />
          ))}
        </div>
      )}
    </div>
  );
}
