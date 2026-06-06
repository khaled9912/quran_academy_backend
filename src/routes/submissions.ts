import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { role } = req.query;
  // If teacher/admin, allow filtering by assignment_id; students get their submissions
  const { data: me, error: meErr } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (meErr) return res.status(500).json({ error: meErr.message });

  const query = supabase.from("submissions").select("*").order("submitted_at", { ascending: false });
  if (me?.role === "student") {
    query.eq("student_id", userId);
  } else if (req.query.assignment_id) {
    query.eq("assignment_id", req.query.assignment_id as string);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const authId = (req as any).user.id;
  const { assignment_id, file_url, notes } = req.body;
  const payload = { assignment_id, student_id: authId, file_url, notes };
  const { data, error } = await supabase.from("submissions").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase.from("submissions").update(updates).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

export default router;
