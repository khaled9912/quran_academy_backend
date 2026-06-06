import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data: profileData, error: profileError } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (profileError) return res.status(500).json({ error: profileError.message });

  const query = supabase.from("attendance").select("*").order("recorded_at", { ascending: false });

  if (profileData?.role === "student") {
    query.eq("student_id", userId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase.from("attendance").update(updates).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

export default router;
