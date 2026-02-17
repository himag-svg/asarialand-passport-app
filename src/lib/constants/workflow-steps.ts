import type { ApplicationStatus } from "@/types";

export interface WorkflowStep {
  step: number;
  status: ApplicationStatus;
  label: string;
  description: string;
  responsibleParty: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    status: "client_request",
    label: "Client Request",
    description: "Client initiates renewal and provides documents",
    responsibleParty: "Client",
  },
  {
    step: 2,
    status: "kyc_review",
    label: "KYC & Document Review",
    description: "Processing team runs KYC and reviews required documents",
    responsibleParty: "Processing Team",
  },
  {
    step: 3,
    status: "invoice_sent",
    label: "Invoice Sent",
    description: "Processing shares invoice with payment instructions",
    responsibleParty: "Processing / Finance",
  },
  {
    step: 4,
    status: "payment_pending",
    label: "Client Payment",
    description: "Client pays invoice and provides proof of payment",
    responsibleParty: "Client",
  },
  {
    step: 5,
    status: "agent_payment_pending",
    label: "Agent Payment",
    description: "Finance transfers funds to Local Agent",
    responsibleParty: "Finance",
  },
  {
    step: 6,
    status: "document_collection",
    label: "Document Collection",
    description: "Processing collects documents and completes application form",
    responsibleParty: "Processing",
  },
  {
    step: 7,
    status: "final_review",
    label: "Final Review",
    description: "Processing reviews all documents for completeness",
    responsibleParty: "Processing / Local Agent",
  },
  {
    step: 8,
    status: "government_submitted",
    label: "Government Submission",
    description: "Local Agent submits to Passport Office",
    responsibleParty: "Local Agent",
  },
  {
    step: 9,
    status: "tracking",
    label: "Tracking",
    description: "Processing tracks case and updates expected completion",
    responsibleParty: "Processing / Local Agent",
  },
  {
    step: 10,
    status: "passport_issued",
    label: "Passport Issued",
    description: "New passport issued, client confirms and collects",
    responsibleParty: "Passport Office / Client",
  },
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  client_request: "Client Request",
  kyc_review: "KYC Review",
  invoice_sent: "Invoice Sent",
  payment_pending: "Payment Pending",
  payment_confirmed: "Payment Confirmed",
  agent_payment_pending: "Agent Payment Pending",
  document_collection: "Document Collection",
  final_review: "Final Review",
  government_submitted: "Government Submitted",
  tracking: "Tracking",
  passport_issued: "Passport Issued",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  client_request: "text-sky-400 bg-sky-400/10",
  kyc_review: "text-amber-400 bg-amber-400/10",
  invoice_sent: "text-violet-400 bg-violet-400/10",
  payment_pending: "text-orange-400 bg-orange-400/10",
  payment_confirmed: "text-emerald-400 bg-emerald-400/10",
  agent_payment_pending: "text-orange-400 bg-orange-400/10",
  document_collection: "text-sky-400 bg-sky-400/10",
  final_review: "text-amber-400 bg-amber-400/10",
  government_submitted: "text-violet-400 bg-violet-400/10",
  tracking: "text-sky-400 bg-sky-400/10",
  passport_issued: "text-emerald-400 bg-emerald-400/10",
  completed: "text-emerald-500 bg-emerald-500/10",
  on_hold: "text-slate-400 bg-slate-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

/** Valid next statuses from a given status (state machine) */
export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  client_request: ["kyc_review", "on_hold", "cancelled"],
  kyc_review: ["invoice_sent", "on_hold", "cancelled"],
  invoice_sent: ["payment_pending", "on_hold", "cancelled"],
  payment_pending: ["payment_confirmed", "on_hold", "cancelled"],
  payment_confirmed: ["agent_payment_pending", "on_hold", "cancelled"],
  agent_payment_pending: ["document_collection", "on_hold", "cancelled"],
  document_collection: ["final_review", "on_hold", "cancelled"],
  final_review: ["government_submitted", "on_hold", "cancelled"],
  government_submitted: ["tracking", "on_hold", "cancelled"],
  tracking: ["passport_issued", "on_hold", "cancelled"],
  passport_issued: ["completed", "on_hold", "cancelled"],
  completed: [],
  on_hold: [
    "client_request", "kyc_review", "invoice_sent", "payment_pending",
    "payment_confirmed", "agent_payment_pending", "document_collection",
    "final_review", "government_submitted", "tracking", "passport_issued",
    "cancelled",
  ],
  cancelled: [],
};
