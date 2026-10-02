import { ShellChrome } from "@/components/layout/ShellChrome";
import { createClient } from "@/lib/supabase/server";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = Boolean(profile?.is_admin);
  }

  return (
    <ShellChrome isLoggedIn={Boolean(user)} isAdmin={isAdmin}>
      {children}
    </ShellChrome>
  );
}
