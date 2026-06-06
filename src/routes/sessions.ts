import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("day", { ascending: true })
    .order("time", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const {
    course_title,
    teacher,
    day,
    time,
    end_time,
    room,
    capacity,
    live_link,
  } = req.body;
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        course_title,
        teacher,
        day,
        time,
        end_time,
        room,
        capacity,
        live_link,
      },
    ])
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

router.patch("/:id", verifyAuth, async (req, res) => {
  const sessionId = Number(req.params.id);
  const updates = req.body;
  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId)
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data?.[0]);
});

router.delete("/:id", verifyAuth, async (req, res) => {
  const sessionId = Number(req.params.id);
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
