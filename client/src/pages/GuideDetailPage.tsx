import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import type { SurvivalGuide } from "@shared/schema";
import { format } from "date-fns";

function convertToEmbedUrl(url: string): string {
  if (!url) return url;
  
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  return url;
}

export default function GuideDetailPage() {
  const [, params] = useRoute("/guides/:slug");

  const { data: guide, isLoading } = useQuery<SurvivalGuide>({
    queryKey: [`/api/guides/${params?.slug}`],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-96 bg-muted animate-pulse" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-muted-foreground" data-testid="text-not-found">
          Guide not found
        </p>
      </div>
    );
  }

  const embedUrl = guide.videoUrl ? convertToEmbedUrl(guide.videoUrl) : null;

  return (
    <div className="min-h-screen">
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={guide.imageUrl}
          alt={guide.title}
          className="w-full h-full object-cover"
          data-testid="guide-cover-image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guides
            </Button>

            <div className="flex items-center gap-3 mb-4">
              {guide.country && (
                <Badge variant="secondary" className="text-sm" data-testid="badge-country">
                  <MapPin className="w-3 h-3 mr-1" />
                  {guide.country}
                </Badge>
              )}
              {guide.createdAt && (
                <Badge variant="outline" className="text-sm bg-background/80 backdrop-blur-sm" data-testid="badge-date">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(guide.createdAt), "MMM d, yyyy")}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg" data-testid="guide-title">
              {guide.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Card className="p-6 md:p-8 mb-8">
          <p className="text-xl text-foreground leading-relaxed" data-testid="guide-description">
            {guide.description}
          </p>
        </Card>

        {guide.hasVideo && embedUrl && (
          <Card className="p-4 md:p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Watch Video Guide</h2>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                data-testid="video-embed"
              />
            </div>
          </Card>
        )}

        {guide.content && guide.content !== guide.description && (
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">Detailed Guide</h2>
            <div
              className="prose prose-lg max-w-none whitespace-pre-wrap"
              data-testid="guide-content"
            >
              {guide.content}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
