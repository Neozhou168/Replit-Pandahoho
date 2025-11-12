import { apiRequest } from "./queryClient";

function getOrCreateVisitorId(): string {
  const key = "pandahoho_visitor_id";
  let visitorId = localStorage.getItem(key);
  
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, visitorId);
  }
  
  return visitorId;
}

function getOrCreateSessionId(): string {
  const key = "pandahoho_session_id";
  const sessionDuration = 30 * 60 * 1000; // 30 minutes
  
  const stored = sessionStorage.getItem(key);
  const storedTime = sessionStorage.getItem(`${key}_time`);
  
  if (stored && storedTime) {
    const timeSinceCreated = Date.now() - parseInt(storedTime, 10);
    if (timeSinceCreated < sessionDuration) {
      return stored;
    }
  }
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  sessionStorage.setItem(key, sessionId);
  sessionStorage.setItem(`${key}_time`, Date.now().toString());
  
  return sessionId;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function getTrafficSource(): string {
  const referrer = document.referrer;
  
  if (!referrer) {
    return "direct";
  }
  
  const referrerUrl = new URL(referrer);
  const currentUrl = new URL(window.location.href);
  
  if (referrerUrl.hostname === currentUrl.hostname) {
    return "internal";
  }
  
  // Check for common social media sources
  if (referrer.includes("tiktok")) return "tiktok";
  if (referrer.includes("instagram")) return "instagram";
  if (referrer.includes("facebook")) return "facebook";
  if (referrer.includes("twitter") || referrer.includes("t.co")) return "twitter";
  if (referrer.includes("youtube")) return "youtube";
  if (referrer.includes("linkedin")) return "linkedin";
  
  // Check for search engines
  if (referrer.includes("google")) return "google";
  if (referrer.includes("bing")) return "bing";
  if (referrer.includes("baidu")) return "baidu";
  
  return referrerUrl.hostname;
}

export interface TrackPageViewParams {
  pageType: "city" | "triplist" | "venue" | "guide" | "membership" | "groupup" | "home" | "other";
  pagePath: string;
  referenceId?: string;
  referenceTitle?: string;
}

export async function trackPageView(params: TrackPageViewParams): Promise<void> {
  try {
    const pageViewData = {
      pageType: params.pageType,
      pagePath: params.pagePath,
      visitorId: getOrCreateVisitorId(),
      sessionId: getOrCreateSessionId(),
      deviceType: getDeviceType(),
      trafficSource: getTrafficSource(),
      referenceId: params.referenceId || null,
      referenceTitle: params.referenceTitle || null,
    };
    
    await apiRequest("POST", "/api/analytics/track", pageViewData);
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}
