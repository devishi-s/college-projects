"use client";

import { useEffect, useRef, useState } from "react";
import { saveEventRecapAction } from "@/app/admin/actions";
import type { EventRow } from "@/lib/types";

type Props = {
  event: EventRow;
  pending: boolean;
  onSave: (
    action: (fd: FormData) => Promise<{ error: string | null }>,
    formData: FormData,
    success: string,
  ) => void;
};

type PendingPhoto = { file: File; preview: string };

export function EventRecapEditor({ event, pending, onSave }: Props) {
  const [open, setOpen] = useState(Boolean(event.recap_description));
  const [description, setDescription] = useState(
    event.recap_description ?? "",
  );
  const [photos, setPhotos] = useState<string[]>(
    event.recap_photo_urls ?? [],
  );
  const [pendingFiles, setPendingFiles] = useState<PendingPhoto[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const p of pendingFiles) URL.revokeObjectURL(p.preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke on unmount only
  }, []);

  function addFiles(list: FileList | File[]) {
    const next = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (next.length === 0) return;
    setPendingFiles((prev) => [...prev, ...next]);
  }

  function removeExisting(url: string) {
    setPhotos((prev) => prev.filter((u) => u !== url));
  }

  function removePending(index: number) {
    setPendingFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <div className="mt-3 w-full border-t-[2px] border-[var(--ink)]/15 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border-[2px] border-[var(--ink)] bg-white px-3 py-1 text-xs font-bold text-[var(--rose-deep)]"
      >
        {open
          ? "Hide recap"
          : event.recap_description
            ? "Edit recap"
            : "Add Recap"}
      </button>

      {open && (
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.set("id", event.id);
            fd.set("recap_description", description);
            fd.set("kept_photo_urls", JSON.stringify(photos));
            for (const item of pendingFiles) {
              fd.append("photos", item.file);
            }
            onSave(
              saveEventRecapAction,
              fd,
              `Recap saved for “${event.title}”.`,
            );
            for (const item of pendingFiles) {
              URL.revokeObjectURL(item.preview);
            }
            setPendingFiles([]);
          }}
        >
          <label className="flex flex-col gap-1 text-sm font-bold">
            Recap description
            <textarea
              name="recap_description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How did the event go? Highlights, turnout, wins…"
              required
              className="rounded-2xl border-[2.5px] border-[var(--ink)] px-3 py-2 font-normal"
            />
          </label>

          {(photos.length > 0 || pendingFiles.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {photos.map((url) => (
                <div
                  key={url}
                  className="relative h-16 w-16 overflow-hidden rounded-xl border-[2px] border-[var(--ink)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Recap thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(url)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--ink)] bg-white text-[10px] font-extrabold"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {pendingFiles.map((item, i) => (
                <div
                  key={`${item.file.name}-${i}`}
                  className="relative h-16 w-16 overflow-hidden rounded-xl border-[2px] border-dashed border-[var(--rose)] bg-[var(--sidebar)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--ink)] bg-white text-[10px] font-extrabold"
                    aria-label="Remove pending photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-[2.5px] border-dashed px-4 py-6 text-center text-sm ${
              dragging
                ? "border-[var(--rose)] bg-[var(--blush)]"
                : "border-[var(--ink)] bg-white"
            }`}
          >
            <p className="font-bold text-[var(--ink)]">
              Drop recap photos here, or click to browse
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              Multiple images · uploaded to event-recap-photos
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="cute-btn self-start"
          >
            {pending ? "Saving…" : "Save recap"}
          </button>
        </form>
      )}
    </div>
  );
}
