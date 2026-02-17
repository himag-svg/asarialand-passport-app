"use client";

import { useState, useTransition } from "react";
import { generateApplicationPdf } from "@/lib/actions/forms";
import { toast } from "sonner";
import { FileText, Download, Loader2 } from "lucide-react";

interface Props {
  applicationId: string;
}

export function GeneratePdfButton({ applicationId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateApplicationPdf(applicationId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("PDF generated successfully");
        setPdfUrl(result.publicUrl ?? null);
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
        Application PDF
      </h2>
      <p className="mt-2 text-xs text-slate-500">
        Generate a formatted PDF of the passport application form for
        submission to the Passport Office.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate PDF
            </>
          )}
        </button>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
}
