-- NyayMitra PostgreSQL Database Schema
-- Run: psql -U postgres -d nyaymitra -f schema.sql

CREATE DATABASE IF NOT EXISTS nyaymitra;
\c nyaymitra;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users / Sessions ────────────────────────────────────────
CREATE TABLE chat_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(128) UNIQUE NOT NULL,
    user_name       VARCHAR(100),
    user_phone      VARCHAR(15),
    language        VARCHAR(20) DEFAULT 'hinglish',
    urgency         VARCHAR(10) DEFAULT 'low' CHECK (urgency IN ('low','medium','high')),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','resolved','escalated','archived')),
    category_tag    VARCHAR(50),
    location        VARCHAR(100),
    assigned_admin  UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    resolution_note TEXT
);

CREATE INDEX idx_sessions_urgency ON chat_sessions(urgency);
CREATE INDEX idx_sessions_status ON chat_sessions(status);
CREATE INDEX idx_sessions_created ON chat_sessions(created_at);

-- ─── Messages ─────────────────────────────────────────────────
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(128) NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','admin','system')),
    content         TEXT NOT NULL,
    ipc_sections    TEXT[],  -- Array of section strings
    urgency         VARCHAR(10),
    language        VARCHAR(20) DEFAULT 'hinglish',
    document_ref    UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
    confidence      FLOAT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ─── Generated Documents ─────────────────────────────────────
CREATE TABLE generated_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(128) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    doc_type        VARCHAR(50) NOT NULL,  -- fir, rti, notice, complaint, bail, affidavit
    title           VARCHAR(200),
    content         TEXT NOT NULL,
    form_data       JSONB,
    language        VARCHAR(20) DEFAULT 'hindi',
    download_count  INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_docs_session ON generated_documents(session_id);
CREATE INDEX idx_docs_type ON generated_documents(doc_type);

-- ─── Admin Users ─────────────────────────────────────────────
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(200) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(30) DEFAULT 'lawyer' CHECK (role IN ('lawyer','senior_lawyer','admin','superadmin')),
    specialization  VARCHAR(100),
    bar_number      VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Case Tags ────────────────────────────────────────────────
CREATE TABLE case_tags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(128) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    tag             VARCHAR(50) NOT NULL,
    tagged_by       UUID REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── IPC/CrPC Reference ──────────────────────────────────────
CREATE TABLE legal_sections (
    id              SERIAL PRIMARY KEY,
    act_name        VARCHAR(200) NOT NULL,  -- IPC, CrPC, RTI Act, etc.
    section_number  VARCHAR(20) NOT NULL,
    section_title   VARCHAR(300),
    description     TEXT,
    keywords        TEXT[],
    punishment      TEXT,
    is_bailable     BOOLEAN,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_keywords ON legal_sections USING gin(keywords);

-- ─── Feedback ────────────────────────────────────────────────
CREATE TABLE user_feedback (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      VARCHAR(128) REFERENCES chat_sessions(session_id),
    message_id      UUID REFERENCES messages(id),
    rating          INT CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit Log ───────────────────────────────────────────────
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       VARCHAR(128),
    admin_id        UUID REFERENCES admin_users(id),
    details         JSONB,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Triggers: auto-update updated_at ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sessions_updated
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Seed: IPC Sections ──────────────────────────────────────
INSERT INTO legal_sections (act_name, section_number, section_title, keywords, is_bailable) VALUES
('IPC', '420', 'Cheating and dishonestly inducing delivery of property', ARRAY['fraud','cheating','deception','scam','money'], FALSE),
('IPC', '498A', 'Husband or relative subjecting woman to cruelty', ARRAY['domestic violence','cruelty','harassment','dowry','wife'], FALSE),
('IPC', '354', 'Assault or criminal force to woman with intent to outrage modesty', ARRAY['molestation','assault','woman','modesty'], FALSE),
('IPC', '302', 'Punishment for murder', ARRAY['murder','killing','homicide','death'], FALSE),
('IPC', '376', 'Punishment for rape', ARRAY['rape','sexual assault','molestation'], FALSE),
('IPC', '323', 'Punishment for voluntarily causing hurt', ARRAY['assault','hurt','beating','injury'], TRUE),
('IPC', '166A', 'Public servant disobeying law', ARRAY['police','FIR','refused','public servant'], FALSE),
('IPC', '406', 'Punishment for criminal breach of trust', ARRAY['breach of trust','fraud','money','cheating'], FALSE),
('IPC', '415', 'Cheating', ARRAY['cheat','fraud','deception','false pretense'], TRUE),
('CrPC', '154', 'Information in cognizable cases (FIR)', ARRAY['FIR','police','complaint','information'], NULL),
('CrPC', '156', 'Police officer authority', ARRAY['police','investigation','authority'], NULL),
('CrPC', '125', 'Order for maintenance of wives, children and parents', ARRAY['maintenance','alimony','wife','children','divorce'], NULL),
('RTI Act', '6', 'Request for information', ARRAY['RTI','information','government','application'], NULL),
('RTI Act', '7', 'Disposal of request', ARRAY['RTI','response','30 days','information'], NULL),
('PWDVA', '12', 'Application to Magistrate', ARRAY['domestic violence','protection order','woman','DV'], NULL),
('IT Act', '66D', 'Punishment for cheating by personation using computer resource', ARRAY['cyber','fraud','online','impersonation'], FALSE),
('IT Act', '66', 'Computer related offences', ARRAY['hacking','cyber crime','computer'], FALSE),
('Consumer Protection Act', '35', 'Filing of complaint', ARRAY['consumer','complaint','defect','deficiency','refund'], NULL),
('Industrial Disputes Act', '25F', 'Conditions precedent to retrenchment', ARRAY['job','termination','retrenchment','notice','salary'], NULL),
('Payment of Gratuity Act', '4', 'Payment of gratuity', ARRAY['gratuity','5 years','service','termination'], NULL);

-- ─── Views ───────────────────────────────────────────────────
CREATE VIEW active_sessions_view AS
SELECT 
    cs.session_id,
    cs.user_name,
    cs.urgency,
    cs.category_tag,
    cs.status,
    cs.location,
    COUNT(m.id) AS message_count,
    MAX(m.created_at) AS last_message_at,
    au.full_name AS assigned_admin_name
FROM chat_sessions cs
LEFT JOIN messages m ON cs.session_id = m.session_id
LEFT JOIN admin_users au ON cs.assigned_admin = au.id
WHERE cs.status = 'active'
GROUP BY cs.session_id, cs.user_name, cs.urgency, cs.category_tag, cs.status, cs.location, au.full_name
ORDER BY 
    CASE cs.urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
    last_message_at DESC;
