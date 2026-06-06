import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("title");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const { title, description, teacher, schedule, default_capacity } = req.body;
  const { data, error } = await supabase
    .from("courses")
    .insert([{ title, description, teacher, schedule, default_capacity }])
    .select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.delete("/:id", verifyAuth, async (req, res) => {
  const courseId = Number(req.params.id);
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
