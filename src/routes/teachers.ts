import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

// Return profiles with role 'teacher' and optional teacher profile data
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, created_at, teachers(bio, ijazah, specialization, hourly_rate, status)")
    .eq("role", "teacher");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const authId = (req as any).user.id;
  const { profile_id, bio, ijazah, specialization, hourly_rate, status } = req.body;

  // Only admin can create teacher for others
  const { data: me, error: meErr } = await supabase.from("profiles").select("role").eq("id", authId).single();
  if (meErr) return res.status(500).json({ error: meErr.message });
  if (profile_id && me?.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const id = profile_id || authId;
  const payload = { id, bio, ijazah, specialization, hourly_rate, status };
  const { data, error } = await supabase.from("teachers").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.delete("/:id", verifyAuth, async (req, res) => {
  const teacherId = req.params.id;
  const { error } = await supabase.from("teachers").delete().eq("id", teacherId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
