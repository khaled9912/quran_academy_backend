import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const { data, error } = await supabase.from("attendance").select("*").order("recorded_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;
  const { data, error } = await supabase
    .from("attendance")
    .update(updates)
    .eq("id", id)
    .select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

export default router;
