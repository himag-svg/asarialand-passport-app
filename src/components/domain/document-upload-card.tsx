"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import type { DocumentTypeInfo } from "@/lib/constants/document-types";
import type { ApplicationDocument } from "@/types";
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Props {
  documentType: DocumentTypeInfo;
  applicationId: string;
  existingDocument?: ApplicationDocument;
}

const statusConfig = {
  uploaded: {
    icon: Clock,
    label: "Uploaded",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  under_review: {
    icon: Clock,
    label: "Under Review",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  needs_reupload: {
    icon: AlertCircle,
    label: "Re-upload Required",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
};

export function DocumentUploadCard({
  documentType,
  applicationId,
  existingDocument,
}: Props) {
  const supabase = useSupabase();
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      try {
        const filePath = `${applicationId}/${documentType.type}/${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("application-documents")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { error: insertError } = await supabase
          .from("application_documents")
          .insert({
            application_id: applicationId,
            document_type: documentType.type,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            status: "uploaded",
            is_certified: false,
            is_translated: false,
            requires_return: documentType.requiresReturn,
            uploaded_by: user?.id,
          });

        if (insertError) throw insertError;

        toast.success(`${documentType.name} uploaded successfully`);
      } catch (err) {
        toast.error(
          `Failed to upload: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setUploading(false);
      }
    },
    [supabase, applicationId, documentType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const status = existingDocument
    ? statusConfig[existingDocument.status]
    : null;
  const StatusIcon = status?.icon;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-white">
            {documentType.name}
          </span>
          {!documentType.required && (
            <span className="ml-2 text-[11px] text-slate-600">(Optional)</span>
          )}
        </div>
        {status && StatusIcon && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color} ${status.bg}`}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">{documentType.description}</p>

      {(!existingDocument ||
        existingDocument.status === "rejected" ||
        existingDocument.status === "needs_reupload") && (
        <div
          {...getRootProps()}
          className={`mt-3 flex h-20 cursor-pointer items-center justify-center rounded-xl border border-dashed transition ${
            isDragActive
              ? "border-accent bg-accent/10"
              : "border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <Upload className="h-4 w-4" />
              {isDragActive ? "Drop file here" : "Drop file or click to upload"}
            </span>
          )}
        </div>
      )}

      {existingDocument?.status === "rejected" &&
        existingDocument.rejection_reason && (
          <p className="mt-2 text-xs text-red-400">
            Reason: {existingDocument.rejection_reason}
          </p>
        )}
    </div>
  );
}
