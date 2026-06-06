import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

// List enrollments / course_students
router.get("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data: profileData, error: profileError } = await supabase.from("profiles").select("role").eq("id", userId).single();

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  const query = supabase.from("course_students").select("*").order("joined_at", { ascending: false });

  if (profileData?.role !== "admin") {
    query.eq("student_id", userId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Join a course
router.post("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { course_id, student_id } = req.body;

  const payload: any = { course_id: course_id, student_id: student_id || userId };

  const { data, error } = await supabase.from("course_students").insert([payload]).select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

export default router;
