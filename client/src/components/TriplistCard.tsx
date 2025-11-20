import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Triplist, Hashtag } from "@shared/schema";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface TriplistCardProps {
  triplist: Triplist;
}

export default function TriplistCard({ triplist }: TriplistCardProps) {
  const { data: triplistHashtags = [] } = useQuery<Array<{ hashtag: Hashtag }>>({
    queryKey: ["/api/triplists", triplist.id, "hashtags"],
    queryFn: async () => {
      const response = await fetch(`/api/triplists/${triplist.id}/hashtags`);
      if (!response.ok) return [];
      return response.json();
    },
  });
  return (
    <Link href={`/triplists/${triplist.slug}`} data-testid={`link-triplist-${triplist.id}`}>
      <div className="group cursor-pointer" data-testid={`card-triplist-${triplist.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
          <img
            src={getOptimizedImageUrl(triplist.imageUrl, 400)}
            alt={triplist.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {triplist.location && (
              <Badge
                variant="secondary"
                className="bg-white/90 backdrop-blur text-gray-900 border-0"
                data-testid={`badge-location-${triplist.id}`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {triplist.location.split(',')[0]}
              </Badge>
            )}
            {triplist.season && (
              <Badge
                variant="secondary"
                className="bg-green-500/90 backdrop-blur text-white border-0"
                data-testid={`badge-season-${triplist.id}`}
              >
                {triplist.season}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-triplist-title-${triplist.id}`}>
            {triplist.title}
          </h3>
          
          {triplistHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" data-testid={`hashtags-${triplist.id}`}>
              {triplistHashtags.map(({ hashtag }) => (
                <span
                  key={hashtag.id}
                  className="inline-block px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md"
                  data-testid={`hashtag-pill-${hashtag.id}`}
                >
                  #{hashtag.name}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground" data-testid={`text-triplist-location-below-${triplist.id}`}>
            {triplist.location}
          </p>
          {triplist.description && (
            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-triplist-description-${triplist.id}`}>
              {triplist.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
