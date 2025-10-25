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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function VenuesManagement() {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
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

  const onSubmit = (values: InsertVenue) => {
    createVenue.mutate(values);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-venue">
              <Plus className="w-4 h-4 mr-2" />
              Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Venue</DialogTitle>
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
                            form.setValue("slug", generateSlug(e.target.value));
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
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
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
                    onClick={() => setOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createVenue.isPending} data-testid="button-submit">
                    {createVenue.isPending ? "Creating..." : "Create Venue"}
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
              <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>
              <p className="text-sm text-muted-foreground">{venue.location}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
