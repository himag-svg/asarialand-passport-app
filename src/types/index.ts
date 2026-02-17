export type Role = "client" | "processing_team" | "finance" | "local_agent" | "admin";

export type ApplicationStatus =
  | "client_request"
  | "kyc_review"
  | "invoice_sent"
  | "payment_pending"
  | "payment_confirmed"
  | "agent_payment_pending"
  | "document_collection"
  | "final_review"
  | "government_submitted"
  | "tracking"
  | "passport_issued"
  | "completed"
  | "on_hold"
  | "cancelled";

export type KycStatus = "pending" | "clear" | "flagged" | "review_required";

export type DocumentType =
  | "passport_bio_page"
  | "passport_original"
  | "photo_1"
  | "photo_2"
  | "birth_certificate"
  | "citizenship_certificate"
  | "marriage_certificate"
  | "passport_application_form"
  | "proof_of_address"
  | "other";

export type DocumentStatus =
  | "uploaded"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_reupload";

export type ServiceType = "normal" | "expedited";

export type InvoiceType = "client" | "agent";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type PaymentMethod = "credit_card" | "bank_transfer" | "other";
export type PaymentStatus = "pending" | "submitted" | "confirmed" | "rejected";

export type NotificationType =
  | "status_change"
  | "document_request"
  | "document_approved"
  | "document_rejected"
  | "payment_request"
  | "payment_confirmed"
  | "message"
  | "reminder"
  | "passport_ready"
  | "general";

export type NotificationChannel = "in_app" | "email" | "both";

export type CourierDirection =
  | "client_to_processing"
  | "processing_to_agent"
  | "agent_to_passport_office"
  | "passport_office_to_agent"
  | "agent_to_processing"
  | "processing_to_client";

export type CourierStatus = "pending" | "dispatched" | "in_transit" | "delivered" | "returned";

// ---- Database row types ----

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  country: string;
  postal_code: string;
}

export interface Application {
  id: string;
  reference_number: string;
  client_id: string;
  assigned_processor_id: string | null;
  assigned_agent_id: string | null;
  service_type: ServiceType;
  current_passport_number: string | null;
  passport_expiry_date: string | null;
  current_address: Address | null;
  status: ApplicationStatus;
  kyc_status: KycStatus;
  kyc_notes: string | null;
  kyc_completed_at: string | null;
  kyc_completed_by: string | null;
  application_form_data: Record<string, unknown> | null;
  form_completed_at: string | null;
  client_courier_tracking: string | null;
  agent_courier_tracking: string | null;
  client_courier_received: boolean;
  agent_courier_dispatched: boolean;
  government_submission_date: string | null;
  expected_completion_date: string | null;
  passport_office_reference: string | null;
  new_passport_number: string | null;
  passport_issued_date: string | null;
  client_acknowledged: boolean;
  acknowledgment_signed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  client?: Profile;
  processor?: Profile;
  agent?: Profile;
  documents?: ApplicationDocument[];
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  rejection_reason: string | null;
  is_certified: boolean;
  is_translated: boolean;
  requires_return: boolean;
  uploaded_by: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  application_id: string;
  invoice_number: string;
  invoice_type: InvoiceType;
  issued_to: string;
  issued_by: string;
  amount: number;
  currency: string;
  description: string | null;
  line_items: InvoiceLineItem[] | null;
  status: InvoiceStatus;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  application_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  proof_file_path: string | null;
  receipt_file_path: string | null;
  transaction_reference: string | null;
  submitted_by: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  application_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  channel: NotificationChannel;
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_by: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ApplicationNote {
  id: string;
  application_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface CourierShipment {
  id: string;
  application_id: string;
  direction: CourierDirection;
  courier_company: string | null;
  tracking_number: string | null;
  status: CourierStatus;
  dispatched_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
