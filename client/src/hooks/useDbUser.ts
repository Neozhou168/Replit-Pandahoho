import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@shared/schema";
import { useEffect } from "react";

export function useDbUser() {
  const { user: supabaseUser, loading: authLoading } = useAuth();

  const { data: dbUser, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    enabled: !!supabaseUser && !authLoading,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    console.log('[useDbUser] Auth state:', { 
      hasSupabaseUser: !!supabaseUser, 
      authLoading,
      dbUser,
      error,
      isLoading 
    });
  }, [supabaseUser, authLoading, dbUser, error, isLoading]);

  return {
    dbUser,
    isLoading: authLoading || isLoading,
    error,
    refetch,
    isAdmin: dbUser?.isAdmin ?? false,
  };
}
