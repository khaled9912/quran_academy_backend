import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("courses").select("*").order("title");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const { title, description, teacher_id, level, category, max_students } = req.body;
  const payload: any = { title, description, level, category, max_students };
  // if no teacher_id provided, use authenticated user
  const authId = (req as any).user.id;
  payload.teacher_id = teacher_id || authId;

  const { data, error } = await supabase.from("courses").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.delete("/:id", verifyAuth, async (req, res) => {
  const courseId = req.params.id;
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
