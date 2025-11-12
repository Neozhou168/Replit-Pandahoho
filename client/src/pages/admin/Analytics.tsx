import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Users, UserPlus, Video, TrendingUp } from "lucide-react";

interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  newSessions: number;
  tiktokTraffic: number;
  triplistsPageViews: number;
  triplistsUniqueVisitors: number;
  membershipPageViews: number;
  membershipUniqueVisitors: number;
  groupUpsPageViews: number;
  groupUpsUniqueVisitors: number;
  guidesPageViews: number;
  guidesUniqueVisitors: number;
  topCities: Array<{ name: string; views: number }>;
  topTriplists: Array<{ title: string; views: number }>;
  topVenues: Array<{ title: string; views: number }>;
  trafficSources: Array<{ source: string; visits: number }>;
  deviceTypes: Array<{ device: string; visits: number }>;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<string>("24h");

  const { data: stats, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats", { timeRange }],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/stats?timeRange=${timeRange}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Analytics
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="page-title">
          Analytics
        </h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]" data-testid="select-time-range">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-pageviews">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total-pageviews">
              {stats?.totalPageViews.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-unique-visitors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-unique-visitors">
              {stats?.uniqueVisitors.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-new-sessions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sessions</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-new-sessions">
              {stats?.newSessions.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-tiktok-traffic">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TikTok Traffic</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-tiktok-traffic">
              {stats?.tiktokTraffic.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-triplists-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Triplists</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1" data-testid="metric-triplists-views">
              {stats?.triplistsPageViews.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.triplistsUniqueVisitors.toLocaleString() || 0} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-membership-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1" data-testid="metric-membership-views">
              {stats?.membershipPageViews.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.membershipUniqueVisitors.toLocaleString() || 0} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-groupups-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group-Ups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1" data-testid="metric-groupups-views">
              {stats?.groupUpsPageViews.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.groupUpsUniqueVisitors.toLocaleString() || 0} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-guides-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Survival Guides</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1" data-testid="metric-guides-views">
              {stats?.guidesPageViews.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.guidesUniqueVisitors.toLocaleString() || 0} unique visitors
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="card-top-cities">
          <CardHeader>
            <CardTitle>Top 5 Cities</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topCities && stats.topCities.length > 0 ? (
              <div className="space-y-3">
                {stats.topCities.map((city, index) => (
                  <div
                    key={city.name}
                    className="flex items-center justify-between"
                    data-testid={`top-city-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{city.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {city.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-top-triplists">
          <CardHeader>
            <CardTitle>Top 5 Triplists</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topTriplists && stats.topTriplists.length > 0 ? (
              <div className="space-y-3">
                {stats.topTriplists.map((triplist, index) => (
                  <div
                    key={triplist.title}
                    className="flex items-center justify-between"
                    data-testid={`top-triplist-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{triplist.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {triplist.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-top-venues">
          <CardHeader>
            <CardTitle>Top 5 Venues</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topVenues && stats.topVenues.length > 0 ? (
              <div className="space-y-3">
                {stats.topVenues.map((venue, index) => (
                  <div
                    key={venue.title}
                    className="flex items-center justify-between"
                    data-testid={`top-venue-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{venue.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {venue.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-traffic-sources">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.trafficSources && stats.trafficSources.length > 0 ? (
              <div className="space-y-3">
                {stats.trafficSources.map((source, index) => (
                  <div
                    key={source.source}
                    className="flex items-center justify-between"
                    data-testid={`traffic-source-${index}`}
                  >
                    <span className="font-medium capitalize">{source.source}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(source.visits / (stats.trafficSources[0]?.visits || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {source.visits.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-device-types">
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.deviceTypes && stats.deviceTypes.length > 0 ? (
              <div className="space-y-3">
                {stats.deviceTypes.map((device, index) => (
                  <div
                    key={device.device}
                    className="flex items-center justify-between"
                    data-testid={`device-type-${index}`}
                  >
                    <span className="font-medium capitalize">{device.device}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(device.visits / (stats.deviceTypes[0]?.visits || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {device.visits.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
