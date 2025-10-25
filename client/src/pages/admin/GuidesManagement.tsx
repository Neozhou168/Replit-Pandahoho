import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { SurvivalGuide } from "@shared/schema";

export default function GuidesManagement() {
  const { data: guides = [], isLoading } = useQuery<SurvivalGuide[]>({
    queryKey: ["/api/guides"],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Survival Guides Management
          </h1>
          <p className="text-muted-foreground">
            Manage essential travel tips and guides
          </p>
        </div>

        <Button data-testid="button-create-guide">
          <Plus className="w-4 h-4 mr-2" />
          Add Guide
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-guides">
            No guides created yet. Click "Add Guide" to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {guides.map((guide) => (
            <Card key={guide.id} className="overflow-hidden p-6" data-testid={`card-guide-${guide.id}`}>
              <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{guide.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
