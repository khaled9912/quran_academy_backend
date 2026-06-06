import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  const query = supabase.from("enrollments").select("*").order("enrolled_at", {
    ascending: false,
  });

  if (profileData?.role !== "admin") {
    query.eq("student_id", userId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post("/", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { course_id, student_name, course_title } = req.body;

  const payload: any = { status: "active" };
  if (course_id) payload.course_id = course_id;
  if (student_name) payload.student_name = student_name;
  if (course_title) payload.course_title = course_title;
  if (!payload.student_name) payload.student_id = userId;

  const { data, error } = await supabase
    .from("enrollments")
    .insert([payload])
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data?.[0]);
});

export default router;
