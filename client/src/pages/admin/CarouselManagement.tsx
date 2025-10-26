import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CarouselItem, InsertCarouselItem } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CSVImport } from "@/components/CSVImport";

const carouselSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  order: z.number().default(0),
});

type CarouselFormData = z.infer<typeof carouselSchema>;

export default function CarouselManagement() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"],
  });

  const form = useForm<CarouselFormData>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      ctaText: "",
      ctaLink: "",
      order: 0,
    },
  });

  const createItem = useMutation({
    mutationFn: async (data: CarouselFormData) => {
      return apiRequest("/api/carousel", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
      toast({
        title: "Success",
        description: "Carousel item created successfully!",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create carousel item.",
        variant: "destructive",
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/carousel/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
      toast({
        title: "Success",
        description: "Carousel item deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete carousel item.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CarouselFormData) => {
    createItem.mutate(values);
  };

  const handleBulkImport = async (data: InsertCarouselItem[]) => {
    try {
      const response: any = await apiRequest("/api/carousel/bulk", "POST", data);
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
      toast({
        title: "Success",
        description: `${response.count} carousel slides imported successfully!`,
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
            Hero Carousel
          </h1>
          <p className="text-muted-foreground">
            Manage homepage carousel slides
          </p>
        </div>

        <div className="flex gap-3">
          <CSVImport
            onImport={handleBulkImport}
            templateData={{
              title: "Discover Hidden Gems",
              subtitle: "Explore curated travel experiences across China",
              imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
              ctaText: "Explore Now",
              ctaLink: "/triplists",
              order: 1,
              isActive: true,
            }}
            templateFilename="carousel-template.csv"
            requiredColumns={["title", "subtitle", "imageUrl", "order"]}
            validateRow={(row) => {
              const errors: string[] = [];
              if (!row.title || row.title.trim() === "") errors.push("Title is required");
              if (!row.subtitle || row.subtitle.trim() === "") errors.push("Subtitle is required");
              if (!row.imageUrl || row.imageUrl.trim() === "") errors.push("Image URL is required");
              if (!row.order || isNaN(Number(row.order))) errors.push("Order must be a number");
              return { valid: errors.length === 0, errors };
            }}
            transformRow={(row) => ({
              title: row.title,
              subtitle: row.subtitle,
              imageUrl: row.imageUrl,
              ctaText: row.ctaText || undefined,
              ctaLink: row.ctaLink || undefined,
              order: parseInt(row.order, 10),
              isActive: row.isActive === "true" || row.isActive === true || row.isActive === "1",
            })}
            title="Import Carousel Slides CSV"
            description="Upload a CSV file to bulk import carousel slides"
          />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-carousel">
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Carousel Slide</DialogTitle>
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
                          placeholder="e.g., Discover Hidden Gems"
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Explore curated travel experiences across China"
                          rows={2}
                          {...field}
                          data-testid="input-subtitle"
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

                <FormField
                  control={form.control}
                  name="ctaText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA Text (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Explore Now"
                          {...field}
                          data-testid="input-cta-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ctaLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA Link (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="/triplists"
                          {...field}
                          data-testid="input-cta-link"
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
                    disabled={createItem.isPending}
                    data-testid="button-submit"
                  >
                    {createItem.isPending ? "Creating..." : "Create Slide"}
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-items">
            No carousel slides yet. Click "Add Slide" to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden" data-testid={`card-carousel-${item.id}`}>
              <div className="flex gap-6 p-6">
                <div className="w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" data-testid={`text-title-${item.id}`}>
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid={`text-subtitle-${item.id}`}>
                    {item.subtitle}
                  </p>
                  {item.ctaText && (
                    <p className="text-sm text-muted-foreground">
                      CTA: {item.ctaText} → {item.ctaLink}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem.mutate(item.id)}
                  data-testid={`button-delete-${item.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
