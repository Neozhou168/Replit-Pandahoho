import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSurvivalGuideSchema } from "@shared/schema";
import type { InsertSurvivalGuide, SurvivalGuide } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function GuidesManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editGuide, setEditGuide] = useState<SurvivalGuide | null>(null);
  const [deleteGuide, setDeleteGuide] = useState<SurvivalGuide | null>(null);
  const { toast } = useToast();

  const { data: guides = [], isLoading } = useQuery<SurvivalGuide[]>({
    queryKey: ["/api/guides"],
  });

  const form = useForm<InsertSurvivalGuide>({
    resolver: zodResolver(insertSurvivalGuideSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      imageUrl: "",
      videoUrl: "",
      hasVideo: false,
      category: "China",
      isActive: true,
    },
  });

  const createGuide = useMutation({
    mutationFn: async (data: InsertSurvivalGuide) => {
      return apiRequest("/api/guides", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({
        title: "Success",
        description: "Survival guide created successfully!",
      });
      setCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create survival guide.",
        variant: "destructive",
      });
    },
  });

  const updateGuide = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertSurvivalGuide }) => {
      return apiRequest(`/api/guides/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({
        title: "Success",
        description: "Survival guide updated successfully!",
      });
      setEditGuide(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update survival guide.",
        variant: "destructive",
      });
    },
  });

  const deleteGuideMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/guides/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({
        title: "Success",
        description: "Survival guide deleted successfully!",
      });
      setDeleteGuide(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete survival guide.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InsertSurvivalGuide) => {
    if (editGuide) {
      updateGuide.mutate({ id: editGuide.id, data: values });
    } else {
      createGuide.mutate(values);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleEdit = (guide: SurvivalGuide) => {
    setEditGuide(guide);
    form.reset({
      title: guide.title,
      slug: guide.slug,
      description: guide.description,
      content: guide.content,
      imageUrl: guide.imageUrl,
      videoUrl: guide.videoUrl || "",
      hasVideo: guide.hasVideo,
      category: guide.category || "China",
      isActive: guide.isActive,
    });
  };

  const handleCloseDialog = () => {
    setCreateOpen(false);
    setEditGuide(null);
    form.reset();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Survival Guides Management
          </h1>
          <p className="text-muted-foreground">
            Manage essential travel tips and guides
          </p>
        </div>

        <Dialog open={createOpen || editGuide !== null} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setCreateOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-guide">
              <Plus className="w-4 h-4 mr-2" />
              Add Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-guide">
            <DialogHeader>
              <DialogTitle>
                {editGuide ? "Edit Survival Guide" : "Create New Survival Guide"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guide Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How to Use WeChat Pay"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!editGuide) {
                              form.setValue("slug", generateSlug(e.target.value));
                            }
                          }}
                          data-testid="input-guide-title"
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
                        <Input placeholder="how-to-use-wechat-pay" {...field} data-testid="input-guide-slug" />
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
                      <FormLabel>Description (Preview Text)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short description for the guide card..."
                          {...field}
                          rows={2}
                          data-testid="textarea-guide-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the complete guide content..."
                          {...field}
                          rows={8}
                          data-testid="textarea-guide-content"
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
                      <FormLabel>Thumbnail Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          data-testid="input-guide-image-url"
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
                      <FormLabel>Video URL (Optional - YouTube Embed)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/embed/..."
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("hasVideo", !!e.target.value);
                          }}
                          data-testid="input-guide-video-url"
                        />
                      </FormControl>
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
                        <Input placeholder="China" {...field} value={field.value || ""} data-testid="input-guide-category" />
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
                    disabled={createGuide.isPending || updateGuide.isPending}
                    data-testid="button-submit"
                  >
                    {createGuide.isPending || updateGuide.isPending
                      ? "Saving..."
                      : editGuide
                      ? "Update Guide"
                      : "Create Guide"}
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
      ) : guides.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-guides">
            No guides created yet. Click "Add Guide" to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {guides.map((guide) => (
            <Card key={guide.id} className="overflow-hidden p-6" data-testid={`card-guide-${guide.id}`}>
              <div className="flex items-start gap-4">
                <img
                  src={guide.imageUrl}
                  alt={guide.title}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{guide.description}</p>
                  {guide.hasVideo && (
                    <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Has Video
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(guide)}
                    data-testid={`button-edit-guide-${guide.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteGuide(guide)}
                    data-testid={`button-delete-guide-${guide.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteGuide !== null} onOpenChange={(open) => !open && setDeleteGuide(null)}>
        <AlertDialogContent data-testid="dialog-delete-guide">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survival Guide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteGuide?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGuide && deleteGuideMutation.mutate(deleteGuide.id)}
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
