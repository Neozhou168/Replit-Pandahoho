import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertContentCountrySchema,
  insertContentTravelTypeSchema,
  insertContentSeasonSchema,
  type InsertContentCountry,
  type ContentCountry,
  type InsertContentTravelType,
  type ContentTravelType,
  type InsertContentSeason,
  type ContentSeason,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ContentSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage dropdown options used throughout the platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountriesSection />
        <TravelTypesSection />
        <SeasonsSection />
      </div>
    </div>
  );
}

function CountriesSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCountry, setEditCountry] = useState<ContentCountry | null>(null);
  const [deleteCountry, setDeleteCountry] = useState<ContentCountry | null>(null);
  const { toast } = useToast();

  const { data: countries = [] } = useQuery<ContentCountry[]>({
    queryKey: ["/api/content/countries"],
  });

  const form = useForm<InsertContentCountry>({
    resolver: zodResolver(insertContentCountrySchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  });

  const createCountry = useMutation({
    mutationFn: async (data: InsertContentCountry) => {
      const response = await apiRequest("POST", "/api/content/countries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/countries"] });
      toast({ title: "Success", description: "Country created!" });
      setCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create country",
        variant: "destructive",
      });
    },
  });

  const updateCountry = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertContentCountry }) => {
      const response = await apiRequest("PUT", `/api/content/countries/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/countries"] });
      toast({ title: "Success", description: "Country updated!" });
      setEditCountry(null);
      form.reset();
    },
  });

  const deleteCountryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/content/countries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/countries"] });
      toast({ title: "Success", description: "Country deleted!" });
      setDeleteCountry(null);
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Countries</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-country">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Country</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createCountry.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., China" data-testid="input-country-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>Show in dropdowns</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          data-testid="switch-country-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCountry.isPending} data-testid="button-submit">
                    {createCountry.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {countries.map((country) => (
            <div key={country.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`country-item-${country.id}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{country.name}</span>
                <Badge variant={country.isActive ? "default" : "secondary"} data-testid={`badge-country-status-${country.id}`}>
                  {country.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditCountry(country);
                    form.reset(country);
                  }}
                  data-testid={`button-edit-country-${country.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteCountry(country)}
                  data-testid={`button-delete-country-${country.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {countries.length === 0 && (
            <p className="text-muted-foreground text-center py-6">No countries configured</p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editCountry} onOpenChange={(open) => !open && setEditCountry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Country</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => editCountry && updateCountry.mutate({ id: editCountry.id, data }))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., China" data-testid="input-edit-country-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Show in dropdowns</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-country-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditCountry(null)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCountry.isPending} data-testid="button-submit-edit">
                  {updateCountry.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteCountry} onOpenChange={(open) => !open && setDeleteCountry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Country</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCountry?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCountry && deleteCountryMutation.mutate(deleteCountry.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function TravelTypesSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editType, setEditType] = useState<ContentTravelType | null>(null);
  const [deleteType, setDeleteType] = useState<ContentTravelType | null>(null);
  const { toast } = useToast();

  const { data: travelTypes = [] } = useQuery<ContentTravelType[]>({
    queryKey: ["/api/content/travel-types"],
  });

  const form = useForm<InsertContentTravelType>({
    resolver: zodResolver(insertContentTravelTypeSchema),
    defaultValues: {
      name: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const createType = useMutation({
    mutationFn: async (data: InsertContentTravelType) => {
      const response = await apiRequest("POST", "/api/content/travel-types", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/travel-types"] });
      toast({ title: "Success", description: "Travel type created!" });
      setCreateOpen(false);
      form.reset();
    },
  });

  const updateType = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertContentTravelType }) => {
      const response = await apiRequest("PUT", `/api/content/travel-types/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/travel-types"] });
      toast({ title: "Success", description: "Travel type updated!" });
      setEditType(null);
      form.reset();
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/content/travel-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/travel-types"] });
      toast({ title: "Success", description: "Travel type deleted!" });
      setDeleteType(null);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, displayOrder }: { id: string; displayOrder: number }) => {
      const response = await apiRequest("PUT", `/api/content/travel-types/${id}/order`, { displayOrder });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/travel-types"] });
    },
  });

  const moveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === travelTypes.length - 1) return;

    const currentItem = travelTypes[index];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const swapItem = travelTypes[swapIndex];

    updateOrderMutation.mutate({ id: currentItem.id, displayOrder: swapItem.displayOrder ?? 0 });
    updateOrderMutation.mutate({ id: swapItem.id, displayOrder: currentItem.displayOrder ?? 0 });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Travel Types</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-travel-type">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Travel Type</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createType.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Hiking" data-testid="input-travel-type-name" />
                      </FormControl>
                      <FormMessage />
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-travel-type-order"
                        />
                      </FormControl>
                      <FormDescription>Lower numbers appear first</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>Show in dropdowns</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          data-testid="switch-travel-type-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createType.isPending} data-testid="button-submit">
                    {createType.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {travelTypes.map((type, index) => (
            <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`travel-type-item-${type.id}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{type.name}</span>
                <Badge variant={type.isActive ? "default" : "secondary"} data-testid={`badge-travel-type-status-${type.id}`}>
                  {type.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  data-testid={`button-move-up-${type.id}`}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === travelTypes.length - 1}
                  data-testid={`button-move-down-${type.id}`}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditType(type);
                    form.reset(type);
                  }}
                  data-testid={`button-edit-travel-type-${type.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteType(type)}
                  data-testid={`button-delete-travel-type-${type.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {travelTypes.length === 0 && (
            <p className="text-muted-foreground text-center py-6">No travel types configured</p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editType} onOpenChange={(open) => !open && setEditType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Travel Type</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => editType && updateType.mutate({ id: editType.id, data }))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Hiking" data-testid="input-edit-travel-type-name" />
                    </FormControl>
                    <FormMessage />
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
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-edit-travel-type-order"
                      />
                    </FormControl>
                    <FormDescription>Lower numbers appear first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Show in dropdowns</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-travel-type-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditType(null)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateType.isPending} data-testid="button-submit-edit">
                  {updateType.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteType} onOpenChange={(open) => !open && setDeleteType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Travel Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteType?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteType && deleteTypeMutation.mutate(deleteType.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function SeasonsSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editSeason, setEditSeason] = useState<ContentSeason | null>(null);
  const [deleteSeason, setDeleteSeason] = useState<ContentSeason | null>(null);
  const { toast } = useToast();

  const { data: seasons = [] } = useQuery<ContentSeason[]>({
    queryKey: ["/api/content/seasons"],
  });

  const form = useForm<InsertContentSeason>({
    resolver: zodResolver(insertContentSeasonSchema),
    defaultValues: {
      name: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const createSeason = useMutation({
    mutationFn: async (data: InsertContentSeason) => {
      const response = await apiRequest("POST", "/api/content/seasons", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/seasons"] });
      toast({ title: "Success", description: "Season created!" });
      setCreateOpen(false);
      form.reset();
    },
  });

  const updateSeason = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertContentSeason }) => {
      const response = await apiRequest("PUT", `/api/content/seasons/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/seasons"] });
      toast({ title: "Success", description: "Season updated!" });
      setEditSeason(null);
      form.reset();
    },
  });

  const deleteSeasonMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/content/seasons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/seasons"] });
      toast({ title: "Success", description: "Season deleted!" });
      setDeleteSeason(null);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, displayOrder }: { id: string; displayOrder: number }) => {
      const response = await apiRequest("PUT", `/api/content/seasons/${id}/order`, { displayOrder });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/seasons"] });
    },
  });

  const moveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === seasons.length - 1) return;

    const currentItem = seasons[index];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const swapItem = seasons[swapIndex];

    updateOrderMutation.mutate({ id: currentItem.id, displayOrder: swapItem.displayOrder ?? 0 });
    updateOrderMutation.mutate({ id: swapItem.id, displayOrder: currentItem.displayOrder ?? 0 });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Seasons</CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-season">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Season</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createSeason.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Spring & Autumn" data-testid="input-season-name" />
                      </FormControl>
                      <FormMessage />
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-season-order"
                        />
                      </FormControl>
                      <FormDescription>Lower numbers appear first</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>Show in dropdowns</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          data-testid="switch-season-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSeason.isPending} data-testid="button-submit">
                    {createSeason.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {seasons.map((season, index) => (
            <div key={season.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`season-item-${season.id}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{season.name}</span>
                <Badge variant={season.isActive ? "default" : "secondary"} data-testid={`badge-season-status-${season.id}`}>
                  {season.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  data-testid={`button-move-up-${season.id}`}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === seasons.length - 1}
                  data-testid={`button-move-down-${season.id}`}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditSeason(season);
                    form.reset(season);
                  }}
                  data-testid={`button-edit-season-${season.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteSeason(season)}
                  data-testid={`button-delete-season-${season.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {seasons.length === 0 && (
            <p className="text-muted-foreground text-center py-6">No seasons configured</p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editSeason} onOpenChange={(open) => !open && setEditSeason(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Season</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => editSeason && updateSeason.mutate({ id: editSeason.id, data }))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Spring & Autumn" data-testid="input-edit-season-name" />
                    </FormControl>
                    <FormMessage />
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
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-edit-season-order"
                      />
                    </FormControl>
                    <FormDescription>Lower numbers appear first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Show in dropdowns</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-season-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditSeason(null)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSeason.isPending} data-testid="button-submit-edit">
                  {updateSeason.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteSeason} onOpenChange={(open) => !open && setDeleteSeason(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Season</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteSeason?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSeason && deleteSeasonMutation.mutate(deleteSeason.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
