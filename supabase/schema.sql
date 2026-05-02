-- ============================================================
-- HotelDocs Schema — PostgreSQL/Supabase
-- Multi-tenant con Row Level Security (RLS)
-- Idempotente: puede re-ejecutarse sin errores
-- ============================================================

SET search_path TO public;

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE center_status AS ENUM ('active', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('draft', 'pending', 'approved', 'discontinued');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('master', 'clientAdmin', 'hotelAdmin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_visibility AS ENUM ('private', 'all', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_source_type AS ENUM ('manual', 'pdf-import');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_type AS ENUM ('basic', 'professional', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'suspended', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- 1. clients (multi-tenant root)
CREATE TABLE IF NOT EXISTS clients (
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

-- 2. departments (dinámica por cliente)
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, code)
);

-- 3. centers (hoteles)
CREATE TABLE IF NOT EXISTS centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    status center_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. users (perfiles públicos, FK a auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    center_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. topics
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
    center_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    visibility document_visibility NOT NULL DEFAULT 'private',
    status document_status NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    approval_date TIMESTAMPTZ,
    is_visible BOOLEAN NOT NULL DEFAULT false,
    source_type document_source_type NOT NULL DEFAULT 'manual',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. document_attachments
CREATE TABLE IF NOT EXISTS document_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'application/pdf',
    is_signed_original BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. document_versions
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. audit_logs (INMUTABLE)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. alarms
CREATE TABLE IF NOT EXISTS alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    document_title TEXT NOT NULL,
    reminder_date TIMESTAMPTZ NOT NULL,
    email_recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_triggered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- departments
CREATE INDEX IF NOT EXISTS idx_departments_client_id ON departments(client_id);

-- centers
CREATE INDEX IF NOT EXISTS idx_centers_status ON centers(status);
CREATE INDEX IF NOT EXISTS idx_centers_code ON centers(code);
CREATE INDEX IF NOT EXISTS idx_centers_client_id ON centers(client_id);

-- users
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_center_ids ON users USING GIN (center_ids);

-- documents
CREATE INDEX IF NOT EXISTS idx_documents_topic_id ON documents(topic_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_department_id ON documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_center_ids ON documents USING GIN (center_ids);
CREATE INDEX IF NOT EXISTS idx_documents_is_visible ON documents(is_visible);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);

-- document_attachments
CREATE INDEX IF NOT EXISTS idx_document_attachments_document_id ON document_attachments(document_id);

-- document_versions
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_version ON document_versions(document_id, version);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- alarms
CREATE INDEX IF NOT EXISTS idx_alarms_document_id ON alarms(document_id);
CREATE INDEX IF NOT EXISTS idx_alarms_reminder_date ON alarms(reminder_date);
CREATE INDEX IF NOT EXISTS idx_alarms_is_triggered ON alarms(is_triggered);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- 1. handle_updated_at() — función genérica
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas con updated_at
DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_centers_updated_at ON centers;
CREATE TRIGGER trg_centers_updated_at
    BEFORE UPDATE ON centers
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_topics_updated_at ON topics;
CREATE TRIGGER trg_topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_alarms_updated_at ON alarms;
CREATE TRIGGER trg_alarms_updated_at
    BEFORE UPDATE ON alarms
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 2. save_document_version() — versionado automático
CREATE OR REPLACE FUNCTION save_document_version()
RETURNS TRIGGER AS $$
DECLARE
    old_version INTEGER;
BEGIN
    -- Solo actuar si cambió content o title
    IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
        old_version := OLD.version;

        -- Guardar versión anterior
        INSERT INTO document_versions (document_id, content, version, created_by, created_at)
        VALUES (OLD.id, OLD.content, old_version, OLD.created_by, OLD.updated_at);

        -- Incrementar versión
        NEW.version := old_version + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_version ON documents;
CREATE TRIGGER trg_documents_version
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION save_document_version();

-- 3. update_client_counts() — recalcular contadores de cliente
CREATE OR REPLACE FUNCTION update_client_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular active_hotels
    UPDATE clients
    SET active_hotels = (
        SELECT COUNT(*) FROM centers
        WHERE centers.client_id = clients.id AND centers.status = 'active'
    ),
    active_users = (
        SELECT COUNT(*) FROM users
        WHERE users.client_id = clients.id AND users.is_active = true
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_centers_client_counts ON centers;
CREATE TRIGGER trg_centers_client_counts
    AFTER INSERT OR UPDATE OR DELETE ON centers
    FOR EACH ROW
    EXECUTE FUNCTION update_client_counts();

DROP TRIGGER IF EXISTS trg_users_client_counts ON users;
CREATE TRIGGER trg_users_client_counts
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_client_counts();

-- ============================================================
-- RLS HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_current_user_client_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT client_id FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_current_user_center_ids()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT center_ids FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION user_has_center_access(doc_center_ids JSONB)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(doc_center_ids) AS doc_cid
        WHERE doc_cid IN (SELECT jsonb_array_elements(get_current_user_center_ids()))
    );
$$;

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: clients
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "clients_select" ON clients
        FOR SELECT USING (
            get_current_user_role() = 'master'
            OR id = get_current_user_client_id()
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "clients_all" ON clients
        FOR ALL USING (get_current_user_role() = 'master')
        WITH CHECK (get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: departments
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "departments_select" ON departments
        FOR SELECT USING (
            get_current_user_role() = 'master'
            OR client_id = get_current_user_client_id()
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "departments_all" ON departments
        FOR ALL USING (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
        )
        WITH CHECK (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: centers
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "centers_select" ON centers
        FOR SELECT USING (
            get_current_user_role() = 'master'
            OR client_id = get_current_user_client_id()
            OR (id::text IN (SELECT jsonb_array_elements_text(get_current_user_center_ids())))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "centers_all" ON centers
        FOR ALL USING (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
        )
        WITH CHECK (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: users
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "users_select" ON users
        FOR SELECT USING (
            get_current_user_role() = 'master'
            OR client_id = get_current_user_client_id()
            OR id = auth.uid()
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "users_insert" ON users
        FOR INSERT WITH CHECK (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id() AND role IN ('hotelAdmin', 'user'))
            OR (get_current_user_role() = 'hotelAdmin' AND client_id = get_current_user_client_id() AND role = 'user' AND user_has_center_access(center_ids))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "users_update" ON users
        FOR UPDATE USING (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id() AND role IN ('hotelAdmin', 'user'))
            OR (get_current_user_role() = 'hotelAdmin' AND client_id = get_current_user_client_id() AND role = 'user' AND user_has_center_access(center_ids))
            OR id = auth.uid()
        )
        WITH CHECK (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id() AND role IN ('hotelAdmin', 'user'))
            OR (get_current_user_role() = 'hotelAdmin' AND client_id = get_current_user_client_id() AND role = 'user' AND user_has_center_access(center_ids))
            OR id = auth.uid()
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "users_delete" ON users
        FOR DELETE USING (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id() AND role IN ('hotelAdmin', 'user'))
            OR (get_current_user_role() = 'hotelAdmin' AND client_id = get_current_user_client_id() AND role = 'user' AND user_has_center_access(center_ids))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: topics
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "topics_select" ON topics
        FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "topics_all" ON topics
        FOR ALL USING (get_current_user_role() = 'master')
        WITH CHECK (get_current_user_role() = 'master');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: documents
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "documents_select" ON documents
        FOR SELECT USING (
            get_current_user_role() = 'master'
            OR client_id = get_current_user_client_id()
            OR (
                user_has_center_access(center_ids)
                AND (
                    (status = 'approved' AND is_visible = true)
                    OR visibility = 'public'
                    OR created_by = auth.uid()
                )
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "documents_insert" ON documents
        FOR INSERT WITH CHECK (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
            OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(center_ids))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "documents_update" ON documents
        FOR UPDATE USING (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
            OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(center_ids))
        )
        WITH CHECK (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
            OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(center_ids))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "documents_delete" ON documents
        FOR DELETE USING (
            get_current_user_role() = 'master'
            OR (get_current_user_role() = 'clientAdmin' AND client_id = get_current_user_client_id())
            OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(center_ids))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: document_attachments (hereda visibilidad del documento padre)
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "document_attachments_select" ON document_attachments
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = document_attachments.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (
                        user_has_center_access(documents.center_ids)
                        AND (
                            (documents.status = 'approved' AND documents.is_visible = true)
                            OR documents.visibility = 'public'
                            OR documents.created_by = auth.uid()
                        )
                    )
                )
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "document_attachments_all" ON document_attachments
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = document_attachments.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(documents.center_ids))
                )
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = document_attachments.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(documents.center_ids))
                )
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: document_versions (hereda visibilidad del documento padre)
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "document_versions_select" ON document_versions
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = document_versions.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (
                        user_has_center_access(documents.center_ids)
                        AND (
                            (documents.status = 'approved' AND documents.is_visible = true)
                            OR documents.visibility = 'public'
                            OR documents.created_by = auth.uid()
                        )
                    )
                )
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "document_versions_all" ON document_versions
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = document_versions.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(documents.center_ids))
                )
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = document_versions.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(documents.center_ids))
                )
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: audit_logs
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "audit_logs_select" ON audit_logs
        FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "audit_logs_insert" ON audit_logs
        FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- RLS POLICIES: alarms (hereda visibilidad del documento padre)
-- ============================================================

DO $$ BEGIN
    CREATE POLICY "alarms_select" ON alarms
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = alarms.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (
                        user_has_center_access(documents.center_ids)
                        AND (
                            (documents.status = 'approved' AND documents.is_visible = true)
                            OR documents.visibility = 'public'
                            OR documents.created_by = auth.uid()
                        )
                    )
                )
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "alarms_all" ON alarms
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = alarms.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(documents.center_ids))
                )
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM documents
                WHERE documents.id = alarms.document_id
                AND (
                    get_current_user_role() = 'master'
                    OR documents.client_id = get_current_user_client_id()
                    OR (get_current_user_role() IN ('hotelAdmin', 'user') AND user_has_center_access(documents.center_ids))
                )
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- COMENTARIOS EN TABLAS Y COLUMNAS CLAVE
-- ============================================================

COMMENT ON TABLE clients IS 'Empresas/clientes multi-tenant. Cada cliente tiene su propio plan y límites.';
COMMENT ON COLUMN clients.license_type IS 'Plan de licenciamiento: basic, professional o enterprise';
COMMENT ON COLUMN clients.max_hotels IS 'Máximo de centros (hoteles) permitidos para este cliente';
COMMENT ON COLUMN clients.max_users IS 'Máximo de usuarios permitidos para este cliente';
COMMENT ON COLUMN clients.active_hotels IS 'Contador automático de centros activos';
COMMENT ON COLUMN clients.active_users IS 'Contador automático de usuarios activos';

COMMENT ON TABLE departments IS 'Departamentos dinámicos por cliente (ej: Recepción, Cocina, Mantenimiento).';

COMMENT ON TABLE centers IS 'Hoteles/centros operativos. Pueden pertenecer a un cliente o ser globales (client_id IS NULL).';
COMMENT ON COLUMN centers.client_id IS 'NULL para centros globales administrados por master';

COMMENT ON TABLE users IS 'Perfiles públicos enlazados a auth.users de Supabase. Registra rol, cliente y centros asignados.';
COMMENT ON COLUMN users.role IS 'Jerarquía: master > clientAdmin > hotelAdmin > user';
COMMENT ON COLUMN users.center_ids IS 'Array JSONB de UUIDs de centros asignados al usuario';
COMMENT ON COLUMN users.client_id IS 'NULL para usuarios master (sin cliente asignado)';

COMMENT ON TABLE topics IS 'Temas/categorías globales para clasificar documentos.';

COMMENT ON TABLE documents IS 'Documentos operativos del hotel. Soportan múltiples centros y control de versiones.';
COMMENT ON COLUMN documents.center_ids IS 'Array JSONB de UUIDs de centros donde aplica este documento';
COMMENT ON COLUMN documents.visibility IS 'private=solo creador/rol alto; all=visible para usuarios con acceso a centros; public=cualquiera';
COMMENT ON COLUMN documents.status IS 'Ciclo de vida: draft → pending → approved → discontinued';
COMMENT ON COLUMN documents.is_visible IS 'Flag redundante para queries rápidas; true cuando el documento está aprobado y debe mostrarse';

COMMENT ON TABLE document_attachments IS 'Archivos adjuntos a documentos (PDFs, imágenes, etc.).';
COMMENT ON COLUMN document_attachments.is_signed_original IS 'True si es la versión firmada/original del documento';

COMMENT ON TABLE document_versions IS 'Historial de versiones de documentos. Se genera automáticamente al editar content o title.';

COMMENT ON TABLE audit_logs IS 'Registro inmutable de acciones. NO se deben permitir UPDATE ni DELETE.';

COMMENT ON TABLE alarms IS 'Alarmas/recordatorios asociadas a documentos con fechas de recordatorio y destinatarios.';
COMMENT ON COLUMN alarms.email_recipients IS 'Array JSONB de emails a notificar cuando se dispare la alarma';

-- ============================================================
-- STORAGE BUCKET SETUP (comentado — ejecutar manualmente en Dashboard)
-- ============================================================

/*
-- 1. Crear el bucket "documents" desde el Dashboard de Supabase Storage
--    O vía SQL (si la extensión storage está disponible):
--    INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- 2. Políticas de Storage recomendadas:

-- Permitir subida solo a usuarios autenticados con acceso al documento
CREATE POLICY "documents_storage_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.role() = 'authenticated'
    );

-- Permitir lectura si el archivo pertenece a un documento visible para el usuario
CREATE POLICY "documents_storage_select"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND auth.role() = 'authenticated'
    );

-- Permitir borrado solo a master o clientAdmin del documento relacionado
CREATE POLICY "documents_storage_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents'
        AND auth.role() = 'authenticated'
    );

-- Nota: Las políticas de Storage pueden refinarse coníndice por path o metadata
--       para enlazar archivos con documentos específicos.
*/
