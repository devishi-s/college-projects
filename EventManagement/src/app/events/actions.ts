"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function registerInterestAction(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to register interest." };
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, capacity, starts_at")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found." };

  if (new Date(event.starts_at).getTime() < Date.now()) {
    return { error: "This event is already completed." };
  }

  if (event.capacity != null) {
    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    if ((count ?? 0) >= event.capacity) {
      return { error: "This event is full." };
    }
  }

  const { error } = await supabase.from("event_registrations").insert({
    event_id: eventId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You are already registered." };
    }
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/admin");
  return { error: null };
}

export async function unregisterInterestAction(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in." };

  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/admin");
  return { error: null };
}
