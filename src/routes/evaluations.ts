import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const { student_id } = req.query;
  const query = supabase.from("evaluations").select("*").order("created_at", { ascending: false });
  if (student_id) query.eq("student_id", student_id as string);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const authId = (req as any).user.id;
  const { student_id, course_id, memorization_score, tajweed_score, behavior_score, notes } = req.body;
  const payload = { student_id, teacher_id: authId, course_id, memorization_score, tajweed_score, behavior_score, notes };
  const { data, error } = await supabase.from("evaluations").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase.from("evaluations").update(updates).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

export default router;
