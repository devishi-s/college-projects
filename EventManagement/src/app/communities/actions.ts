"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinSocietyAction(societyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to join a community." };
  }

  if (!societyId) return { error: "Missing society." };

  const { error } = await supabase.from("society_members").insert({
    society_id: societyId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: null }; // already joined
    }
    return { error: error.message };
  }

  const { data: society } = await supabase
    .from("societies")
    .select("slug")
    .eq("id", societyId)
    .maybeSingle();

  revalidatePath("/communities");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  if (society?.slug) revalidatePath(`/communities/${society.slug}`);
  return { error: null };
}

export async function leaveSocietyAction(societyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in." };
  }

  const { error } = await supabase
    .from("society_members")
    .delete()
    .eq("society_id", societyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  const { data: society } = await supabase
    .from("societies")
    .select("slug")
    .eq("id", societyId)
    .maybeSingle();

  revalidatePath("/communities");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  if (society?.slug) revalidatePath(`/communities/${society.slug}`);
  return { error: null };
}
