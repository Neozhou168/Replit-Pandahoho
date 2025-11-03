import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { User as UserIcon, Mail, Shield, Calendar, Upload } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Avatar must be a JPG, PNG, or WebP image",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload avatar");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setAvatarFile(null);
      setAvatarPreview(null);
      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    updateProfileMutation.mutate(data);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Not logged in</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
            <a href="/api/login">
              <Button data-testid="button-login">Sign In</Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  const getUserInitials = () => {
    if (currentUser.firstName) {
      return currentUser.firstName.charAt(0).toUpperCase() + (currentUser.lastName?.charAt(0).toUpperCase() || '');
    }
    return currentUser.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold" data-testid="text-page-title">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 md:col-span-1">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Avatar className="w-32 h-32" data-testid="avatar-profile">
                  <AvatarImage src={avatarPreview || currentUser.profileImageUrl || undefined} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h2 className="text-xl font-semibold mb-1" data-testid="text-user-name">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4" data-testid="text-user-email">{currentUser.email}</p>

              <div className="space-y-2">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleAvatarChange}
                  data-testid="input-avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button variant="outline" size="sm" className="w-full cursor-pointer" asChild data-testid="button-change-avatar">
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Change Avatar
                    </span>
                  </Button>
                </label>
                {avatarFile && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => uploadAvatarMutation.mutate(avatarFile)}
                    disabled={uploadAvatarMutation.isPending}
                    data-testid="button-upload-avatar"
                  >
                    {uploadAvatarMutation.isPending ? "Uploading..." : "Upload Avatar"}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h3 className="text-xl font-semibold mb-6">Profile Information</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    data-testid="input-first-name"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  value={currentUser.email || ""}
                  disabled
                  className="bg-muted"
                  data-testid="input-email-readonly"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <div data-testid="text-user-role">
                    <Badge variant={currentUser.isAdmin ? "default" : "secondary"} className="text-sm">
                      {currentUser.role || (currentUser.isAdmin ? "administrator" : "member")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Login Provider
                  </Label>
                  <div data-testid="text-auth-provider">
                    <Badge variant="outline" className="text-sm">
                      {currentUser.authProvider || "replit"}
                    </Badge>
                  </div>
                </div>
              </div>

              {currentUser.createdAt && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </Label>
                  <div className="text-sm text-muted-foreground" data-testid="text-member-since">
                    {format(new Date(currentUser.createdAt), "MMMM d, yyyy")}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
