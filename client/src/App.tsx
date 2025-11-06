import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";
import CitiesPage from "@/pages/CitiesPage";
import CityDetailPage from "@/pages/CityDetailPage";
import TriplistsPage from "@/pages/TriplstsPage";
import TriplistDetailPage from "@/pages/TriplistDetailPage";
import VenueDetailPage from "@/pages/VenueDetailPage";
import GroupUpsPage from "@/pages/GroupUpsPage";
import GuidesPage from "@/pages/GuidesPage";
import GuideDetailPage from "@/pages/GuideDetailPage";
import MembershipPage from "@/pages/MembershipPage";
import ProfilePage from "@/pages/ProfilePage";
import ChatAssistantComingSoon from "@/pages/ChatAssistantComingSoon";
import AdminLayout from "@/pages/admin/AdminLayout";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "@/pages/not-found";

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
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
