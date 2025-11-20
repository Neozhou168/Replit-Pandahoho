import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Skeleton } from "@/components/ui/skeleton";

import HomePage from "@/pages/HomePage";
import CitiesPage from "@/pages/CitiesPage";
import TriplistsPage from "@/pages/TriplstsPage";
import GuidesPage from "@/pages/GuidesPage";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

const CityDetailPage = lazy(() => import("@/pages/CityDetailPage"));
const TriplistDetailPage = lazy(() => import("@/pages/TriplistDetailPage"));
const VenueDetailPage = lazy(() => import("@/pages/VenueDetailPage"));
const GuideDetailPage = lazy(() => import("@/pages/GuideDetailPage"));
const GroupUpsPage = lazy(() => import("@/pages/GroupUpsPage"));
const MembershipPage = lazy(() => import("@/pages/MembershipPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChatAssistantComingSoon = lazy(() => import("@/pages/ChatAssistantComingSoon"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));

const PageLoader = () => (
  <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
    <Skeleton className="h-12 w-64 mb-6" />
    <Skeleton className="h-96 w-full" />
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/cities" component={CitiesPage} />
      <Route path="/cities/:slug" component={CityDetailPage} />
      <Route path="/triplists" component={TriplistsPage} />
      <Route path="/triplists/:slug" component={TriplistDetailPage} />
      <Route path="/venues/:slug" component={VenueDetailPage} />
      <Route path="/group-ups" component={GroupUpsPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route path="/guides/:slug" component={GuideDetailPage} />
      <Route path="/membership" component={MembershipPage} />
      <Route path="/chat-assistant" component={ChatAssistantComingSoon} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminLayout} />
      <Route path="/admin/:rest*" component={AdminLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Suspense fallback={<PageLoader />}>
              <Router />
            </Suspense>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
