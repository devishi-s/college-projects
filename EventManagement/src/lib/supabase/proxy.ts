import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the auth session on each request.
 * - /admin/* requires a signed-in user
 * - Non-admin users with profile_completed = false are gated to /complete-profile
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const path = request.nextUrl.pathname;

  // Prefer claims.sub; fall back to getUser if needed for the profile gate
  let userId: string | null =
    claims && typeof (claims as { sub?: string }).sub === "string"
      ? (claims as { sub: string }).sub
      : null;

  if (!claims && path.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Profile gate for non-admin students (skip login + the complete-profile page itself)
  if (
    claims &&
    path !== "/complete-profile" &&
    path !== "/login"
  ) {
    if (!userId) {
      const { data: authData } = await supabase.auth.getUser();
      userId = authData.user?.id ?? null;
    }

    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, profile_completed")
        .eq("id", userId)
        .maybeSingle();

      // Admins skip the gate entirely
      if (profile && !profile.is_admin && profile.profile_completed === false) {
        const url = request.nextUrl.clone();
        url.pathname = "/complete-profile";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  // Logged-out users shouldn't stay on the complete-profile page
  if (!claims && path === "/complete-profile") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", "/complete-profile");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
