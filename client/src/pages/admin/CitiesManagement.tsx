import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCitySchema } from "@shared/schema";
import type { InsertCity, City, ContentCountry } from "@shared/schema";
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

export default function CitiesManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [deleteCity, setDeleteCity] = useState<City | null>(null);
  const { toast } = useToast();

  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const { data: countries = [] } = useQuery<ContentCountry[]>({
    queryKey: ["/api/content/countries"],
  });

  const form = useForm<InsertCity>({
    resolver: zodResolver(insertCitySchema),
    defaultValues: {
      name: "",
      slug: "",
      tagline: "",
      imageUrl: "",
      triplistCount: 0,
      countryId: "",
      isActive: true,
    },
  });

  const createCity = useMutation({
    mutationFn: async (data: InsertCity) => {
      return apiRequest("POST", "/api/cities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Success",
        description: "City created successfully!",
      });
      setCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create city. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCity = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertCity }) => {
      return apiRequest("PUT", `/api/cities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Success",
        description: "City updated successfully!",
      });
      setEditCity(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update city. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Success",
        description: "City deleted successfully!",
      });
      setDeleteCity(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete city. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBulkImport = async (data: InsertCity[]) => {
    try {
      const response = await apiRequest("POST", "/api/cities/bulk", data);
      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Success",
        description: `${result.count} cities imported successfully!`,
      });
    } catch (error) {
      throw error;
    }
  };

  const onSubmit = (values: InsertCity) => {
    if (editCity) {
      updateCity.mutate({ id: editCity.id, data: values });
    } else {
      createCity.mutate(values);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleEdit = (city: City) => {
    setEditCity(city);
    form.reset({
      name: city.name,
      slug: city.slug,
      tagline: city.tagline || "",
      imageUrl: city.imageUrl,
      triplistCount: city.triplistCount,
      countryId: city.countryId || "",
      isActive: city.isActive,
    });
  };

  const handleCloseDialog = () => {
    setCreateOpen(false);
    setEditCity(null);
    form.reset();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Cities Management
          </h1>
          <p className="text-muted-foreground">
            Manage destinations across China
          </p>
        </div>

        <div className="flex gap-3">
          <CSVImport
            onImport={handleBulkImport}
            templateData={{
              name: "Beijing",
              slug: "beijing",
              tagline: "China's historic capital city",
              imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
              country: "China",
              isActive: true,
            } as any}
            templateFilename="cities-template.csv"
            requiredColumns={["name", "slug", "tagline", "imageUrl", "country"]}
            validateRow={(row) => {
              const errors: string[] = [];
              if (!row.name || row.name.trim() === "") errors.push("Name is required");
              if (!row.slug || row.slug.trim() === "") errors.push("Slug is required");
              if (!row.imageUrl || row.imageUrl.trim() === "") errors.push("Image URL is required");
              if (!row.country || row.country.trim() === "") errors.push("Country is required");
              return { valid: errors.length === 0, errors };
            }}
            transformRow={(row) => {
              // Map country name to ID
              const country = countries.find(
                (c) => c.name.toLowerCase() === row.country?.toLowerCase()
              );
              const countryId = country?.id || countries.find((c) => c.isActive)?.id || "";
              
              return {
                name: row.name,
                slug: row.slug,
                tagline: row.tagline || "",
                imageUrl: row.imageUrl,
                countryId,
                triplistCount: 0,
                isActive: row.isActive === "true" || row.isActive === true,
              };
            }}
            title="Import Cities"
            description="Upload a CSV file to bulk import cities"
          />

          <Dialog open={createOpen || editCity !== null} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setCreateOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-city">
                <Plus className="w-4 h-4 mr-2" />
                Add City
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="modal-city">
            <DialogHeader>
              <DialogTitle>
                {editCity ? "Edit City" : "Create New City"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Beijing"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!editCity) {
                              form.setValue("slug", generateSlug(e.target.value));
                            }
                          }}
                          data-testid="input-city-name"
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
                      <FormLabel>Slug (URL-friendly)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., beijing"
                          {...field}
                          data-testid="input-slug"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries
                            .filter((c) => c.isActive)
                            .map((country) => (
                              <SelectItem key={country.id} value={country.id}>
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
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Ancient capital meets modern metropolis"
                          rows={2}
                          {...field}
                          data-testid="input-tagline"
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
                    disabled={createCity.isPending || updateCity.isPending}
                    data-testid="button-submit-city"
                  >
                    {createCity.isPending || updateCity.isPending
                      ? "Saving..."
                      : editCity
                      ? "Update City"
                      : "Create City"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cities.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-cities">
            No cities created yet. Click "Add City" to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Card key={city.id} className="overflow-hidden" data-testid={`card-city-${city.id}`}>
              <div className="aspect-[4/3] relative">
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2" data-testid={`text-city-name-${city.id}`}>
                  {city.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4" data-testid={`text-city-tagline-${city.id}`}>
                  {city.tagline}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground" data-testid={`text-city-country-${city.id}`}>
                      {countries.find((c) => c.id === city.countryId)?.name || "No country"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {city.triplistCount} triplists
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(city)}
                      data-testid={`button-edit-city-${city.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteCity(city)}
                      data-testid={`button-delete-city-${city.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteCity !== null} onOpenChange={(open) => !open && setDeleteCity(null)}>
        <AlertDialogContent data-testid="dialog-delete-city">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete City</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCity?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCity && deleteCityMutation.mutate(deleteCity.id)}
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
