-- tokenoverflow CRM — D1 schema
-- Lightweight consultancy CRM embedded in the same Workers app

-- Contacts: anyone who has interacted with you
CREATE TABLE IF NOT EXISTS contacts (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  first_name  TEXT NOT NULL,
  last_name   TEXT,
  email       TEXT UNIQUE NOT NULL,
  company     TEXT,
  role        TEXT,
  phone       TEXT,
  linkedin    TEXT,
  source      TEXT NOT NULL DEFAULT 'website',
  tags        TEXT DEFAULT '[]',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);

-- Deals: consultancy pipeline
CREATE TABLE IF NOT EXISTS deals (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  contact_id     TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  stage          TEXT NOT NULL DEFAULT 'lead',
  value          REAL,
  currency       TEXT DEFAULT 'USD',
  description    TEXT,
  expected_close TEXT,
  lost_reason    TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);

-- Activities: every interaction logged
CREATE TABLE IF NOT EXISTS activities (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  contact_id  TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id     TEXT REFERENCES deals(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    TEXT DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

-- Form submissions: raw inbound from contact/booking forms
CREATE TABLE IF NOT EXISTS form_submissions (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  form_type   TEXT NOT NULL,
  name        TEXT,
  email       TEXT NOT NULL,
  company     TEXT,
  message     TEXT,
  metadata    TEXT DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'new',
  contact_id  TEXT REFERENCES contacts(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON form_submissions(email);

-- Email sequences: simple drip automation
CREATE TABLE IF NOT EXISTS email_sequences (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT NOT NULL,
  steps       TEXT NOT NULL DEFAULT '[]',
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tracks where each contact is in a sequence
CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  contact_id   TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sequence_id  TEXT NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'active',
  next_send_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(contact_id, sequence_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_next ON sequence_enrollments(next_send_at)
  WHERE status = 'active';

-- Pipeline stage history for analytics
CREATE TABLE IF NOT EXISTS deal_stage_history (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  deal_id    TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage   TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stage_history_deal ON deal_stage_history(deal_id);
