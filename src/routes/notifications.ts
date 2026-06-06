import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const authId = (req as any).user.id;
  const { title, message, user_id } = req.body;
  const { data: me, error: meErr } = await supabase.from("profiles").select("role").eq("id", authId).single();
  if (meErr) return res.status(500).json({ error: meErr.message });
  if (me?.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const payload = { user_id, title, message };
  const { data, error } = await supabase.from("notifications").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.patch("/:id/read", verifyAuth, async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

export default router;
