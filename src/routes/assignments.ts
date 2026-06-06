import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const { course_id } = req.query;
  const query = supabase.from("assignments").select("*").order("created_at", { ascending: false });
  if (course_id) query.eq("course_id", course_id as string);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const authId = (req as any).user.id;
  const { course_id, title, description, due_date } = req.body;
  const payload = { course_id, title, description, due_date, created_by: authId };
  const { data, error } = await supabase.from("assignments").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase.from("assignments").update(updates).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

router.delete("/:id", verifyAuth, async (req, res) => {
  const id = req.params.id;
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
