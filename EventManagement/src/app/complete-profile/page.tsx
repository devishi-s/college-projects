import { redirect } from "next/navigation";
import { CompleteProfileForm } from "@/app/complete-profile/CompleteProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/complete-profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, profile_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin || profile?.profile_completed) {
    redirect("/");
  }

  return <CompleteProfileForm />;
}
