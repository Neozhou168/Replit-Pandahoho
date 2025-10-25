import { useQuery } from "@tanstack/react-query";
import GuideCard from "@/components/GuideCard";
import type { SurvivalGuide } from "@shared/schema";

export default function GuidesPage() {
  const { data: guides = [], isLoading } = useQuery<SurvivalGuide[]>({
    queryKey: ["/api/guides"],
  });

  const activeGuides = guides.filter((g) => g.isActive);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3" data-testid="page-title">
          Survival Guides
        </h1>
        <p className="text-lg text-muted-foreground">
          Essential tips and insights for traveling in China
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeGuides.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground" data-testid="text-no-guides">
            No survival guides available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
