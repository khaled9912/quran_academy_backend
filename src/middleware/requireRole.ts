import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

// Role hierarchy representation
const ROLE_HIERARCHY: Record<string, number> = {
  student: 1,
  teacher: 2,
  admin: 3,
  super_admin: 4,
};

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing authentication" });
    }

    try {
      // Always fetch the role directly from the database to ensure it is fresh and untrusted
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({ error: "Forbidden: Profile not found" });
      }

      if (!profile.is_active) {
        return res.status(403).json({ error: "Forbidden: Account is inactive" });
      }

      // Check if user has sufficient role (based on hierarchy or explicit inclusion)
      const userRolePower = ROLE_HIERARCHY[profile.role] || 0;
      
      const hasAccess = allowedRoles.some((role) => {
        const allowedRolePower = ROLE_HIERARCHY[role] || 0;
        // Super Admin bypasses and gains access to all roles
        if (profile.role === "super_admin") return true;
        // If the route allows lower or equal roles in the hierarchy, check hierarchy power
        return profile.role === role || userRolePower >= allowedRolePower;
      });

      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }

      // Set role and profile on request
      (req as any).userRole = profile.role;
      (req as any).profile = profile;
      return next();
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}

// Audit logging helper
export async function logAudit(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string
) {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId || null,
    });
    if (error) {
      console.error("Failed to insert audit log:", error.message);
    }
  } catch (err) {
    console.error("Error writing audit log:", err);
  }
}
