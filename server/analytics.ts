import { db } from "./db";
import { pageViews } from "@shared/schema";
import { sql, desc, count, and, gte } from "drizzle-orm";

export interface AnalyticsStats {
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

// Helper to get time range filter
function getTimeRangeFilter(timeRange: string = "24h") {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "24h":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "all":
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return startDate;
}

export async function getAnalyticsStats(timeRange: string = "24h"): Promise<AnalyticsStats> {
  const startDate = getTimeRangeFilter(timeRange);

  // Total page views
  const [totalPageViewsResult] = await db
    .select({ count: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, startDate));

  // Unique visitors
  const [uniqueVisitorsResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, startDate));

  // New sessions
  const [newSessionsResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, startDate));

  // TikTok traffic
  const [tiktokTrafficResult] = await db
    .select({ count: count() })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`LOWER(${pageViews.trafficSource}) LIKE '%tiktok%'`
      )
    );

  // Triplists page
  const [triplistsPageResult] = await db
    .select({ 
      views: count(),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.pagePath} LIKE '/triplists%'`
      )
    );

  // Membership page
  const [membershipPageResult] = await db
    .select({ 
      views: count(),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.pagePath} LIKE '/membership%'`
      )
    );

  // Group-Ups page
  const [groupUpsPageResult] = await db
    .select({ 
      views: count(),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.pagePath} LIKE '/group-ups%'`
      )
    );

  // Survival Guides page
  const [guidesPageResult] = await db
    .select({ 
      views: count(),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.pagePath} LIKE '/guides%'`
      )
    );

  // Top Cities (from city detail pages)
  const topCities = await db
    .select({
      name: pageViews.referenceTitle,
      views: count(),
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.pageType} = 'city'`,
        sql`${pageViews.referenceTitle} IS NOT NULL`
      )
    )
    .groupBy(pageViews.referenceTitle)
    .orderBy(desc(count()))
    .limit(5);

  // Top Triplists
  const topTriplists = await db
    .select({
      title: pageViews.referenceTitle,
      views: count(),
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.pageType} = 'triplist'`,
        sql`${pageViews.referenceTitle} IS NOT NULL`
      )
    )
    .groupBy(pageViews.referenceTitle)
    .orderBy(desc(count()))
    .limit(5);

  // Top Venues
  const topVenues = await db
    .select({
      title: pageViews.referenceTitle,
      views: count(),
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.pageType} = 'venue'`,
        sql`${pageViews.referenceTitle} IS NOT NULL`
      )
    )
    .groupBy(pageViews.referenceTitle)
    .orderBy(desc(count()))
    .limit(5);

  // Traffic Sources
  const trafficSources = await db
    .select({
      source: pageViews.trafficSource,
      visits: count(),
    })
    .from(pageViews)
    .where(
      and(
        gte(pageViews.createdAt, startDate),
        sql`${pageViews.trafficSource} IS NOT NULL`
      )
    )
    .groupBy(pageViews.trafficSource)
    .orderBy(desc(count()))
    .limit(10);

  // Device Types
  const deviceTypes = await db
    .select({
      device: pageViews.deviceType,
      visits: count(),
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, startDate))
    .groupBy(pageViews.deviceType)
    .orderBy(desc(count()));

  return {
    totalPageViews: totalPageViewsResult?.count || 0,
    uniqueVisitors: Number(uniqueVisitorsResult?.count || 0),
    newSessions: Number(newSessionsResult?.count || 0),
    tiktokTraffic: tiktokTrafficResult?.count || 0,
    triplistsPageViews: triplistsPageResult?.views || 0,
    triplistsUniqueVisitors: Number(triplistsPageResult?.uniqueVisitors || 0),
    membershipPageViews: membershipPageResult?.views || 0,
    membershipUniqueVisitors: Number(membershipPageResult?.uniqueVisitors || 0),
    groupUpsPageViews: groupUpsPageResult?.views || 0,
    groupUpsUniqueVisitors: Number(groupUpsPageResult?.uniqueVisitors || 0),
    guidesPageViews: guidesPageResult?.views || 0,
    guidesUniqueVisitors: Number(guidesPageResult?.uniqueVisitors || 0),
    topCities: topCities.map((c: any) => ({ name: c.name || "Unknown", views: c.views })),
    topTriplists: topTriplists.map((t: any) => ({ title: t.title || "Unknown", views: t.views })),
    topVenues: topVenues.map((v: any) => ({ title: v.title || "Unknown", views: v.views })),
    trafficSources: trafficSources.map((ts: any) => ({ source: ts.source || "Direct", visits: ts.visits })),
    deviceTypes: deviceTypes.map((dt: any) => ({ device: dt.device || "Unknown", visits: dt.visits })),
  };
}
