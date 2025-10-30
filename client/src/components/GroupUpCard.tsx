import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users as UsersIcon, DollarSign } from "lucide-react";
import type { GroupUp } from "@shared/schema";
import { format } from "date-fns";

interface GroupUpCardProps {
  groupUp: GroupUp;
  onJoin?: (groupUp: GroupUp) => void;
}

export default function GroupUpCard({ groupUp, onJoin }: GroupUpCardProps) {
  const startDate = new Date(groupUp.startTime);

  return (
    <div className="group cursor-pointer hover-elevate rounded-xl border p-6" data-testid={`card-group-up-${groupUp.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2" data-testid={`text-group-up-title-${groupUp.id}`}>
            {groupUp.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" data-testid={`badge-status-${groupUp.id}`}>
              {groupUp.isActive ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span data-testid={`text-date-${groupUp.id}`}>
            {format(startDate, "PPP p")}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span data-testid={`text-location-${groupUp.id}`}>
            {groupUp.meetingPoint}
          </span>
        </div>

        {groupUp.participationFee && groupUp.participationFee > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span data-testid={`text-fee-${groupUp.id}`}>
              ¥{groupUp.participationFee}
            </span>
          </div>
        )}
      </div>

      {groupUp.notes && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`text-notes-${groupUp.id}`}>
          {groupUp.notes}
        </p>
      )}

      {onJoin && groupUp.isActive && (
        <Button 
          onClick={(e) => {
            e.preventDefault();
            onJoin(groupUp);
          }}
          className="w-full"
          data-testid={`button-join-${groupUp.id}`}
        >
          <UsersIcon className="w-4 h-4 mr-2" />
          Join Group
        </Button>
      )}
    </div>
  );
}
