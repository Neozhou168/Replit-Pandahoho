import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertHashtagSchema, type Hashtag, type InsertHashtag } from "@shared/schema";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Hash } from "lucide-react";

export default function HashtagsManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editHashtag, setEditHashtag] = useState<Hashtag | null>(null);
  const [deleteHashtag, setDeleteHashtag] = useState<Hashtag | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hashtags = [], isLoading } = useQuery<Hashtag[]>({
    queryKey: ["/api/hashtags"],
  });

  const form = useForm<InsertHashtag>({
    resolver: zodResolver(insertHashtagSchema),
    defaultValues: {
      name: "",
      isPromoted: false,
      displayOrder: 0,
      isActive: true,
    },
  });

  const createHashtag = useMutation({
    mutationFn: async (data: InsertHashtag) => {
      const response = await apiRequest("POST", "/api/hashtags", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hashtags"] });
      toast({ title: "Success", description: "Hashtag created!" });
      setCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hashtag",
        variant: "destructive",
      });
    },
  });

  const updateHashtag = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertHashtag> }) => {
      const response = await apiRequest("PUT", `/api/hashtags/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hashtags"] });
      toast({ title: "Success", description: "Hashtag updated!" });
      setEditHashtag(null);
      form.reset();
    },
  });

  const deleteHashtagMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/hashtags/${id}`);
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/hashtags"] });

      // Snapshot the previous value
      const previousHashtags = queryClient.getQueryData<Hashtag[]>(["/api/hashtags"]);

      // Optimistically remove from cache
      if (previousHashtags) {
        queryClient.setQueryData<Hashtag[]>(
          ["/api/hashtags"],
          previousHashtags.filter((h) => h.id !== id)
        );
      }

      return { previousHashtags };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Hashtag deleted!" });
      setDeleteHashtag(null);
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousHashtags) {
        queryClient.setQueryData(["/api/hashtags"], context.previousHashtags);
      }
      toast({
        title: "Error",
        description: "Failed to delete hashtag",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/hashtags"] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, displayOrder }: { id: string; displayOrder: number }) => {
      await apiRequest("PUT", `/api/hashtags/${id}/order`, { displayOrder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hashtags"] });
    },
  });

  const togglePromotedMutation = useMutation({
    mutationFn: async ({ id, isPromoted }: { id: string; isPromoted: boolean }) => {
      console.log(`[togglePromoted] Calling API for ${id}, isPromoted: ${isPromoted}`);
      const response = await apiRequest("PUT", `/api/hashtags/${id}`, { isPromoted });
      return response.json();
    },
    onMutate: async (variables) => {
      console.log(`[togglePromoted onMutate] id: ${variables.id}, isPromoted: ${variables.isPromoted}`);
      
      // Cancel outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/hashtags"] });

      // Snapshot the previous value
      const previousHashtags = queryClient.getQueryData<Hashtag[]>(["/api/hashtags"]);
      console.log(`[togglePromoted onMutate] Previous hashtags count: ${previousHashtags?.length}`);

      // Optimistically update the cache
      if (previousHashtags) {
        const updated = previousHashtags.map((h) =>
          h.id === variables.id ? { ...h, isPromoted: variables.isPromoted } : h
        );
        console.log(`[togglePromoted onMutate] Setting query data, updated hashtag:`, updated.find(h => h.id === variables.id));
        queryClient.setQueryData<Hashtag[]>(["/api/hashtags"], updated);
      }

      return { previousHashtags };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousHashtags) {
        queryClient.setQueryData(["/api/hashtags"], context.previousHashtags);
      }
      console.error("Failed to toggle promoted status:", error);
      toast({
        title: "Error",
        description: "Failed to toggle promoted status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/hashtags"] });
    },
  });

  const togglePromoted = (hashtagId: string) => {
    // Get the current value from cache to avoid stale closures
    const currentHashtags = queryClient.getQueryData<Hashtag[]>(["/api/hashtags"]);
    const currentHashtag = currentHashtags?.find(h => h.id === hashtagId);
    
    if (!currentHashtag) {
      console.error(`[togglePromoted] Hashtag ${hashtagId} not found in cache`);
      return;
    }
    
    const newValue = !currentHashtag.isPromoted;
    console.log(`[togglePromoted] Toggling ${currentHashtag.name} from ${currentHashtag.isPromoted} to ${newValue}`);
    
    togglePromotedMutation.mutate({
      id: hashtagId,
      isPromoted: newValue,
    });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === hashtags.length - 1) return;

    const currentItem = hashtags[index];
    const swapItem = hashtags[direction === "up" ? index - 1 : index + 1];

    updateOrderMutation.mutate({ id: currentItem.id, displayOrder: swapItem.displayOrder ?? 0 });
    updateOrderMutation.mutate({ id: swapItem.id, displayOrder: currentItem.displayOrder ?? 0 });
  };

  const handleSubmit = (data: InsertHashtag) => {
    if (editHashtag) {
      updateHashtag.mutate({ id: editHashtag.id, data });
    } else {
      createHashtag.mutate(data);
    }
  };

  const handleEdit = (hashtag: Hashtag) => {
    setEditHashtag(hashtag);
    form.reset({
      name: hashtag.name,
      isPromoted: hashtag.isPromoted ?? false,
      displayOrder: hashtag.displayOrder ?? 0,
      isActive: hashtag.isActive ?? true,
    });
  };

  const promotedCount = hashtags.filter(h => h.isPromoted).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hashtag Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage hashtags and control which appear in category filters
          </p>
        </div>
        <Dialog open={createOpen || !!editHashtag} onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditHashtag(null);
            form.reset();
          } else if (!editHashtag) {
            setCreateOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-hashtag">
              <Plus className="w-4 h-4 mr-2" />
              Add Hashtag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editHashtag ? "Edit Hashtag" : "Create Hashtag"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-hashtag-name" placeholder="e.g., Nightlife" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPromoted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Promoted</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show in category filter bar on browse page
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-hashtag-promoted"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          value={field.value ?? 0}
                          data-testid="input-hashtag-order"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" data-testid="button-save-hashtag" className="w-full">
                  {editHashtag ? "Update" : "Create"} Hashtag
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{hashtags.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Promoted (Filter Bar)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{promotedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading hashtags...</p>
          ) : hashtags.length === 0 ? (
            <p className="text-muted-foreground">No hashtags yet. Create one to get started.</p>
          ) : (
            <div className="space-y-2">
              {hashtags.map((hashtag, index) => (
                <div
                  key={hashtag.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover-elevate"
                  data-testid={`hashtag-item-${hashtag.id}`}
                >
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium flex-1">{hashtag.name}</span>
                  
                  {hashtag.isPromoted && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Promoted
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      data-testid={`button-move-up-${hashtag.id}`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(index, "down")}
                      disabled={index === hashtags.length - 1}
                      data-testid={`button-move-down-${hashtag.id}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    <Switch
                      checked={hashtag.isPromoted ?? false}
                      onCheckedChange={() => togglePromoted(hashtag.id)}
                      data-testid={`switch-promoted-${hashtag.id}`}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(hashtag)}
                      data-testid={`button-edit-${hashtag.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteHashtag(hashtag)}
                      data-testid={`button-delete-${hashtag.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteHashtag} onOpenChange={() => setDeleteHashtag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hashtag?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteHashtag?.name}"? This will remove the hashtag from all triplists that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteHashtag && deleteHashtagMutation.mutate(deleteHashtag.id)}
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
