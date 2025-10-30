import { useQuery } from "@tanstack/react-query";
import GroupUpCard from "@/components/GroupUpCard";
import type { GroupUp } from "@shared/schema";

export default function GroupUpsPage() {
  const { data: groupUps = [], isLoading } = useQuery<GroupUp[]>({
    queryKey: ["/api/group-ups"],
  });

  const activeGroupUps = groupUps.filter((g) => g.isActive);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3" data-testid="page-title">
          Group Ups
        </h1>
        <p className="text-lg text-muted-foreground">
          Join fellow travelers for exciting group adventures and meetups
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeGroupUps.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground" data-testid="text-no-group-ups">
            No group meetups available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGroupUps.map((groupUp) => (
            <GroupUpCard key={groupUp.id} groupUp={groupUp} />
          ))}
        </div>
      )}
    </div>
  );
}
