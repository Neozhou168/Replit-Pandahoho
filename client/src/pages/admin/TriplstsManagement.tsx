import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTriplistSchema } from "@shared/schema";
import type { InsertTriplist, Triplist, City } from "@shared/schema";
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

export default function TriplistsManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTriplist, setEditTriplist] = useState<Triplist | null>(null);
  const [deleteTriplist, setDeleteTriplist] = useState<Triplist | null>(null);
  const { toast } = useToast();

  const { data: triplists = [], isLoading } = useQuery<Triplist[]>({
    queryKey: ["/api/triplists"],
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const form = useForm<InsertTriplist>({
    resolver: zodResolver(insertTriplistSchema),
    defaultValues: {
      title: "",
      slug: "",
      cityId: "",
      category: "",
      season: "",
      description: "",
      location: "",
      imageUrl: "",
      googleMapsEmbedUrl: "",
      isActive: true,
    },
  });

  const createTriplist = useMutation({
    mutationFn: async (data: InsertTriplist) => {
      return apiRequest("/api/triplists", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triplists"] });
      toast({
        title: "Success",
        description: "Triplist created successfully!",
      });
      setCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create triplist.",
        variant: "destructive",
      });
    },
  });

  const updateTriplist = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertTriplist }) => {
      return apiRequest(`/api/triplists/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triplists"] });
      toast({
        title: "Success",
        description: "Triplist updated successfully!",
      });
      setEditTriplist(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update triplist.",
        variant: "destructive",
      });
    },
  });

  const deleteTriplistMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/triplists/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/triplists"] });
      toast({
        title: "Success",
        description: "Triplist deleted successfully!",
      });
      setDeleteTriplist(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete triplist.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InsertTriplist) => {
    if (editTriplist) {
      updateTriplist.mutate({ id: editTriplist.id, data: values });
    } else {
      createTriplist.mutate(values);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleEdit = (triplist: Triplist) => {
    setEditTriplist(triplist);
    form.reset({
      title: triplist.title,
      slug: triplist.slug,
      cityId: triplist.cityId,
      category: triplist.category || "",
      season: triplist.season || "",
      description: triplist.description,
      location: triplist.location,
      imageUrl: triplist.imageUrl,
      googleMapsEmbedUrl: triplist.googleMapsEmbedUrl || "",
      isActive: triplist.isActive,
    });
  };

  const handleCloseDialog = () => {
    setCreateOpen(false);
    setEditTriplist(null);
    form.reset();
  };

  const handleBulkImport = async (data: InsertTriplist[]) => {
    try {
      const response = await apiRequest("/api/triplists/bulk", "POST", data);
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/triplists"] });
      toast({
        title: "Success",
        description: `${result.count} triplists imported successfully!`,
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
            Triplists Management
          </h1>
          <p className="text-muted-foreground">
            Manage curated travel itineraries
          </p>
        </div>

        <div className="flex gap-3">
          <CSVImport
            onImport={handleBulkImport}
            templateData={{
              title: "Beijing's Best Hiking Trails",
              slug: "beijing-best-hiking-trails",
              description: "Explore scenic mountain paths around Beijing",
              location: "Beijing, China",
              imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
              cityId: "city-id-here",
              category: "Hiking",
              season: "Spring & Autumn",
              googleMapsEmbedUrl: "https://www.google.com/maps/embed?...",
              isActive: true,
            }}
            templateFilename="triplists-template.csv"
            requiredColumns={["title", "slug", "description", "location", "imageUrl"]}
            validateRow={(row) => {
              const errors: string[] = [];
              if (!row.title || row.title.trim() === "") errors.push("Title is required");
              if (!row.slug || row.slug.trim() === "") errors.push("Slug is required");
              if (!row.description || row.description.trim() === "") errors.push("Description is required");
              if (!row.location || row.location.trim() === "") errors.push("Location is required");
              if (!row.imageUrl || row.imageUrl.trim() === "") errors.push("Image URL is required");
              return { valid: errors.length === 0, errors };
            }}
            transformRow={(row) => ({
              title: row.title,
              slug: row.slug,
              description: row.description,
              location: row.location,
              imageUrl: row.imageUrl,
              cityId: row.cityId || undefined,
              category: row.category || undefined,
              season: row.season || undefined,
              googleMapsEmbedUrl: row.googleMapsEmbedUrl || undefined,
              isActive: row.isActive === "true" || row.isActive === true || row.isActive === "1",
            })}
            title="Import Triplists CSV"
            description="Upload a CSV file to bulk import triplists"
          />

          <Dialog open={createOpen || editTriplist !== null} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setCreateOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-triplist">
                <Plus className="w-4 h-4 mr-2" />
                Add Triplist
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="modal-triplist">
            <DialogHeader>
              <DialogTitle>
                {editTriplist ? "Edit Triplist" : "Create New Triplist"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Beijing's Best Hiking Trails"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!editTriplist) {
                              form.setValue("slug", generateSlug(e.target.value));
                            }
                          }}
                          data-testid="input-title"
                        />
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
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-city">
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Hiking"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="input-category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Spring & Autumn"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="input-season"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Beijing, China"
                          {...field}
                          data-testid="input-location"
                        />
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
                          placeholder="Describe the triplist..."
                          rows={3}
                          {...field}
                          data-testid="input-description"
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
                          placeholder="https://..."
                          {...field}
                          data-testid="input-image-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
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
                    disabled={createTriplist.isPending || updateTriplist.isPending}
                    data-testid="button-submit"
                  >
                    {createTriplist.isPending || updateTriplist.isPending
                      ? "Saving..."
                      : editTriplist
                      ? "Update Triplist"
                      : "Create Triplist"}
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
      ) : triplists.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-triplists">
            No triplists created yet. Click "Add Triplist" to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {triplists.map((triplist) => (
            <Card key={triplist.id} className="overflow-hidden" data-testid={`card-triplist-${triplist.id}`}>
              <div className="flex gap-6 p-6">
                <div className="w-48 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={triplist.imageUrl}
                    alt={triplist.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" data-testid={`text-title-${triplist.id}`}>
                    {triplist.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {triplist.location} • {triplist.category} • {triplist.season}
                  </p>
                  <p className="text-muted-foreground line-clamp-2">
                    {triplist.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(triplist)}
                    data-testid={`button-edit-triplist-${triplist.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTriplist(triplist)}
                    data-testid={`button-delete-triplist-${triplist.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteTriplist !== null} onOpenChange={(open) => !open && setDeleteTriplist(null)}>
        <AlertDialogContent data-testid="dialog-delete-triplist">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Triplist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTriplist?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTriplist && deleteTriplistMutation.mutate(deleteTriplist.id)}
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
