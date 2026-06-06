import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("teachers").select("*").order("name");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const { name, email, subject } = req.body;
  const { data, error } = await supabase
    .from("teachers")
    .insert([{ name, email, subject }])
    .select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.delete("/:id", verifyAuth, async (req, res) => {
  const teacherId = Number(req.params.id);
  const { error } = await supabase.from("teachers").delete().eq("id", teacherId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
