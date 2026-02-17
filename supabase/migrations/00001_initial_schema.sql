-- ============================================================
-- Asarialand Passport Renewal App — Initial Schema
-- ============================================================

-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  role            TEXT NOT NULL CHECK (role IN ('client', 'processing_team', 'finance', 'local_agent', 'admin'))
                  DEFAULT 'client',
  avatar_url      TEXT,
  address_line_1  TEXT,
  address_line_2  TEXT,
  city            TEXT,
  country         TEXT,
  postal_code     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);

-- 2. APPLICATIONS (central table)
-- ============================================================
CREATE TABLE public.applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number      TEXT UNIQUE NOT NULL,
  client_id             UUID NOT NULL REFERENCES public.profiles(id),
  assigned_processor_id UUID REFERENCES public.profiles(id),
  assigned_agent_id     UUID REFERENCES public.profiles(id),

  -- Step 1: Client request
  service_type          TEXT NOT NULL CHECK (service_type IN ('normal', 'expedited')),
  current_passport_number TEXT,
  passport_expiry_date  DATE,
  current_address       JSONB,

  -- Workflow state
  status                TEXT NOT NULL DEFAULT 'client_request'
                        CHECK (status IN (
                          'client_request',
                          'kyc_review',
                          'invoice_sent',
                          'payment_pending',
                          'payment_confirmed',
                          'agent_payment_pending',
                          'document_collection',
                          'final_review',
                          'government_submitted',
                          'tracking',
                          'passport_issued',
                          'completed',
                          'on_hold',
                          'cancelled'
                        )),

  -- Step 2: KYC
  kyc_status            TEXT DEFAULT 'pending'
                        CHECK (kyc_status IN ('pending', 'clear', 'flagged', 'review_required')),
  kyc_notes             TEXT,
  kyc_completed_at      TIMESTAMPTZ,
  kyc_completed_by      UUID REFERENCES public.profiles(id),

  -- Step 6: Digital form data
  application_form_data JSONB,
  form_completed_at     TIMESTAMPTZ,

  -- Step 7: Courier tracking
  client_courier_tracking   TEXT,
  agent_courier_tracking    TEXT,
  client_courier_received   BOOLEAN DEFAULT FALSE,
  agent_courier_dispatched  BOOLEAN DEFAULT FALSE,

  -- Step 8: Government submission
  government_submission_date  DATE,
  expected_completion_date    DATE,
  passport_office_reference   TEXT,

  -- Step 10: Completion
  new_passport_number       TEXT,
  passport_issued_date      DATE,
  client_acknowledged       BOOLEAN DEFAULT FALSE,
  acknowledgment_signed_at  TIMESTAMPTZ,

  -- Metadata
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_applications_client ON public.applications(client_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_processor ON public.applications(assigned_processor_id);
CREATE INDEX idx_applications_agent ON public.applications(assigned_agent_id);
CREATE INDEX idx_applications_reference ON public.applications(reference_number);

-- 3. APPLICATION DOCUMENTS
-- ============================================================
CREATE TABLE public.application_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type     TEXT NOT NULL CHECK (document_type IN (
    'passport_bio_page',
    'passport_original',
    'photo_1',
    'photo_2',
    'birth_certificate',
    'citizenship_certificate',
    'marriage_certificate',
    'passport_application_form',
    'proof_of_address',
    'other'
  )),
  file_name         TEXT NOT NULL,
  file_path         TEXT NOT NULL,
  file_size         BIGINT,
  mime_type         TEXT,
  status            TEXT NOT NULL DEFAULT 'uploaded'
                    CHECK (status IN ('uploaded', 'under_review', 'approved', 'rejected', 'needs_reupload')),
  rejection_reason  TEXT,
  is_certified      BOOLEAN DEFAULT FALSE,
  is_translated     BOOLEAN DEFAULT FALSE,
  requires_return   BOOLEAN DEFAULT FALSE,
  uploaded_by       UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_by       UUID REFERENCES public.profiles(id),
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_app_docs_application ON public.application_documents(application_id);
CREATE INDEX idx_app_docs_type ON public.application_documents(document_type);

-- 4. INVOICES
-- ============================================================
CREATE TABLE public.invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  invoice_number    TEXT UNIQUE NOT NULL,
  invoice_type      TEXT NOT NULL CHECK (invoice_type IN ('client', 'agent')),
  issued_to         UUID NOT NULL REFERENCES public.profiles(id),
  issued_by         UUID NOT NULL REFERENCES public.profiles(id),
  amount            DECIMAL(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  description       TEXT,
  line_items        JSONB,
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date          DATE,
  sent_at           TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  payment_method    TEXT,
  payment_reference TEXT,
  pdf_path          TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_application ON public.invoices(application_id);
CREATE INDEX idx_invoices_issued_to ON public.invoices(issued_to);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- 5. PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  application_id    UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  amount            DECIMAL(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  payment_method    TEXT NOT NULL DEFAULT 'credit_card'
                    CHECK (payment_method IN ('credit_card', 'bank_transfer', 'other')),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'submitted', 'confirmed', 'rejected')),
  proof_file_path   TEXT,
  receipt_file_path TEXT,
  transaction_reference TEXT,
  submitted_by      UUID NOT NULL REFERENCES public.profiles(id),
  confirmed_by      UUID REFERENCES public.profiles(id),
  confirmed_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_application ON public.payments(application_id);

-- 6. NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES public.profiles(id),
  application_id  UUID REFERENCES public.applications(id),
  type            TEXT NOT NULL CHECK (type IN (
    'status_change', 'document_request', 'document_approved',
    'document_rejected', 'payment_request', 'payment_confirmed',
    'message', 'reminder', 'passport_ready', 'general'
  )),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  action_url      TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  is_dismissed    BOOLEAN DEFAULT FALSE,
  channel         TEXT DEFAULT 'in_app'
                  CHECK (channel IN ('in_app', 'email', 'both')),
  email_sent      BOOLEAN DEFAULT FALSE,
  email_sent_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id, is_read) WHERE NOT is_read;

-- 7. STATUS HISTORY (audit trail)
-- ============================================================
CREATE TABLE public.status_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_status     TEXT,
  to_status       TEXT NOT NULL,
  changed_by      UUID NOT NULL REFERENCES public.profiles(id),
  reason          TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_status_history_application ON public.status_history(application_id);
CREATE INDEX idx_status_history_created ON public.status_history(created_at);

-- 8. AUDIT LOG
-- ============================================================
CREATE TABLE public.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id),
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at);

-- 9. APPLICATION NOTES
-- ============================================================
CREATE TABLE public.application_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES public.profiles(id),
  content         TEXT NOT NULL,
  is_internal     BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_app_notes_application ON public.application_notes(application_id);

-- 10. COURIER SHIPMENTS
-- ============================================================
CREATE TABLE public.courier_shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL CHECK (direction IN (
    'client_to_processing',
    'processing_to_agent',
    'agent_to_passport_office',
    'passport_office_to_agent',
    'agent_to_processing',
    'processing_to_client'
  )),
  courier_company TEXT,
  tracking_number TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'dispatched', 'in_transit', 'delivered', 'returned')),
  dispatched_at   TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_courier_application ON public.courier_shipments(application_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-log status changes
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.status_history (application_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_application_status_change
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_status_change();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.application_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.courier_shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.application_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.status_history;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- APPLICATIONS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own applications" ON public.applications
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Staff view all applications" ON public.applications
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Clients can create applications" ON public.applications
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Staff can update applications" ON public.applications
  FOR UPDATE USING (public.get_user_role() IN ('processing_team', 'admin'));

-- APPLICATION DOCUMENTS
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own docs" ON public.application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_documents.application_id
      AND applications.client_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all docs" ON public.application_documents
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Clients can upload docs" ON public.application_documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_documents.application_id
      AND applications.client_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update docs" ON public.application_documents
  FOR UPDATE USING (public.get_user_role() IN ('processing_team', 'admin'));

-- INVOICES
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own invoices" ON public.invoices
  FOR SELECT USING (issued_to = auth.uid());

CREATE POLICY "Staff view all invoices" ON public.invoices
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Staff can create invoices" ON public.invoices
  FOR INSERT WITH CHECK (public.get_user_role() IN ('processing_team', 'finance', 'admin'));

CREATE POLICY "Staff can update invoices" ON public.invoices
  FOR UPDATE USING (public.get_user_role() IN ('processing_team', 'finance', 'admin'));

-- PAYMENTS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own payments" ON public.payments
  FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Staff view all payments" ON public.payments
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Clients can submit payments" ON public.payments
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Staff can update payments" ON public.payments
  FOR UPDATE USING (public.get_user_role() IN ('processing_team', 'finance', 'admin'));

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY "Staff can send notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

-- STATUS HISTORY
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own status history" ON public.status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = status_history.application_id
      AND applications.client_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all status history" ON public.status_history
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

-- AUDIT LOG
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit log" ON public.audit_log
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "System can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (TRUE);

-- APPLICATION NOTES
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view non-internal notes" ON public.application_notes
  FOR SELECT USING (
    NOT is_internal
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_notes.application_id
      AND applications.client_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all notes" ON public.application_notes
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Staff can create notes" ON public.application_notes
  FOR INSERT WITH CHECK (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Note authors can update own notes" ON public.application_notes
  FOR UPDATE USING (author_id = auth.uid());

-- COURIER SHIPMENTS
ALTER TABLE public.courier_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own courier shipments" ON public.courier_shipments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = courier_shipments.application_id
      AND applications.client_id = auth.uid()
    )
  );

CREATE POLICY "Staff view all courier shipments" ON public.courier_shipments
  FOR SELECT USING (public.get_user_role() IN ('processing_team', 'finance', 'local_agent', 'admin'));

CREATE POLICY "Staff can create courier shipments" ON public.courier_shipments
  FOR INSERT WITH CHECK (public.get_user_role() IN ('processing_team', 'local_agent', 'admin'));

CREATE POLICY "Staff can update courier shipments" ON public.courier_shipments
  FOR UPDATE USING (public.get_user_role() IN ('processing_team', 'local_agent', 'admin'));

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', FALSE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoices-receipts', 'invoices-receipts', FALSE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('passport-forms', 'passport-forms', FALSE);
