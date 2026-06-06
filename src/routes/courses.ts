import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { requireRole, logAudit } from "../middleware/requireRole";
import { supabase } from "../lib/supabase";

const router = Router();

// Get courses (Public endpoint)
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("courses").select("*").order("title");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Create course (Teacher, Admin, Super Admin only)
router.post("/", verifyAuth, requireRole(["teacher", "admin", "super_admin"]), async (req, res) => {
  const { title, description, teacher_id, level, category, max_students } = req.body;
  const payload: any = { title, description, level, category, max_students };
  const authId = (req as any).user.id;
  payload.teacher_id = teacher_id || authId;

  const { data, error } = await supabase.from("courses").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });

  await logAudit(authId, `Created course: ${title}`, "courses", data?.[0]?.id);

  return res.status(201).json(data?.[0]);
});

// Delete course (Admin, Super Admin only)
router.delete("/:id", verifyAuth, requireRole(["admin", "super_admin"]), async (req, res) => {
  const authId = (req as any).user.id;
  const courseId = req.params.id;
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return res.status(500).json({ error: error.message });

  await logAudit(authId, `Deleted course`, "courses", courseId);

  return res.status(204).send();
});

export default router;
