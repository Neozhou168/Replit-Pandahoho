import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@shared/schema";

export function useDbUser() {
  const { user: supabaseUser, loading: authLoading } = useAuth();

  const { data: dbUser, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    enabled: !!supabaseUser && !authLoading,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    dbUser,
    isLoading: authLoading || isLoading,
    error,
    refetch,
    isAdmin: dbUser?.isAdmin ?? false,
  };
}
