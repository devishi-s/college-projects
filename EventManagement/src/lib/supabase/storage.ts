import type { SupabaseClient } from "@supabase/supabase-js";

/** Public bucket created in Supabase Dashboard for post-event recap photos. */
export const RECAP_BUCKET = "event-recap-photos";

/**
 * Upload one or more images to `event-recap-photos`.
 * Returns public URLs suitable for storing in `events.recap_photo_urls`.
 */
export async function uploadRecapPhotos(
  supabase: SupabaseClient,
  eventId: string,
  files: File[],
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(RECAP_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      return { urls, error: uploadError.message };
    }

    const { data } = supabase.storage.from(RECAP_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { urls, error: null };
}
