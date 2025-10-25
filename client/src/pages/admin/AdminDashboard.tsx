import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { MapPin, List, FileText, Users } from "lucide-react";
import type { City, Triplist, SurvivalGuide, GroupUp } from "@shared/schema";

export default function AdminDashboard() {
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const { data: triplists = [] } = useQuery<Triplist[]>({
    queryKey: ["/api/triplists"],
  });

  const { data: guides = [] } = useQuery<SurvivalGuide[]>({
    queryKey: ["/api/guides"],
  });

  const { data: groupUps = [] } = useQuery<GroupUp[]>({
    queryKey: ["/api/group-ups"],
  });

  const metrics = [
    {
      title: "Total Cities",
      value: cities.length,
      icon: MapPin,
      color: "text-blue-500",
    },
    {
      title: "Total Triplists",
      value: triplists.length,
      icon: List,
      color: "text-green-500",
    },
    {
      title: "Survival Guides",
      value: guides.length,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Active Group-Ups",
      value: groupUps.filter((g) => g.isActive).length,
      icon: Users,
      color: "text-orange-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="page-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to the PandaHoHo admin panel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-6" data-testid={`card-metric-${metric.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {metric.title}
                </p>
                <p className="text-3xl font-bold" data-testid={`text-metric-value-${metric.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  {metric.value}
                </p>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.color}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
