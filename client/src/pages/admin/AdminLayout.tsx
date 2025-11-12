import { useQuery } from "@tanstack/react-query";
import { Route, Switch, Redirect } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MapPin,
  List,
  FileText,
  Users,
  Image,
  ArrowLeft,
  Settings,
  Palette,
  BarChart,
  Search,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import AdminDashboard from "./AdminDashboard";
import CitiesManagement from "./CitiesManagement";
import CarouselManagement from "./CarouselManagement";
import TriplistsManagement from "./TriplstsManagement";
import VenuesManagement from "./VenuesManagement";
import GuidesManagement from "./GuidesManagement";
import GroupUpsManagement from "./GroupUpsManagement";
import UsersManagement from "./UsersManagement";
import ContentSettings from "./ContentSettings";
import BrandingSettings from "./BrandingSettings";
import Analytics from "./Analytics";
import SEOManagement from "./SEOManagement";
import type { User } from "@shared/schema";

function AdminSidebar() {
  const [location] = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Cities",
      url: "/admin/cities",
      icon: MapPin,
    },
    {
      title: "Triplists",
      url: "/admin/triplists",
      icon: List,
    },
    {
      title: "Venues",
      url: "/admin/venues",
      icon: MapPin,
    },
    {
      title: "Survival Guides",
      url: "/admin/guides",
      icon: FileText,
    },
    {
      title: "Group-Ups",
      url: "/admin/group-ups",
      icon: Users,
    },
    {
      title: "Carousel",
      url: "/admin/carousel",
      icon: Image,
    },
    {
      title: "Branding",
      url: "/admin/branding",
      icon: Palette,
    },
    {
      title: "SEO",
      url: "/admin/seo",
      icon: Search,
    },
    {
      title: "Content Settings",
      url: "/admin/content-settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link href="/">
              <SidebarMenuButton className="mb-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Site</span>
              </SidebarMenuButton>
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return <Redirect to="/" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <main className="p-8">
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/analytics" component={Analytics} />
              <Route path="/admin/users" component={UsersManagement} />
              <Route path="/admin/cities" component={CitiesManagement} />
              <Route path="/admin/carousel" component={CarouselManagement} />
              <Route path="/admin/triplists" component={TriplistsManagement} />
              <Route path="/admin/venues" component={VenuesManagement} />
              <Route path="/admin/guides" component={GuidesManagement} />
              <Route path="/admin/group-ups" component={GroupUpsManagement} />
              <Route path="/admin/branding" component={BrandingSettings} />
              <Route path="/admin/seo" component={SEOManagement} />
              <Route path="/admin/content-settings" component={ContentSettings} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
