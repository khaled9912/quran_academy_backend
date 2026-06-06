import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  const { data, error } = await supabase
    .from("contact_messages")
    .insert([{ name, email, message }])
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

export default router;
