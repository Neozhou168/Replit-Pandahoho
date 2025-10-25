import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { Venue } from "@shared/schema";

export default function VenuesManagement() {
  const { data: venues = [], isLoading } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Venues Management
          </h1>
          <p className="text-muted-foreground">
            Manage specific locations and attractions
          </p>
        </div>

        <Button data-testid="button-create-venue">
          <Plus className="w-4 h-4 mr-2" />
          Add Venue
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-venues">
            No venues created yet. Click "Add Venue" to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden p-6" data-testid={`card-venue-${venue.id}`}>
              <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>
              <p className="text-sm text-muted-foreground">{venue.location}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
