import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, ExternalLink, Heart, Users, Share2 } from "lucide-react";
import type { Venue } from "@shared/schema";
import { trackPageView } from "@/lib/analytics";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VenueDetailPage() {
  const [, params] = useRoute("/venues/:slug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: venue, isLoading } = useQuery<Venue>({
    queryKey: [`/api/venues/${params?.slug}`],
    enabled: !!params?.slug,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!venue) throw new Error("No venue selected");
      return await apiRequest("POST", "/api/favorites", {
        venueId: venue.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/venues/${params?.slug}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: "Venue added to your favorites successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    if (!venue) return;
    
    const shareData = {
      title: venue.name,
      text: `Check out ${venue.name} - ${venue.location}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Venue link copied to clipboard",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGroupUp = () => {
    setLocation("/group-ups");
  };

  useEffect(() => {
    if (venue) {
      trackPageView({
        pageType: "venue",
        pagePath: window.location.pathname,
        referenceId: venue.id,
        referenceTitle: venue.name,
      });
    }
  }, [venue]);

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

  const formatDescription = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <Link href="/venues">
          <Button
            variant="ghost"
            data-testid="button-back-to-venues"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all venues
          </Button>
        </Link>
      </div>

      <div className="relative h-[45vh]">
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute top-6 left-6 flex items-center gap-3">
          {venue.category && (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur text-foreground hover:bg-background"
              data-testid="badge-category"
            >
              {venue.category}
            </Badge>
          )}
        </div>

        <div className="absolute top-6 right-6 hidden md:block">
          <Card className="bg-background/95 backdrop-blur shadow-lg">
            <div className="flex items-center gap-2 p-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent hover:bg-background/50"
                onClick={handleShare}
                data-testid="button-share-venue"
                aria-label="Share this venue"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent hover:bg-background/50"
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
                data-testid="button-add-to-favorites"
                aria-label="Save to favorites"
              >
                <Heart className="w-4 h-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent hover:bg-background/50"
                onClick={handleGroupUp}
                data-testid="button-group-up"
                aria-label="Group up for this venue"
              >
                <Users className="w-4 h-4" />
                Group Up
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pb-8">
            <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-white mb-3" data-testid="venue-name">
              {venue.name}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg" data-testid="venue-location">{venue.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden px-6 py-4 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-1 min-w-[100px]"
            onClick={handleShare}
            data-testid="button-share-venue-mobile"
            aria-label="Share this venue"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-1 min-w-[100px]"
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
            data-testid="button-add-to-favorites-mobile"
            aria-label="Save to favorites"
          >
            <Heart className="w-4 h-4" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 flex-1 min-w-[100px]"
            onClick={handleGroupUp}
            data-testid="button-group-up-mobile"
            aria-label="Group up for this venue"
          >
            <Users className="w-4 h-4" />
            Group Up
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-10">
              <div className="text-lg leading-relaxed text-foreground" data-testid="venue-description">
                {formatDescription(venue.description)}
              </div>
            </div>

            {highlights && highlights.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4" data-testid="section-title-highlights">
                  Highlights
                </h2>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-4 py-2 text-sm"
                      data-testid={`badge-highlight-${index}`}
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {venue.googleMapsEmbedUrl && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6" data-testid="section-title-location">
                  Location Map
                </h2>
                <div className="relative w-full h-[450px] rounded-lg overflow-hidden border">
                  <iframe
                    src={venue.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    data-testid="iframe-google-maps"
                  />
                  
                  <Card className="absolute bottom-4 left-4 right-4 p-4 bg-background/95 backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" data-testid="map-venue-name">
                          {venue.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid="map-venue-address">
                          <MapPin className="w-4 h-4" />
                          {venue.location}
                        </p>
                      </div>
                      {venue.googleMapsDirectUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-shrink-0"
                          onClick={() => window.open(venue.googleMapsDirectUrl!, "_blank")}
                          data-testid="button-open-maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Google Maps
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {venue.proTips && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">💡</span>
                    </div>
                    <h3 className="font-semibold" data-testid="sidebar-title-pro-tips">
                      Pro Tip
                    </h3>
                  </div>
                  <div
                    className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap"
                    data-testid="text-pro-tips"
                  >
                    {venue.proTips}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
