import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { requireRole } from "../middleware/requireRole";
import { supabase } from "../lib/supabase";

const router = Router();

// Get audit logs (Super Admin only)
router.get("/", verifyAuth, requireRole(["super_admin"]), async (req, res) => {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      resource,
      resource_id,
      created_at,
      profiles (
        id,
        email,
        full_name,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

export default router;
