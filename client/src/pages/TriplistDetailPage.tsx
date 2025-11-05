import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, ExternalLink, Eye, Heart, Check } from "lucide-react";
import GroupUpModal from "@/components/GroupUpModal";
import type { Triplist, Venue } from "@shared/schema";
import chatAssistantImage from "@assets/hoho客服_1762321242800.jpg";

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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 pb-4">
        <Link href="/triplists" data-testid="link-back">
          <Button variant="ghost" className="hover-elevate -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Triplists
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <img
                src={triplist.imageUrl}
                alt={triplist.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <img
                src={chatAssistantImage}
                alt="Chat with hoho, your travel assistant"
                className="w-full h-auto rounded-lg"
                data-testid="image-chat-assistant"
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold" data-testid="sidebar-title-group-up">
                  Group Activities
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Connect with fellow travelers exploring this triplist!
              </p>
              <Button
                className="w-full gap-2"
                onClick={() => setShowGroupUpModal(true)}
                data-testid="button-create-group-up"
              >
                <Users className="w-4 h-4" />
                Create Group Activity
              </Button>
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center text-muted-foreground">
                  <Users className="w-12 h-12 opacity-20" />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  No activities yet. Be the first to create one!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3" data-testid="triplist-title">
                  {triplist.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-4">
                  <span data-testid="triplist-location">{triplist.location}</span>
                  {triplist.category && (
                    <>
                      <span>•</span>
                      <span data-testid="triplist-category">{triplist.category}</span>
                    </>
                  )}
                  {triplist.season && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-600" />
                        <span data-testid="triplist-season">Best in {triplist.season}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Button variant="outline" size="icon" className="flex-shrink-0" data-testid="button-favorite">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            <div className="prose max-w-none mb-12">
              <p className="text-base leading-relaxed" data-testid="triplist-description">
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
                    <Card key={venue.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        <div className="w-full md:w-48 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={venue.imageUrl}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">VENUE</span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2" data-testid={`text-venue-name-${venue.id}`}>
                            {venue.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <span data-testid={`text-venue-location-${venue.id}`}>{venue.location}</span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-sm" data-testid={`text-venue-description-${venue.id}`}>
                            {venue.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 md:ml-auto">
                          <Button 
                            variant="default" 
                            className="w-full md:w-40 gap-2"
                            data-testid={`button-view-venue-${venue.id}`}
                            asChild
                          >
                            <Link href={`/venues/${venue.slug}`}>
                              <Eye className="w-4 h-4" />
                              View Venue
                            </Link>
                          </Button>
                          {venue.googleMapsDirectUrl && (
                            <Button 
                              variant="outline" 
                              className="w-full md:w-40 gap-2"
                              data-testid={`button-google-maps-${venue.id}`}
                              asChild
                            >
                              <a
                                href={venue.googleMapsDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MapPin className="w-4 h-4" />
                                Google Maps
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
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
