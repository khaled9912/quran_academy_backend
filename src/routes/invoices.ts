import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data: me, error: meErr } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (meErr) return res.status(500).json({ error: meErr.message });

  const query = supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (me?.role !== "admin") query.eq("student_id", userId);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const authId = (req as any).user.id;
  const { student_id, amount, currency, status, due_date } = req.body;
  const { data: me, error: meErr } = await supabase.from("profiles").select("role").eq("id", authId).single();
  if (meErr) return res.status(500).json({ error: meErr.message });
  if (me?.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const payload = { student_id, amount, currency, status, due_date };
  const { data, error } = await supabase.from("invoices").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const { data, error } = await supabase.from("invoices").update(updates).eq("id", id).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

export default router;
