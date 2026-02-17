import { getClientApplications } from "@/lib/queries/requests";
import { DOCUMENT_TYPES } from "@/lib/constants/document-types";
import { DocumentUploadCard } from "@/components/domain/document-upload-card";
import Link from "next/link";
import { PlusCircle, CheckCircle2, FileText } from "lucide-react";

export default async function ClientDocumentsPage() {
  const applications = await getClientApplications();
  const latest = applications[0];

  if (!latest) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center animate-fade-in">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <FileText className="h-7 w-7 text-slate-500" />
          </div>
          <h1 className="font-display text-lg font-bold text-white">
            No Active Request
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            You need to create a renewal request before uploading documents.
          </p>
          <Link
            href="/new-request"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Start a new request
          </Link>
        </div>
      </div>
    );
  }

  const uploadedDocs = latest.documents ?? [];
  const uploadedTypes = new Set(uploadedDocs.map((d) => d.document_type));
  const requiredDocs = DOCUMENT_TYPES.filter((d) => d.required);
  const completedCount = requiredDocs.filter((d) =>
    uploadedTypes.has(d.type)
  ).length;
  const progress = requiredDocs.length
    ? Math.round((completedCount / requiredDocs.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl font-bold text-white">
          Documents
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload required documents for your Asarialand passport renewal.
        </p>
      </div>

      {/* Progress card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="section-label !mb-0">Checklist Progress</div>
          <div className="flex items-center gap-2">
            {progress === 100 && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
            <span className="font-display text-2xl font-bold text-white">
              {progress}%
            </span>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress === 100
                ? "bg-emerald-400"
                : "bg-gradient-to-r from-accent to-accent-light"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {completedCount} of {requiredDocs.length} required documents uploaded
        </p>
      </div>

      {/* Document grid */}
      <div>
        <div className="section-label mb-4">Document Checklist</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {DOCUMENT_TYPES.map((doc) => {
            const uploaded = uploadedDocs.find(
              (d) => d.document_type === doc.type
            );
            return (
              <DocumentUploadCard
                key={doc.type}
                documentType={doc}
                applicationId={latest.id}
                existingDocument={uploaded}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
