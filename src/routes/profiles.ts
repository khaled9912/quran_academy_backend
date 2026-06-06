import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data: currentProfile, error: currentError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (currentError) {
    return res.status(500).json({ error: currentError.message });
  }

  if (currentProfile?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, full_name, phone, avatar_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { role, full_name } = req.body;
  const { data: currentProfile, error: currentError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (currentError) {
    return res.status(500).json({ error: currentError.message });
  }

  if (currentProfile?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role, full_name })
    .eq("id", req.params.id)
    .select("id, email, role, full_name, created_at")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

export default router;
