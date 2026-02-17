"use client";

import { useState, useTransition } from "react";
import { createInvoice, sendInvoice } from "@/lib/actions/invoices";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Props {
  applicationId: string;
  clientId: string;
  invoiceType: "client" | "agent";
  recipientLabel: string;
}

export function CreateInvoiceForm({
  applicationId,
  clientId,
  invoiceType,
  recipientLabel,
}: Props) {
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);
  const [isPending, startTransition] = useTransition();

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    const item = { ...updated[index] };

    if (field === "description") {
      item.description = value as string;
    } else if (field === "quantity") {
      item.quantity = Number(value) || 0;
      item.total = item.quantity * item.unit_price;
    } else if (field === "unit_price") {
      item.unit_price = Number(value) || 0;
      item.total = item.quantity * item.unit_price;
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  const handleCreate = () => {
    if (!description.trim()) {
      toast.error("Invoice description is required");
      return;
    }
    if (lineItems.some((li) => !li.description.trim() || li.total <= 0)) {
      toast.error("All line items must have a description and amount");
      return;
    }

    startTransition(async () => {
      const result = await createInvoice({
        applicationId,
        invoiceType,
        issuedTo: clientId,
        description,
        lineItems,
        dueDate: dueDate || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Invoice created successfully");

        // Auto-send the invoice
        if (result.invoiceId) {
          const sendResult = await sendInvoice(result.invoiceId);
          if (sendResult.success) {
            toast.success("Invoice sent to client");
          }
        }

        // Reset form
        setDescription("");
        setDueDate("");
        setLineItems([{ description: "", quantity: 1, unit_price: 0, total: 0 }]);
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
        Create Invoice ({invoiceType === "client" ? "Client" : "Agent"})
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Issue to: {recipientLabel}
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Asarialand passport renewal fee"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </div>

        {/* Line Items */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-300">
              Line Items
            </label>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <Plus className="h-3 w-3" /> Add item
            </button>
          </div>

          <div className="space-y-2">
            {lineItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 rounded-lg border border-white/5 bg-white/5 p-3"
              >
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                    placeholder="Item description"
                    className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                    placeholder="Qty"
                    className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_price || ""}
                    onChange={(e) => updateLineItem(idx, "unit_price", e.target.value)}
                    placeholder="Price"
                    className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="col-span-2 flex items-center text-xs text-white">
                  ${item.total.toFixed(2)}
                </div>
                <div className="col-span-1 flex items-center">
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-sm font-medium text-slate-300">Total</span>
          <span className="text-lg font-semibold text-white">
            USD {totalAmount.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create & Send Invoice"}
        </button>
      </div>
    </div>
  );
}
