import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVenueSchema } from "@shared/schema";
import type { InsertVenue, Venue, City } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CSVImport } from "@/components/CSVImport";
import type { ContentCountry } from "@shared/schema";

export default function VenuesManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [deleteVenue, setDeleteVenue] = useState<Venue | null>(null);
  const { toast } = useToast();

  const { data: venues = [], isLoading } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const { data: countries = [] } = useQuery<ContentCountry[]>({
    queryKey: ["/api/content/countries"],
  });

  const form = useForm<InsertVenue>({
    resolver: zodResolver(insertVenueSchema),
    defaultValues: {
      name: "",
      slug: "",
      cityId: "",
      category: "",
      country: "China",
      description: "",
      imageUrl: "",
      videoUrl: "",
      location: "",
      highlights: [],
      proTips: "",
      googleMapsUrl: "",
      googleMapsEmbedUrl: "",
      googleMapsDirectUrl: "",
      isActive: true,
    },
  });

  const createVenue = useMutation({
    mutationFn: async (data: InsertVenue) => {
      return apiRequest("/api/venues", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Success",
        description: "Venue created successfully!",
      });
      setCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create venue.",
        variant: "destructive",
      });
    },
  });

  const updateVenue = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertVenue }) => {
      return apiRequest(`/api/venues/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Success",
        description: "Venue updated successfully!",
      });
      setEditVenue(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update venue.",
        variant: "destructive",
      });
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/venues/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Success",
        description: "Venue deleted successfully!",
      });
      setDeleteVenue(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete venue.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InsertVenue) => {
    if (editVenue) {
      updateVenue.mutate({ id: editVenue.id, data: values });
    } else {
      createVenue.mutate(values);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleEdit = (venue: Venue) => {
    setEditVenue(venue);
    form.reset({
      name: venue.name,
      slug: venue.slug,
      cityId: venue.cityId,
      category: venue.category || "",
      country: venue.country || "China",
      description: venue.description,
      imageUrl: venue.imageUrl,
      videoUrl: venue.videoUrl || "",
      location: venue.location,
      highlights: venue.highlights || [],
      proTips: venue.proTips || "",
      googleMapsUrl: venue.googleMapsUrl || "",
      googleMapsEmbedUrl: venue.googleMapsEmbedUrl || "",
      googleMapsDirectUrl: venue.googleMapsDirectUrl || "",
      isActive: venue.isActive,
    });
  };

  const handleCloseDialog = () => {
    setCreateOpen(false);
    setEditVenue(null);
    form.reset();
  };

  const handleBulkImport = async (data: InsertVenue[]) => {
    try {
      const response = await apiRequest("/api/venues/bulk", "POST", data);
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Success",
        description: `${result.count} venues imported successfully!`,
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Venues Management
          </h1>
          <p className="text-muted-foreground">
            Manage specific locations and attractions
          </p>
        </div>

        <div className="flex gap-3">
          <CSVImport
            onImport={handleBulkImport}
            templateData={{
              name: "🏛️ Huanghuacheng Lakeside Great Wall | 黄花城水长城",
              slug: "huanghuacheng-great-wall",
              description: "The Huanghuacheng Lakeside Great Wall where ancient stone walls meet tranquil blue water.\n💰 Average Spend\n🏛️ RMB 60–100\n💵 USD 8–14",
              location: "Beijing, China",
              imageUrl: "https://res.cloudinary.com/...",
              videoUrl: "",
              cityId: "city-id-here",
              category: "Hiking",
              country: "China",
              highlights: ["Imperial Architecture", "Kunming Lake", "Garden Design"],
              proTips: "🚗 Transportation: About 2 hours from Beijing\n🏕️ Experience: Take a boat ride to see the wall reflected in the lake",
              googleMapsUrl: "",
              googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=...",
              googleMapsDirectUrl: "https://maps.app.goo.gl/...",
              isActive: true,
            }}
            templateFilename="venues-template.csv"
            requiredColumns={["name", "slug", "description", "location", "imageUrl"]}
            validateRow={(row) => {
              const errors: string[] = [];
              if (!row.name || row.name.trim() === "") errors.push("Name is required");
              if (!row.slug || row.slug.trim() === "") errors.push("Slug is required");
              if (!row.description || row.description.trim() === "") errors.push("Description is required");
              if (!row.location || row.location.trim() === "") errors.push("Location is required");
              if (!row.imageUrl || row.imageUrl.trim() === "") errors.push("Image URL is required");
              return { valid: errors.length === 0, errors };
            }}
            transformRow={(row) => ({
              name: row.name,
              slug: row.slug,
              description: row.description,
              location: row.location,
              imageUrl: row.imageUrl,
              videoUrl: row.videoUrl || undefined,
              cityId: row.cityId || undefined,
              category: row.category || undefined,
              country: row.country || "China",
              highlights: row.highlights ? row.highlights.split(",").map((h: string) => h.trim()).filter((h: string) => h) : undefined,
              proTips: row.proTips || undefined,
              googleMapsUrl: row.googleMapsUrl || undefined,
              googleMapsEmbedUrl: row.googleMapsEmbedUrl || undefined,
              googleMapsDirectUrl: row.googleMapsDirectUrl || undefined,
              isActive: row.isActive === "true" || row.isActive === true || row.isActive === "1",
            })}
            title="Import Venues CSV"
            description="Upload a CSV file to bulk import venues. Use comma-separated values for highlights."
          />

          <Dialog open={createOpen || editVenue !== null} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setCreateOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-venue">
                <Plus className="w-4 h-4 mr-2" />
                Add Venue
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-venue">
            <DialogHeader>
              <DialogTitle>
                {editVenue ? "Edit Venue" : "Create New Venue"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {editVenue && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Venue ID</div>
                      <div className="font-mono text-sm">{editVenue.id}</div>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(editVenue.id)}
                      data-testid="button-copy-venue-id"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </Button>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="🏛️ Huanghuacheng Lakeside Great Wall | 黄花城水长城"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!editVenue) {
                              form.setValue("slug", generateSlug(e.target.value));
                            }
                          }}
                          data-testid="input-venue-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://res.cloudinary.com/..."
                          {...field}
                          data-testid="input-venue-image-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/embed/..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-venue-video-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-venue-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Hiking">Hiking</SelectItem>
                            <SelectItem value="Historical Site">Historical Site</SelectItem>
                            <SelectItem value="Nature">Nature</SelectItem>
                            <SelectItem value="Cultural">Cultural</SelectItem>
                            <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                            <SelectItem value="Shopping">Shopping</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-venue-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries
                              .filter((country) => country.isActive)
                              .map((country) => (
                                <SelectItem key={country.id} value={country.name}>
                                  {country.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-venue-city">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {cities.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Found {cities.length} cities for China
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Include emojis for formatting:&#10;💰 Average Spend&#10;🏛️ RMB 60–100&#10;💵 USD 8–14"
                          {...field}
                          rows={8}
                          data-testid="textarea-venue-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proTips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tips</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Include emojis:&#10;🚗 Transportation: About 2 hours from Beijing&#10;🏕️ Experience: Take a boat ride to see the wall"
                          {...field}
                          value={field.value || ""}
                          rows={5}
                          data-testid="textarea-venue-tips"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleMapsEmbedUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Maps Embed URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.google.com/maps/embed?pb=..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-venue-maps-embed-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleMapsDirectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Maps Direct URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://maps.app.goo.gl/..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-venue-maps-direct-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createVenue.isPending || updateVenue.isPending}
                    data-testid="button-submit"
                  >
                    {createVenue.isPending || updateVenue.isPending
                      ? "Saving..."
                      : editVenue
                      ? "Update Venue"
                      : "Create Venue"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    {isLoading ? (
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-venues">
            No venues created yet. Click "Add Venue" to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden p-6" data-testid={`card-venue-${venue.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground">{venue.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(venue)}
                    data-testid={`button-edit-venue-${venue.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteVenue(venue)}
                    data-testid={`button-delete-venue-${venue.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteVenue !== null} onOpenChange={(open) => !open && setDeleteVenue(null)}>
        <AlertDialogContent data-testid="dialog-delete-venue">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Venue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteVenue?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVenue && deleteVenueMutation.mutate(deleteVenue.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
