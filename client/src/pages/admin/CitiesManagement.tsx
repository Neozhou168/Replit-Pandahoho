import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCitySchema } from "@shared/schema";
import type { InsertCity, City } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CitiesManagement() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const form = useForm<InsertCity>({
    resolver: zodResolver(insertCitySchema),
    defaultValues: {
      name: "",
      slug: "",
      tagline: "",
      imageUrl: "",
      triplistCount: 0,
      isActive: true,
    },
  });

  const createCity = useMutation({
    mutationFn: async (data: InsertCity) => {
      return apiRequest("/api/cities", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Success",
        description: "City created successfully!",
      });
      setOpen(false);
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

  const onSubmit = (values: InsertCity) => {
    createCity.mutate(values);
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
            Cities Management
          </h1>
          <p className="text-muted-foreground">
            Manage destinations across China
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-city">
              <Plus className="w-4 h-4 mr-2" />
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="modal-create-city">
            <DialogHeader>
              <DialogTitle>Create New City</DialogTitle>
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
                            form.setValue("slug", generateSlug(e.target.value));
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
                    onClick={() => setOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCity.isPending}
                    data-testid="button-submit-city"
                  >
                    {createCity.isPending ? "Creating..." : "Create City"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                  <span className="text-sm text-muted-foreground">
                    {city.triplistCount} triplists
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-edit-city-${city.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
