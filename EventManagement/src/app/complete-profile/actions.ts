"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in first." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, profile_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin) {
    redirect("/");
  }

  const full_name = String(formData.get("full_name") ?? "").trim();
  const enrollment_no = String(formData.get("enrollment_no") ?? "").trim();
  const batch = String(formData.get("batch") ?? "").trim();
  const course = String(formData.get("course") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();

  if (!full_name || !enrollment_no || !batch || !course || !year) {
    return { error: "Please fill in every field." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      enrollment_no,
      batch,
      course,
      year,
      profile_completed: true,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/");
}
