import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { SurvivalGuide } from "@shared/schema";

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

  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guides
        </Button>

        <Badge variant="secondary" className="mb-4" data-testid="badge-category">
          {guide.category}
        </Badge>

        <h1 className="text-4xl font-bold mb-6" data-testid="guide-title">
          {guide.title}
        </h1>

        <p className="text-lg text-muted-foreground mb-8" data-testid="guide-description">
          {guide.description}
        </p>

        {guide.hasVideo && guide.videoUrl && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <iframe
              src={guide.videoUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              data-testid="video-embed"
            />
          </div>
        )}

        {!guide.hasVideo && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={guide.imageUrl}
              alt={guide.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none whitespace-pre-wrap"
          data-testid="guide-content"
        >
          {guide.content}
        </div>
      </div>
    </div>
  );
}
