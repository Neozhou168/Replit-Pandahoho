import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, ExternalLink } from "lucide-react";
import GroupUpModal from "@/components/GroupUpModal";
import type { Triplist, Venue } from "@shared/schema";

export default function TriplistDetailPage() {
  const [, params] = useRoute("/triplists/:slug");
  const [showGroupUpModal, setShowGroupUpModal] = useState(false);

  const { data: triplist, isLoading } = useQuery<Triplist>({
    queryKey: [`/api/triplists/${params?.slug}`],
    enabled: !!params?.slug,
  });

  const { data: venues = [] } = useQuery<Venue[]>({
    queryKey: [`/api/venues?triplistId=${triplist?.id}`],
    enabled: !!triplist?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-[60vh] bg-muted animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!triplist) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <p className="text-muted-foreground" data-testid="text-not-found">
          Triplist not found
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[60vh]">
        <img
          src={triplist.imageUrl}
          alt={triplist.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pb-12">
            <Link href="/triplists" data-testid="link-back">
              <Button
                variant="ghost"
                className="mb-6 bg-white/10 backdrop-blur text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Triplists
              </Button>
            </Link>

            <div className="flex gap-2 mb-4">
              {triplist.category && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 backdrop-blur text-white border-white/30"
                  data-testid="badge-category"
                >
                  {triplist.category}
                </Badge>
              )}
              {triplist.season && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 backdrop-blur text-white border-white/30"
                  data-testid="badge-season"
                >
                  {triplist.season}
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-5xl font-semibold text-white mb-4" data-testid="triplist-title">
              {triplist.title}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg" data-testid="triplist-location">{triplist.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="prose max-w-none mb-12">
              <p className="text-lg leading-relaxed" data-testid="triplist-description">
                {triplist.description}
              </p>
            </div>

            {triplist.googleMapsEmbedUrl && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2" data-testid="section-title-map">
                    <MapPin className="w-6 h-6 text-primary" />
                    Map Location
                  </h2>
                  {triplist.googleMapsDirectUrl && (
                    <a
                      href={triplist.googleMapsDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                      data-testid="link-open-maps"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="aspect-video rounded-xl overflow-hidden border">
                  <iframe
                    src={triplist.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    data-testid="map-embed"
                  />
                </div>
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6" data-testid="section-title-venues">
                Related Venues
              </h2>
              
              {venues.length === 0 ? (
                <Card className="p-12 text-center">
                  <h3 className="font-semibold mb-2" data-testid="text-no-venues-title">
                    No Related Content Yet
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-no-venues">
                    Related routes and venues will appear here once they're linked to this triplist.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {venues.map((venue) => (
                    <Link
                      key={venue.id}
                      href={`/venues/${venue.slug}`}
                      data-testid={`link-venue-${venue.id}`}
                    >
                      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer">
                        <div className="flex flex-col md:flex-row gap-6 p-6">
                          <div className="w-full md:w-48 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={venue.imageUrl}
                              alt={venue.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2" data-testid={`text-venue-name-${venue.id}`}>
                              {venue.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <MapPin className="w-4 h-4" />
                              <span data-testid={`text-venue-location-${venue.id}`}>{venue.location}</span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2" data-testid={`text-venue-description-${venue.id}`}>
                              {venue.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4" data-testid="sidebar-title-group-up">
                  Join or Create a Group-Up
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Connect with fellow travelers and explore this triplist together
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={() => setShowGroupUpModal(true)}
                  data-testid="button-create-group-up"
                >
                  <Users className="w-4 h-4" />
                  Create Group-Up
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <GroupUpModal
        open={showGroupUpModal}
        onOpenChange={setShowGroupUpModal}
        triplistId={triplist.id}
      />
    </div>
  );
}
