import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
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
        <div className="h-[60vh] bg-muted animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <p className="text-muted-foreground" data-testid="text-not-found">
          Guide not found
        </p>
      </div>
    );
  }

  const embedUrl = guide.videoUrl ? convertToEmbedUrl(guide.videoUrl) : null;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 pb-4">
        <Link href="/guides" data-testid="link-back">
          <Button variant="ghost" className="hover-elevate -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guides
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <img
                src={guide.imageUrl}
                alt={guide.title}
                className="w-full h-full object-cover"
                data-testid="guide-cover-image"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <img
                src="/attached_assets/ChatGPT Image Nov 5, 2025, 12_52_04 PM_1762318356076.png"
                alt="Chat with hoho, your travel assistant"
                className="w-full h-auto"
                data-testid="image-chat-assistant"
              />
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-3" data-testid="guide-title">
                {guide.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-4">
                {guide.country && (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span data-testid="guide-country">{guide.country}</span>
                  </>
                )}
                {guide.country && guide.createdAt && <span>•</span>}
                {guide.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span data-testid="guide-date">{format(new Date(guide.createdAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="prose max-w-none mb-12">
              <p className="text-base leading-relaxed" data-testid="guide-description">
                {guide.description}
              </p>
            </div>

            {embedUrl && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6" data-testid="section-title-video">
                  Watch Video Guide
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden border">
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
              </div>
            )}

            {guide.content && guide.content !== guide.description && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6" data-testid="section-title-content">
                  Detailed Guide
                </h2>
                <div
                  className="prose prose-lg max-w-none whitespace-pre-wrap"
                  data-testid="guide-content"
                >
                  {guide.content}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
          </div>
        </div>
      </div>
    </div>
  );
}
