import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { GroupUp } from "@shared/schema";

export default function GroupUpsManagement() {
  const { data: groupUps = [], isLoading } = useQuery<GroupUp[]>({
    queryKey: ["/api/group-ups"],
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="page-title">
          Group-Ups Management
          </h1>
        <p className="text-muted-foreground">
          Manage user-created meetups and gatherings
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groupUps.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-group-ups">
            No group-ups created yet. Users can create them from triplist pages.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {groupUps.map((groupUp) => (
            <Card key={groupUp.id} className="p-6" data-testid={`card-group-up-${groupUp.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{groupUp.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {format(new Date(groupUp.startTime), "PPP p")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Meeting: {groupUp.meetingPoint}
                  </p>
                  {groupUp.participationFee && groupUp.participationFee > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Fee: ¥{groupUp.participationFee}
                    </p>
                  )}
                </div>
                <Badge variant={groupUp.isActive ? "default" : "secondary"}>
                  {groupUp.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {groupUp.notes && (
                <p className="mt-4 text-sm">{groupUp.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
