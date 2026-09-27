export type Profile = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
};

export type Society = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  focus: string[] | null;
  logo_path: string | null;
  accent: string | null;
  soft: string | null;
  deep: string | null;
  president_name: string | null;
  vice_president_name: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
};

export type EventRow = {
  id: string;
  society_id: string;
  title: string;
  description: string | null;
  venue: string | null;
  starts_at: string;
  banner_path: string | null;
  capacity: number | null;
  created_at: string;
  societies?: Pick<
    Society,
    "id" | "slug" | "name" | "soft" | "deep" | "accent"
  > | null;
  registration_count?: number;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  profiles?: Pick<Profile, "id" | "full_name"> | null;
};

export function publicStorageUrl(
  bucket: string,
  path: string | null | undefined,
) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function isEventCompleted(startsAt: string) {
  return new Date(startsAt).getTime() < Date.now();
}
