import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Branding } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const brandingSchema = z.object({
  appName: z.string().min(1, "App name is required"),
  appSubtitle: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

export default function BrandingSettings() {
  const { toast } = useToast();

  const { data: branding, isLoading } = useQuery<Branding>({
    queryKey: ["/api/branding"],
  });

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    values: branding ? {
      appName: branding.appName,
      appSubtitle: branding.appSubtitle || "",
      logoUrl: branding.logoUrl || "",
    } : undefined,
  });

  const updateBranding = useMutation({
    mutationFn: async (data: BrandingFormData) => {
      return apiRequest("PUT", "/api/branding", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
      toast({
        title: "Success",
        description: "Branding settings updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update branding settings.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BrandingFormData) => {
    updateBranding.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-muted rounded w-1/4 mb-4 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="page-title-branding">
          Branding & Identity
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your application's logo, name, and subtitle.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Identity</CardTitle>
          <CardDescription>
            These settings appear in the header, footer, and login page across your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="appName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="PandaHoHo"
                        data-testid="input-app-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Subtitle</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Independent Travel Assistant"
                        data-testid="input-app-subtitle"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://res.cloudinary.com/..."
                        data-testid="input-logo-url"
                      />
                    </FormControl>
                    <FormDescription>
                      <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                        <p className="font-medium mb-1">Important: Your logo image should be:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Square format (1:1 aspect ratio) for best results</li>
                          <li>High resolution (at least 512x512 pixels)</li>
                          <li>Hosted on a reliable CDN or image service</li>
                          <li>Accessible via HTTPS</li>
                        </ul>
                        <p className="mt-2">This logo will appear in your site header, footer, and login page.</p>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {branding?.logoUrl && (
                <div>
                  <p className="text-sm font-medium mb-2">Logo Preview</p>
                  <div className="p-4 bg-muted rounded-md inline-block">
                    <img
                      src={branding.logoUrl}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain"
                      data-testid="img-logo-preview"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={updateBranding.isPending}
                data-testid="button-save-branding"
              >
                {updateBranding.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
