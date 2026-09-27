"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "Not signed in." as string, user: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return {
      supabase,
      error: "Admin access required." as string,
      user: null,
    };
  }

  return { supabase, error: null, user };
}

export async function updateSocietyAction(formData: FormData) {
  const { supabase, error, user } = await requireAdmin();
  if (error || !user) return { error };

  const id = String(formData.get("id") ?? "");
  const description = String(formData.get("description") ?? "");
  const president_name = String(formData.get("president_name") ?? "");
  const vice_president_name = String(formData.get("vice_president_name") ?? "");
  const instagram_url = String(formData.get("instagram_url") ?? "").trim();
  const linkedin_url = String(formData.get("linkedin_url") ?? "").trim();
  const logo = formData.get("logo");

  let logo_path: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    const ext = logo.name.split(".").pop() || "png";
    const path = `${id}/logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("society-logos")
      .upload(path, logo, { upsert: true, contentType: logo.type });

    if (uploadError) return { error: uploadError.message };
    logo_path = path;
  }

  const patch: Record<string, string | null> = {
    description,
    president_name,
    vice_president_name,
    instagram_url: instagram_url || null,
    linkedin_url: linkedin_url || null,
  };
  if (logo_path) patch.logo_path = logo_path;

  const { data: updated, error: updateError } = await supabase
    .from("societies")
    .update(patch)
    .eq("id", id)
    .select("slug")
    .single();

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin");
  revalidatePath("/communities");
  if (updated?.slug) revalidatePath(`/communities/${updated.slug}`);
  return { error: null };
}

export async function createEventAction(formData: FormData) {
  const { supabase, error, user } = await requireAdmin();
  if (error || !user) return { error };

  const society_id = String(formData.get("society_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const venue = String(formData.get("venue") ?? "");
  const starts_at = String(formData.get("starts_at") ?? "");
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const banner = formData.get("banner");

  if (!society_id || !title || !starts_at) {
    return { error: "Society, title, and start time are required." };
  }

  if (capacityRaw && (!Number.isFinite(capacity) || (capacity ?? 0) < 1)) {
    return { error: "Capacity must be a positive number." };
  }

  let banner_path: string | null = null;

  if (banner instanceof File && banner.size > 0) {
    const ext = banner.name.split(".").pop() || "png";
    const path = `${society_id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("event-banners")
      .upload(path, banner, { upsert: true, contentType: banner.type });

    if (uploadError) return { error: uploadError.message };
    banner_path = path;
  }

  const { error: insertError } = await supabase.from("events").insert({
    society_id,
    title,
    description,
    venue,
    starts_at: new Date(starts_at).toISOString(),
    banner_path,
    capacity,
    created_by: user.id,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath("/communities");
  return { error: null };
}

export async function deleteEventAction(formData: FormData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const id = String(formData.get("id") ?? "");
  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin");
  revalidatePath("/events");
  return { error: null };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
