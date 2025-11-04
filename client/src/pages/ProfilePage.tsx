import { useMutation } from "@tanstack/react-query";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { User as UserIcon, Mail, Shield, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.user_metadata?.full_name || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: data.fullName },
      });
      if (error) throw error;
    },
    onSuccess: () => {
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
      if (!user) throw new Error("Not authenticated");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      return { avatarUrl: publicUrl };
    },
    onSuccess: () => {
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

  const handleLogout = async () => {
    await signOut();
    setLocation('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Not logged in</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
            <Button onClick={() => setLocation('/auth')} data-testid="button-login">Sign In</Button>
          </div>
        </Card>
      </div>
    );
  }

  const getUserInitials = () => {
    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ');
      return names.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
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
                  <AvatarImage src={avatarPreview || user.user_metadata?.avatar_url || undefined} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h2 className="text-xl font-semibold mb-1" data-testid="text-user-name">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4" data-testid="text-user-email">{user.email}</p>

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
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  data-testid="input-full-name"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                  data-testid="input-email-readonly"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Login Provider
                </Label>
                <div data-testid="text-auth-provider">
                  <Badge variant="outline" className="text-sm">
                    {user.app_metadata?.provider || "email"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
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
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleLogout}
                  className="ml-auto"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
