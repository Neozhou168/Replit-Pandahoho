import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Triplist } from "@shared/schema";

interface TriplistCardProps {
  triplist: Triplist;
}

export default function TriplistCard({ triplist }: TriplistCardProps) {
  return (
    <Link href={`/triplists/${triplist.slug}`} data-testid={`link-triplist-${triplist.id}`}>
      <div className="group cursor-pointer" data-testid={`card-triplist-${triplist.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
          <img
            src={triplist.imageUrl}
            alt={triplist.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            {triplist.category && (
              <Badge
                variant="secondary"
                className="bg-white/20 backdrop-blur text-white border-white/30"
                data-testid={`badge-category-${triplist.id}`}
              >
                {triplist.category}
              </Badge>
            )}
            {triplist.season && (
              <Badge
                variant="secondary"
                className="bg-white/20 backdrop-blur text-white border-white/30"
                data-testid={`badge-season-${triplist.id}`}
              >
                {triplist.season}
              </Badge>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-xl font-semibold text-white mb-2" data-testid={`text-triplist-title-${triplist.id}`}>
              {triplist.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-white/90">
              <MapPin className="w-3 h-3" />
              <span data-testid={`text-triplist-location-${triplist.id}`}>{triplist.location}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
