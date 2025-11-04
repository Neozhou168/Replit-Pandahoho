import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

// Use service role key if available, otherwise anon key for basic operations
const supabaseAdminKey = supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAdminKey) {
  throw new Error("Missing Supabase service key or anon key");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const isAuthenticated: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const isAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isUserAdmin = user.user_metadata?.is_admin === true;

  if (!isUserAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  next();
};
