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

  const form = useForm<InsertVenue>({
    resolver: zodResolver(insertVenueSchema),
    defaultValues: {
      name: "",
      slug: "",
      cityId: "",
      category: "",
      description: "",
      imageUrl: "",
      location: "",
      highlights: [],
      proTips: "",
      googleMapsUrl: "",
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
      description: venue.description,
      imageUrl: venue.imageUrl,
      location: venue.location,
      highlights: venue.highlights || [],
      proTips: venue.proTips || "",
      googleMapsUrl: venue.googleMapsUrl || "",
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
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({
        title: "Success",
        description: `${response.count} venues imported successfully!`,
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
              name: "Summer Palace",
              slug: "summer-palace",
              description: "Imperial garden with stunning lake views and pavilions",
              location: "Beijing, China",
              imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
              cityId: "city-id-here",
              category: "Historical Site",
              highlights: "Imperial Architecture,Kunming Lake,Garden Design",
              proTips: "Visit early morning to avoid crowds",
              googleMapsUrl: "https://maps.google.com/...",
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
              cityId: row.cityId || undefined,
              category: row.category || undefined,
              highlights: row.highlights ? row.highlights.split(",").map((h: string) => h.trim()).filter((h: string) => h) : undefined,
              proTips: row.proTips || undefined,
              googleMapsUrl: row.googleMapsUrl || undefined,
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Summer Palace"
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="summer-palace" {...field} data-testid="input-venue-slug" />
                      </FormControl>
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
                            <SelectValue placeholder="Select a city" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Historical Site" {...field} value={field.value || ""} data-testid="input-venue-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Beijing, China" {...field} data-testid="input-venue-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter venue description..."
                          {...field}
                          rows={4}
                          data-testid="textarea-venue-description"
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
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
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
                  name="googleMapsUrl"
                  render={({ field}) => (
                    <FormItem>
                      <FormLabel>Google Maps URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://maps.google.com/..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-venue-maps-url"
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
                      <FormLabel>Pro Tips (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Best time to visit, tips for tourists..."
                          {...field}
                          value={field.value || ""}
                          rows={3}
                          data-testid="textarea-venue-pro-tips"
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
