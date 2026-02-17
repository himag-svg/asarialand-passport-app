"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser } from "lucide-react";

interface Props {
  onSave: (dataUrl: string) => void;
  label?: string;
  existingSignature?: string;
}

export function SignaturePad({
  onSave,
  label = "Signature",
  existingSignature,
}: Props) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const handleClear = () => {
    sigRef.current?.clear();
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-300">
          {label}
        </label>
        {hasDrawn && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-white"
          >
            <Eraser className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {existingSignature ? (
        <div className="space-y-2">
          <div className="flex h-32 items-center justify-center rounded-lg border border-emerald-500/20 bg-white/5">
            <img
              src={existingSignature}
              alt="Signature"
              className="max-h-28"
            />
          </div>
          <button
            type="button"
            onClick={() => onSave("")}
            className="text-xs text-slate-500 hover:text-white"
          >
            Re-sign
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{
                className: "w-full h-32",
                style: { width: "100%", height: 128 },
              }}
              penColor="black"
              onBegin={() => setHasDrawn(true)}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className="w-full rounded-lg bg-accent py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            Save Signature
          </button>
        </>
      )}
    </div>
  );
}
