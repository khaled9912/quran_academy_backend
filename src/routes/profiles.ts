import { Router } from "express";
import { verifyAuth } from "../middleware/verifyAuth";
import { requireRole, logAudit } from "../middleware/requireRole";
import { supabase } from "../lib/supabase";

const router = Router();

// Get the authenticated user's own profile
router.get("/me", verifyAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, first_name, last_name, full_name, phone, avatar_url, is_active, created_at")
    .eq("id", userId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data.is_active) {
    return res.status(403).json({ error: "Your account is deactivated." });
  }

  return res.json(data);
});

// Get all profiles (Admin & Super Admin only)
router.get("/", verifyAuth, requireRole(["admin", "super_admin"]), async (req, res) => {
  const currentRole = (req as any).userRole;

  let query = supabase
    .from("profiles")
    .select("id, email, role, first_name, last_name, full_name, phone, avatar_url, is_active, created_at")
    .order("created_at", { ascending: false });

  // If normal admin, do not return super_admin profiles (or admins if desired, but let's allow them to see profiles except super_admins)
  if (currentRole === "admin") {
    query = query.neq("role", "super_admin");
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

// Update a profile (Admin & Super Admin only, with security checks)
router.patch("/:id", verifyAuth, requireRole(["admin", "super_admin"]), async (req, res) => {
  const currentUserId = (req as any).user.id;
  const currentRole = (req as any).userRole;
  const targetId = req.params.id;
  const { role, first_name, last_name, full_name, is_active, phone } = req.body;

  // 1. Fetch target profile
  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetId)
    .single();

  if (targetError || !targetProfile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // 2. Enforce security rules:
  // - Only Super Admin can modify a Super Admin or Admin profile
  // - Only Super Admin can assign role 'super_admin' or 'admin'
  const targetIsAdminOrSuper = ["admin", "super_admin"].includes(targetProfile.role);
  const assigningAdminOrSuper = role && ["admin", "super_admin"].includes(role);

  if (currentRole !== "super_admin") {
    if (targetIsAdminOrSuper || assigningAdminOrSuper) {
      return res.status(403).json({
        error: "Forbidden: Only Super Admin can manage Admin or Super Admin accounts",
      });
    }
  }

  // 3. Perform update
  const updateData: any = {};
  if (role !== undefined) updateData.role = role;
  if (first_name !== undefined) updateData.first_name = first_name;
  if (last_name !== undefined) updateData.last_name = last_name;
  if (full_name !== undefined) updateData.full_name = full_name;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (phone !== undefined) updateData.phone = phone;

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", targetId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // 4. Log the audit activity
  await logAudit(
    currentUserId,
    `Updated profile role:${role || targetProfile.role} active:${is_active !== undefined ? is_active : 'no_change'}`,
    "profiles",
    targetId
  );

  return res.json(data);
});

// Delete a profile (Super Admin only)
router.delete("/:id", verifyAuth, requireRole(["super_admin"]), async (req, res) => {
  const currentUserId = (req as any).user.id;
  const targetId = req.params.id;

  const { error } = await supabase.from("profiles").delete().eq("id", targetId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  await logAudit(currentUserId, "Deleted user profile", "profiles", targetId);

  return res.json({ success: true, message: "Profile deleted successfully" });
});

export default router;
