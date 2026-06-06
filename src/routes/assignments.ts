import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { requireRole, logAudit } from "../middleware/requireRole";
import { supabase } from "../lib/supabase";

const router = Router();

// Get assignments (Authenticated users)
router.get("/", verifyAuth, async (req, res) => {
  const { course_id } = req.query;
  const query = supabase.from("assignments").select("*").order("created_at", { ascending: false });
  if (course_id) query.eq("course_id", course_id as string);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Create assignment (Teacher, Admin, Super Admin)
router.post("/", verifyAuth, requireRole(["teacher", "admin", "super_admin"]), async (req, res) => {
  const authId = (req as any).user.id;
  const { course_id, title, description, due_date } = req.body;
  const payload = { course_id, title, description, due_date, created_by: authId };
  const { data, error } = await supabase.from("assignments").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });

  await logAudit(authId, `Created assignment: ${title}`, "assignments", data?.[0]?.id);

  return res.status(201).json(data?.[0]);
});

// Update assignment (Teacher, Admin, Super Admin)
router.patch("/:id", verifyAuth, requireRole(["teacher", "admin", "super_admin"]), async (req, res) => {
  const authId = (req as any).user.id;
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase.from("assignments").update(updates).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });

  await logAudit(authId, `Updated assignment: ${updates.title || id}`, "assignments", id);

  return res.json(data?.[0]);
});

// Delete assignment (Teacher, Admin, Super Admin)
router.delete("/:id", verifyAuth, requireRole(["teacher", "admin", "super_admin"]), async (req, res) => {
  const authId = (req as any).user.id;
  const id = req.params.id;
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  await logAudit(authId, `Deleted assignment`, "assignments", id);

  return res.status(204).send();
});

export default router;
