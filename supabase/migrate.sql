-- HotelDocs — Migración Supabase (Schema vacío → Multi-tenant)
-- ================================================================
-- Tu proyecto Supabase tiene el schema antiguo (sin clients, departments,
-- sin campos JSONB). Todas las tablas están VACÍAS, así que es seguro reconstruir.
-- 
-- INSTRUCCIONES:
-- 1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard/project/hculvpzrtqcapzxyiqpf
-- 2. Entra a SQL Editor (en el menú lateral)
-- 3. Crea una "New query"
-- 4. Pega TODO este script
-- 5. Click "Run"
-- 6. Espera a que termine (puede tardar 10-20 segundos)
-- 7. Si ves "Success, no rows returned" → todo perfecto
-- ================================================================

-- ============================================================
-- 0. LIMPIAR SCHEMA ANTIGUO (tablas vacías, seguro eliminar)
-- ============================================================
DROP TABLE IF EXISTS public.document_versions CASCADE;
DROP TABLE IF EXISTS public.document_attachments CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.alarms CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.centers CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Limpiar enums antiguos si existen
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS center_status CASCADE;
DROP TYPE IF EXISTS document_status CASCADE;

-- ============================================================
-- 1. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. ENUMS
-- ============================================================
DO $$ BEGIN CREATE TYPE center_status AS ENUM ('active', 'paused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE document_status AS ENUM ('draft', 'pending', 'approved', 'discontinued');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('master', 'clientAdmin', 'hotelAdmin', 'user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE document_visibility AS ENUM ('private', 'all', 'public');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE document_source_type AS ENUM ('manual', 'pdf-import');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE license_type AS ENUM ('basic', 'professional', 'enterprise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE client_status AS ENUM ('active', 'suspended', 'trial');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 3. FUNCIONES AUXILIARES
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE v_role user_role;
BEGIN SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
RETURN v_role; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_client_id()
RETURNS UUID AS $$
DECLARE v_client_id UUID;
BEGIN SELECT client_id INTO v_client_id FROM public.users WHERE id = auth.uid();
RETURN v_client_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_center_ids()
RETURNS JSONB AS $$
DECLARE v_centers JSONB;
BEGIN SELECT center_ids INTO v_centers FROM public.users WHERE id = auth.uid();
RETURN COALESCE(v_centers, '[]'::jsonb); END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_has_center_access(doc_center_ids JSONB)
RETURNS BOOLEAN AS $$
DECLARE user_centers JSONB;
BEGIN
  SELECT center_ids INTO user_centers FROM public.users WHERE id = auth.uid();
  RETURN COALESCE(doc_center_ids, '[]'::jsonb) && COALESCE(user_centers, '[]'::jsonb);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.save_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO public.document_versions (document_id, content, version, created_by, created_at)
    VALUES (OLD.id, OLD.content, OLD.version, OLD.created_by, NOW());
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- ============================================================
-- 4. TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_name TEXT NOT NULL DEFAULT '',
    contact_phone TEXT NOT NULL DEFAULT '',
    license_type license_type NOT NULL DEFAULT 'basic',
    license_expiry TIMESTAMPTZ,
    max_hotels INTEGER NOT NULL DEFAULT 1,
    max_users INTEGER NOT NULL DEFAULT 10,
    active_hotels INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    status client_status NOT NULL DEFAULT 'trial',
    monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, code)
);

CREATE TABLE IF NOT EXISTS public.centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    status center_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    center_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE RESTRICT,
    center_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    visibility document_visibility NOT NULL DEFAULT 'private',
    status document_status NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    approval_date TIMESTAMPTZ,
    is_visible BOOLEAN NOT NULL DEFAULT false,
    source_type document_source_type NOT NULL DEFAULT 'manual',
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'application/pdf',
    is_signed_original BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    document_title TEXT NOT NULL,
    reminder_date TIMESTAMPTZ NOT NULL,
    email_recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_triggered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. ÍNDICES
-- ============================================================
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_departments_client_id ON public.departments(client_id);
CREATE INDEX idx_centers_status ON public.centers(status);
CREATE INDEX idx_centers_client_id ON public.centers(client_id);
CREATE INDEX idx_users_client_id ON public.users(client_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department_id);
CREATE INDEX idx_users_center_ids ON public.users USING GIN(center_ids);
CREATE INDEX idx_documents_topic_id ON public.documents(topic_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_department_id ON public.documents(department_id);
CREATE INDEX idx_documents_center_ids ON public.documents USING GIN(center_ids);
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_attachments_doc_id ON public.document_attachments(document_id);
CREATE INDEX idx_versions_doc_id ON public.document_versions(document_id);
CREATE INDEX idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_alarms_document_id ON public.alarms(document_id);
CREATE INDEX idx_alarms_reminder ON public.alarms(reminder_date);

-- ============================================================
-- 6. TRIGGERS
-- ============================================================
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_centers_updated_at BEFORE UPDATE ON public.centers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_topics_updated_at BEFORE UPDATE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_alarms_updated_at BEFORE UPDATE ON public.alarms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_documents_save_version BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.save_document_version();

-- ============================================================
-- 7. RLS ENABLE
-- ============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

-- CLIENTS
DO $$ BEGIN
  CREATE POLICY "clients_select" ON public.clients FOR SELECT TO authenticated
    USING (public.get_current_user_role() = 'master' OR client_id = public.get_current_user_client_id());
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "clients_all_master" ON public.clients FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- DEPARTMENTS
DO $$ BEGIN
  CREATE POLICY "dept_select" ON public.departments FOR SELECT TO authenticated
    USING (public.get_current_user_role() = 'master' OR client_id = public.get_current_user_client_id());
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "dept_all_master" ON public.departments FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "dept_client_admin" ON public.departments FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'clientAdmin' AND client_id = public.get_current_user_client_id());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CENTERS
DO $$ BEGIN
  CREATE POLICY "centers_select" ON public.centers FOR SELECT TO authenticated
    USING (public.get_current_user_role() = 'master' OR client_id = public.get_current_user_client_id()
           OR public.user_has_center_access(jsonb_build_array(id::text)));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "centers_all_master" ON public.centers FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- USERS
DO $$ BEGIN
  CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.get_current_user_role() = 'master'
           OR (public.get_current_user_role() IN ('clientAdmin','hotelAdmin') AND client_id = public.get_current_user_client_id()));
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "users_all_master" ON public.users FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- TOPICS
DO $$ BEGIN
  CREATE POLICY "topics_select" ON public.topics FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "topics_all_master" ON public.topics FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- DOCUMENTS
DO $$ BEGIN
  CREATE POLICY "docs_select" ON public.documents FOR SELECT TO authenticated
    USING (public.get_current_user_role() = 'master'
           OR client_id = public.get_current_user_client_id()
           OR (public.user_has_center_access(center_ids) AND status = 'approved' AND is_visible = true)
           OR visibility = 'public'
           OR created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "docs_all_master" ON public.documents FOR ALL TO authenticated
    USING (public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ATTACHMENTS / VERSIONS / ALARMS (inherit from document)
DO $$ BEGIN
  CREATE POLICY "att_select" ON public.document_attachments FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND d.created_by = auth.uid())
           OR public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "ver_select" ON public.document_versions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND d.created_by = auth.uid())
           OR public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "alarm_select" ON public.alarms FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND d.created_by = auth.uid())
           OR public.get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- AUDIT LOGS (immutable)
DO $$ BEGIN
  CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
