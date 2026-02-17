"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  applicationId: string;
}

export function AddNoteForm({ applicationId }: Props) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    if (!content.trim()) return;

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase.from("application_notes").insert({
        application_id: applicationId,
        author_id: user.id,
        content: content.trim(),
        is_internal: isInternal,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Note added");
        setContent("");
        router.refresh();
      }
    });
  };

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note..."
        rows={2}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="rounded"
          />
          Internal only (not visible to client)
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add Note"}
        </button>
      </div>
    </div>
  );
}
