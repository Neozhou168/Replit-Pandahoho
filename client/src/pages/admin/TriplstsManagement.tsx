import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTriplistSchema } from "@shared/schema";
import type { InsertTriplist, Triplist, City, ContentCountry, ContentTravelType, ContentSeason, Hashtag } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, Search, Filter, ChevronsUpDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CSVImport } from "@/components/CSVImport";

export default function TriplistsManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTriplist, setEditTriplist] = useState<Triplist | null>(null);
  const [deleteTriplist, setDeleteTriplist] = useState<Triplist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [quickHashtagOpen, setQuickHashtagOpen] = useState(false);
  const [newHashtagName, setNewHashtagName] = useState("");
  const { toast } = useToast();

  const { data: triplists = [], isLoading } = useQuery<Triplist[]>({
    queryKey: ["/api/triplists"],
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const { data: countries = [] } = useQuery<ContentCountry[]>({
    queryKey: ["/api/content/countries"],
  });

  const { data: travelTypes = [] } = useQuery<ContentTravelType[]>({
    queryKey: ["/api/content/travel-types"],
  });

  const { data: seasons = [] } = useQuery<ContentSeason[]>({
    queryKey: ["/api/content/seasons"],
  });

  const { data: hashtags = [] } = useQuery<Hashtag[]>({
    queryKey: ["/api/hashtags"],
  });

  const form = useForm<InsertTriplist>({
    resolver: zodResolver(insertTriplistSchema),
    defaultValues: {
      title: "",
      slug: "",
      cityId: undefined,
      country: undefined,
      category: "",
      season: "",
      description: "",
      location: "",
      imageUrl: "",
      videoUrl: "",
      googleMapsEmbedUrl: "",
      googleMapsDirectUrl: "",
      relatedVenueIds: "",
      hashtagIds: [],
      isActive: true,
    },
  });

  const createTriplist = useMutation({
    mutationFn: async (data: InsertTriplist) => {
      return apiRequest("POST", "/api/triplists", data);
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
      return apiRequest("PUT", `/api/triplists/${id}`, data);
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
      return apiRequest("DELETE", `/api/triplists/${id}`);
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

  const quickCreateHashtag = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/hashtags", {
        name,
        isPromoted: false,
        isActive: true,
        displayOrder: 0,
      });
      return response.json();
    },
    onSuccess: (newHashtag) => {
      queryClient.invalidateQueries({ queryKey: ["/api/hashtags"] });
      toast({
        title: "Success",
        description: `Hashtag "${newHashtag.name}" created!`,
      });
      setQuickHashtagOpen(false);
      setNewHashtagName("");
      
      // Auto-add the new hashtag to the form
      const currentHashtags = form.getValues("hashtagIds") || [];
      form.setValue("hashtagIds", [...currentHashtags, newHashtag.id]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hashtag.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InsertTriplist) => {
    // Convert "NONE" sentinel value to undefined (omit field) for country and cityId
    const transformedValues = { ...values };
    
    // Delete country if it's "NONE", undefined, null, or empty string
    if (!transformedValues.country || transformedValues.country === "NONE") {
      delete transformedValues.country;
    }
    
    // Delete cityId if it's "NONE", undefined, null, or empty string
    if (!transformedValues.cityId || transformedValues.cityId === "NONE") {
      delete transformedValues.cityId;
    }
    
    if (editTriplist) {
      updateTriplist.mutate({ id: editTriplist.id, data: transformedValues });
    } else {
      createTriplist.mutate(transformedValues);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleEdit = async (triplist: Triplist) => {
    setEditTriplist(triplist);
    
    // Fetch hashtags for this triplist
    let triplistHashtagIds: string[] = [];
    try {
      const response = await fetch(`/api/triplists/${triplist.id}/hashtags`);
      if (response.ok) {
        const hashtagsData = await response.json();
        triplistHashtagIds = hashtagsData.map((h: Hashtag) => h.id);
      }
    } catch (error) {
      console.error("Failed to fetch triplist hashtags:", error);
    }
    
    form.reset({
      title: triplist.title,
      slug: triplist.slug,
      cityId: triplist.cityId || "NONE",
      country: triplist.country || "NONE",
      category: triplist.category || "",
      season: triplist.season || "",
      description: triplist.description,
      location: triplist.location,
      imageUrl: triplist.imageUrl,
      videoUrl: triplist.videoUrl || "",
      googleMapsEmbedUrl: triplist.googleMapsEmbedUrl || "",
      googleMapsDirectUrl: triplist.googleMapsDirectUrl || "",
      relatedVenueIds: triplist.relatedVenueIds || "",
      hashtagIds: triplistHashtagIds,
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
      const response = await apiRequest("POST", "/api/triplists/bulk", data);
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

  // Filter triplists by search query and city
  const filteredTriplists = triplists.filter((triplist) => {
    const matchesSearch = searchQuery === "" || 
      triplist.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "all" || triplist.cityId === cityFilter;
    return matchesSearch && matchesCity;
  });

  // Get unique cities for filter dropdown
  const uniqueCities = Array.from(
    new Map(
      triplists
        .filter(t => t.cityId)
        .map(t => {
          const city = cities.find(c => c.id === t.cityId);
          return city ? [city.id, city] : null;
        })
        .filter((entry): entry is [string, City] => entry !== null)
    ).values()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Triplist Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all travel triplists.
          </p>
        </div>

        <div className="flex gap-3">
          <CSVImport
            onImport={handleBulkImport}
            templateData={{
              ID: "",
              Title: "Explore the Great Wall",
              Country: "China",
              City: "Beijing",
              Type: "Hiking",
              "Best Season": "Spring & Autumn",
              "Cover Image URL": "https://res.cloudinary.com/dekytgf4z/image/upload/v1761289894/image.png",
              "Video URL": "",
              "Google Maps Embed URL": "https://www.google.com/maps/d/u/0/embed?mid=1CbLubZqs3slm6Lp3-IPU2bL8NdMxpgw&ehbc=2E312F&noprof=1",
              "Google Maps Direct URL": "https://www.google.com/maps/d/u/0/edit?mid=1CbLubZqs3slm6Lp3-IPU2bL8NdMxpgw&usp=sharing",
              Description: "A Journey Across Beijing's Ancient Mountain Fortresses, from the famous Badaling and scenic Mutianyu, to the wild beauty of Jinshanling and Simatai...",
              "Related Venues": "",
              "Created Date": "",
            } as any}
            templateFilename="triplists-template.csv"
            requiredColumns={["Title", "Cover Image URL", "Description"]}
            validateRow={(row) => {
              const errors: string[] = [];
              if (!row.Title || row.Title.trim() === "") errors.push("Title is required");
              if (!row["Cover Image URL"] || row["Cover Image URL"].trim() === "") errors.push("Cover Image URL is required");
              if (!row.Description || row.Description.trim() === "") errors.push("Description is required");
              return { valid: errors.length === 0, errors };
            }}
            transformRow={(row) => {
              const cityName = row.City?.trim();
              const city = cities.find(c => c.name.toLowerCase() === cityName?.toLowerCase());
              const slug = row.Title ? generateSlug(row.Title) : "";
              
              return {
                id: row.ID || undefined,
                title: row.Title,
                slug: slug,
                description: row.Description,
                location: cityName && row.Country ? `${cityName}, ${row.Country}` : cityName || "",
                imageUrl: row["Cover Image URL"],
                videoUrl: row["Video URL"] || undefined,
                cityId: city?.id || undefined,
                country: row.Country || undefined,
                category: row.Type || undefined,
                season: row["Best Season"] || undefined,
                googleMapsEmbedUrl: row["Google Maps Embed URL"] || undefined,
                googleMapsDirectUrl: row["Google Maps Direct URL"] || undefined,
                relatedVenueIds: row["Related Venues"] || undefined,
                isActive: true,
              };
            }}
            title="Import Triplists CSV"
            description="Upload a CSV file to bulk import triplists. City names will be matched to existing cities."
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-triplist">
            <DialogHeader>
              <DialogTitle>
                {editTriplist ? "Edit Triplist" : "Create New Triplist"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {editTriplist && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Triplist ID</div>
                      <div className="font-mono text-sm">{editTriplist.id}</div>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(editTriplist.id)}
                      data-testid="button-copy-triplist-id"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Explore the Great Wall"
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
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "NONE"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE" data-testid="select-country-multiple">
                              Multiple Countries
                            </SelectItem>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "NONE"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE" data-testid="select-city-multiple">
                              Multiple Cities
                            </SelectItem>
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
                    name="hashtagIds"
                    render={({ field }) => {
                      const allHashtags = hashtags
                        .filter((h) => h.isActive)
                        .sort((a, b) => a.name.localeCompare(b.name));
                      
                      return (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Hashtags</FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setQuickHashtagOpen(true)}
                              className="h-auto py-1 text-xs"
                              data-testid="button-quick-add-hashtag"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Hashtag
                            </Button>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between"
                                  data-testid="button-select-hashtags"
                                >
                                  {field.value && field.value.length > 0
                                    ? `${field.value.length} selected`
                                    : "Select hashtags"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-[680px] p-3" 
                              align="start"
                              side="bottom"
                              sideOffset={5}
                              collisionPadding={20}
                            >
                              <div className="max-h-[500px] overflow-y-auto pr-2">
                                {allHashtags.length > 0 ? (
                                  <div className="grid grid-cols-3 gap-2">
                                    {allHashtags.map((hashtag) => (
                                      <div 
                                        key={hashtag.id} 
                                        className="flex items-center space-x-2 hover-elevate p-2 rounded-md border cursor-pointer"
                                        onClick={() => {
                                          const current = field.value || [];
                                          const isChecked = current.includes(hashtag.id);
                                          if (isChecked) {
                                            field.onChange(current.filter((id) => id !== hashtag.id));
                                          } else {
                                            field.onChange([...current, hashtag.id]);
                                          }
                                        }}
                                      >
                                        <Checkbox
                                          checked={field.value?.includes(hashtag.id)}
                                          onCheckedChange={(checked) => {
                                            const current = field.value || [];
                                            if (checked) {
                                              field.onChange([...current, hashtag.id]);
                                            } else {
                                              field.onChange(current.filter((id) => id !== hashtag.id));
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          data-testid={`checkbox-hashtag-${hashtag.id}`}
                                        />
                                        <label className="text-sm cursor-pointer flex-1 font-medium truncate">
                                          #{hashtag.name}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    No hashtags available
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                                {allHashtags.length} hashtags available • Click any to toggle
                              </div>
                            </PopoverContent>
                          </Popover>
                          {field.value && field.value.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {field.value.map((hashtagId) => {
                                const hashtag = hashtags.find((h) => h.id === hashtagId);
                                return hashtag ? (
                                  <span
                                    key={hashtagId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium"
                                  >
                                    #{hashtag.name}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        field.onChange(field.value?.filter((id) => id !== hashtagId));
                                      }}
                                      className="hover-elevate rounded-sm"
                                      data-testid={`remove-hashtag-${hashtag.id}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best Season to Travel</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-season">
                              <SelectValue placeholder="Select season" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {seasons
                              .filter((season) => season.isActive)
                              .map((season) => (
                                <SelectItem key={season.id} value={season.name}>
                                  {season.name}
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
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://res.cloudinary.com/..."
                            {...field}
                            data-testid="input-image-url"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 Recommended: 1200×800px (3:2 ratio) or larger for best quality across all devices
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="YouTube or direct video URL"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-video-url"
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
                          placeholder="https://www.google.com/maps/d/u/0/embed?mid=..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-maps-embed-url"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">How to get this:</span> Go to Google Maps → Find your location → Share → Embed a map → Copy HTML → Extract the src URL from the iframe tag<br />
                        <span className="font-medium">Example:</span> https://www.google.com/maps/embed?pb=!1m18!1m12...
                      </p>
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
                          placeholder="https://www.google.com/maps/d/u/0/edit?mid=..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-maps-direct-url"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">How to get this:</span> Go to Google Maps → Find your location → Share → Send a link → Copy link<br />
                        <span className="font-medium">Example:</span> https://goo.gl/maps/ABC123 or https://maps.google.com/...
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A Journey Across Beijing's Ancient Mountain Fortresses, from the famous Badaling and scenic Mutianyu, to the wild beauty of Jinshanling and Simatai..."
                          rows={6}
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
                  name="relatedVenueIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Venues</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="68fb2b139430589cdbdd4133, 68fb29d3222a8634aef54601, 68fb28858fc3203a56f40ed9..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-related-venues"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter venue IDs separated by commas. You can find venue IDs in the Venues admin panel.
                      </p>
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

      {/* Search and Filter Section */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by City:</span>
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-city-filter">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap" data-testid="text-showing-count">
            Showing {filteredTriplists.length} of {triplists.length} triplists
          </span>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTriplists.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground" data-testid="text-no-triplists">
            {triplists.length === 0 
              ? "No triplists created yet. Click \"Create New Triplist\" to get started."
              : "No triplists match your search or filter criteria."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredTriplists.map((triplist) => (
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

      <Dialog open={quickHashtagOpen} onOpenChange={setQuickHashtagOpen}>
        <DialogContent data-testid="dialog-quick-add-hashtag">
          <DialogHeader>
            <DialogTitle>Quick Add Hashtag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="hashtag-name" className="text-sm font-medium">
                Hashtag Name
              </label>
              <Input
                id="hashtag-name"
                placeholder="Enter hashtag name"
                value={newHashtagName}
                onChange={(e) => setNewHashtagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newHashtagName.trim()) {
                    quickCreateHashtag.mutate(newHashtagName.trim());
                  }
                }}
                data-testid="input-quick-hashtag-name"
              />
              <p className="text-xs text-muted-foreground">
                This hashtag will be created as non-promoted and automatically added to this triplist.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setQuickHashtagOpen(false);
                  setNewHashtagName("");
                }}
                data-testid="button-cancel-quick-hashtag"
              >
                Cancel
              </Button>
              <Button
                onClick={() => newHashtagName.trim() && quickCreateHashtag.mutate(newHashtagName.trim())}
                disabled={!newHashtagName.trim() || quickCreateHashtag.isPending}
                data-testid="button-save-quick-hashtag"
              >
                {quickCreateHashtag.isPending ? "Creating..." : "Create Hashtag"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
