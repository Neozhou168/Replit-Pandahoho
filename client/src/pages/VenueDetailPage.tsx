import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import type { Venue } from "@shared/schema";

export default function VenueDetailPage() {
  const [, params] = useRoute("/venues/:slug");

  const { data: venue, isLoading } = useQuery<Venue>({
    queryKey: [`/api/venues/${params?.slug}`],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-[60vh] bg-muted animate-pulse" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <p className="text-muted-foreground" data-testid="text-not-found">
          Venue not found
        </p>
      </div>
    );
  }

  const highlights = venue.highlights as string[] | null;

  return (
    <div>
      <div className="relative h-[60vh]">
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pb-12">
            <Button
              variant="ghost"
              className="mb-6 bg-white/10 backdrop-blur text-white hover:bg-white/20"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <h1 className="font-serif text-5xl font-semibold text-white mb-4" data-testid="venue-name">
              {venue.name}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg" data-testid="venue-location">{venue.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {highlights && highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {highlights.map((highlight, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    data-testid={`badge-highlight-${index}`}
                  >
                    {highlight}
                  </Badge>
                ))}
              </div>
            )}

            <div className="prose max-w-none mb-12">
              <p className="text-lg leading-relaxed" data-testid="venue-description">
                {venue.description}
              </p>
            </div>

            {venue.googleMapsUrl && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6" data-testid="section-title-location">
                  Location
                </h2>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(venue.googleMapsUrl!, "_blank")}
                  data-testid="button-open-maps"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {venue.proTips && (
              <div className="sticky top-24">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4" data-testid="sidebar-title-pro-tips">
                    Pro Tips
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap"
                    data-testid="text-pro-tips"
                  >
                    {venue.proTips}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
