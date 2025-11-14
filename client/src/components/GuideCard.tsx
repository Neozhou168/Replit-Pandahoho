import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import type { SurvivalGuide } from "@shared/schema";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface GuideCardProps {
  guide: SurvivalGuide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link href={`/guides/${guide.slug}`} data-testid={`link-guide-${guide.id}`}>
      <div className="group cursor-pointer" data-testid={`card-guide-${guide.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
          <img
            src={getOptimizedImageUrl(guide.imageUrl, 400)}
            alt={guide.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {guide.hasVideo && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-primary/90 backdrop-blur rounded-full p-4 group-hover:bg-primary transition-colors">
                <Play className="w-8 h-8 text-primary-foreground fill-current" />
              </div>
            </div>
          )}
          
          {guide.country && (
            <div className="absolute top-4 left-4">
              <Badge
                variant="secondary"
                className="bg-white/20 backdrop-blur text-white border-white/30"
                data-testid={`badge-country-${guide.id}`}
              >
                {guide.country}
              </Badge>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-xl font-semibold text-white mb-2" data-testid={`text-guide-title-${guide.id}`}>
              {guide.title}
            </h3>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-guide-description-${guide.id}`}>
          {guide.description}
        </p>
      </div>
    </Link>
  );
}
