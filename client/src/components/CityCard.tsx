import { Link } from "wouter";
import { MapPin } from "lucide-react";
import type { City } from "@shared/schema";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface CityCardProps {
  city: City;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <Link href={`/cities/${city.slug}`} data-testid={`link-city-${city.id}`}>
      <div className="group cursor-pointer" data-testid={`card-city-${city.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
          <img
            src={getOptimizedImageUrl(city.imageUrl, 400)}
            alt={city.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-semibold text-white mb-1" data-testid={`text-city-name-${city.id}`}>
              {city.name}
            </h3>
            <p className="text-sm text-white/90" data-testid={`text-city-tagline-${city.id}`}>
              {city.tagline}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span data-testid={`text-triplist-count-${city.id}`}>
            {city.triplistCount} {city.triplistCount === 1 ? "triplist" : "triplists"}
          </span>
        </div>
      </div>
    </Link>
  );
}
