import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TriplistCard from "@/components/TriplistCard";
import { Button } from "@/components/ui/button";
import type { Triplist } from "@shared/schema";

export default function TriplistsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);

  const { data: triplists = [], isLoading } = useQuery<Triplist[]>({
    queryKey: ["/api/triplists"],
  });

  const activeTriplists = triplists.filter((t) => t.isActive);
  
  const filteredTriplists = activeTriplists.filter((triplist) => {
    const matchesCategory = !categoryFilter || triplist.category === categoryFilter;
    const matchesSeason = !seasonFilter || triplist.season === seasonFilter;
    return matchesCategory && matchesSeason;
  });

  const categories = Array.from(new Set(activeTriplists.map((t) => t.category).filter(Boolean)));
  const seasons = Array.from(new Set(activeTriplists.map((t) => t.season).filter(Boolean)));

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

      {(categories.length > 0 || seasons.length > 0) && (
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground self-center">
              Category:
            </span>
            <Button
              variant={categoryFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(null)}
              data-testid="filter-category-all"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category!)}
                data-testid={`filter-category-${category}`}
              >
                {category}
              </Button>
            ))}
          </div>

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
            {categoryFilter || seasonFilter
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
