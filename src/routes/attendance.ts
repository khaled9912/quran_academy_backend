import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { requireRole, logAudit } from "../middleware/requireRole";
import { supabase } from "../lib/supabase";

const router = Router();

// Get attendance logs
router.get("/", verifyAuth, requireRole(["student", "teacher", "admin", "super_admin"]), async (req, res) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).userRole;

  const query = supabase.from("attendance").select("*").order("recorded_at", { ascending: false });

  if (userRole === "student") {
    query.eq("student_id", userId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Update/Record attendance (Teachers and Admins/Super Admins only)
router.patch("/:id", verifyAuth, requireRole(["teacher", "admin", "super_admin"]), async (req, res) => {
  const userId = (req as any).user.id;
  const id = req.params.id;
  const updates = req.body;

  const { data, error } = await supabase.from("attendance").update(updates).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });

  await logAudit(userId, `Updated attendance record: ${updates.status || 'unknown'}`, "attendance", id);

  return res.json(data?.[0]);
});

export default router;
