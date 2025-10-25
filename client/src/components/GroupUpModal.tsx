import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertGroupUpSchema } from "@shared/schema";
import type { InsertGroupUp, Venue } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GroupUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triplistId: string;
  defaultVenueId?: string;
}

const formSchema = insertGroupUpSchema.extend({
  startTime: z.string(),
});

export default function GroupUpModal({
  open,
  onOpenChange,
  triplistId,
  defaultVenueId,
}: GroupUpModalProps) {
  const { toast } = useToast();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const { data: venues = [] } = useQuery<Venue[]>({
    queryKey: ["/api/venues", { triplistId }],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      triplistId,
      venueId: defaultVenueId || "",
      title: "",
      startTime: "",
      meetingPoint: "",
      notes: "",
      participationFee: 0,
    },
  });

  const createGroupUp = useMutation({
    mutationFn: async (data: InsertGroupUp) => {
      return apiRequest("/api/group-ups", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-ups"] });
      toast({
        title: "Success",
        description: "Group-up created successfully!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group-up. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data: InsertGroupUp = {
      ...values,
      startTime: new Date(values.startTime),
    };
    createGroupUp.mutate(data);
  };

  const handleVenueChange = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId);
    setSelectedVenue(venue || null);
    if (venue) {
      form.setValue("meetingPoint", venue.location);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-group-up">
        <DialogHeader>
          <DialogTitle>Create a Group-Up</DialogTitle>
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
                      placeholder="e.g., Afternoon Tea at the Temple"
                      data-testid="input-group-up-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleVenueChange(value);
                    }}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-venue">
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
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
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      data-testid="input-start-time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Point</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Main entrance"
                      data-testid="input-meeting-point"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participation Fee (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ¥
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-8"
                        data-testid="input-participation-fee"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details..."
                      rows={3}
                      data-testid="input-notes"
                      {...field}
                      value={field.value ?? ""}
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
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGroupUp.isPending}
                data-testid="button-submit-group-up"
              >
                {createGroupUp.isPending ? "Creating..." : "Create Group-Up"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
