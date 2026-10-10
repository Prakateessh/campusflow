-- ═══════════════════════════════════════════════════════════════
-- CampusFlow — Full reset
--   Wipes all mock data. Keeps facilities (1–47) + users.
--   Recreates requests / items / approvals / orders with a
--   nullable facility_id so non-lab kinds work without a stub.
-- Run: wrangler d1 execute campusflow-db --file=./reset_v3.sql --remote
-- ═══════════════════════════════════════════════════════════════

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS canteen_orders;
DROP TABLE IF EXISTS approvals;
DROP TABLE IF EXISTS request_items;
DROP TABLE IF EXISTS canteen_menu;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS library_books;
DROP TABLE IF EXISTS project_outcomes;
DROP TABLE IF EXISTS projects;

PRAGMA foreign_keys = ON;

-- ── requests (nullable facility_id) ──
CREATE TABLE requests (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  kind                TEXT NOT NULL CHECK (kind IN ('lab','canteen','library','sports','store')),
  requester_id        INTEGER NOT NULL REFERENCES users(id),
  sponsor_id          INTEGER REFERENCES users(id),
  facility_id         INTEGER REFERENCES facilities(id),
  title               TEXT NOT NULL,
  description         TEXT,
  purpose             TEXT,
  return_by           TEXT,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                        'draft','submitted','pending_approval','approved',
                        'rejected','scheduled','in_progress','completed',
                        'cancelled','overdue')),
  scheduled_start     TEXT,
  scheduled_end       TEXT,
  recurrence_rule     TEXT,
  parent_request_id   INTEGER REFERENCES requests(id),
  cancellation_reason TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at        TEXT,
  approved_at         TEXT,
  completed_at        TEXT,
  cancelled_at        TEXT
);
CREATE INDEX idx_requests_requester ON requests(requester_id);
CREATE INDEX idx_requests_sponsor   ON requests(sponsor_id);
CREATE INDEX idx_requests_facility  ON requests(facility_id);
CREATE INDEX idx_requests_status    ON requests(status);
CREATE INDEX idx_requests_schedule  ON requests(scheduled_start);
CREATE INDEX idx_requests_parent    ON requests(parent_request_id);

-- ── request_items ──
CREATE TABLE request_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id   INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  item_type    TEXT NOT NULL CHECK (item_type IN (
                 'inventory','menu_item','service','slot','material',
                 'book','sports_equipment')),
  inventory_id INTEGER REFERENCES inventory(id),
  menu_item_id INTEGER REFERENCES canteen_menu(id),
  quantity     INTEGER NOT NULL DEFAULT 1,
  unit         TEXT,
  notes        TEXT
);
CREATE INDEX idx_items_request   ON request_items(request_id);
CREATE INDEX idx_items_inventory ON request_items(inventory_id);

-- ── approvals ──
CREATE TABLE approvals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id    INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  approver_id   INTEGER NOT NULL REFERENCES users(id),
  approver_role TEXT NOT NULL,
  decision      TEXT NOT NULL CHECK (decision IN ('approved','rejected','needs_info')),
  comments      TEXT,
  decided_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_approvals_request ON approvals(request_id);

-- ── canteen_menu (empty) ──
CREATE TABLE canteen_menu (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  facility_id       INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  price_cents       INTEGER NOT NULL,
  prep_time_minutes INTEGER NOT NULL DEFAULT 10,
  category          TEXT,
  available         INTEGER NOT NULL DEFAULT 1,
  display_order     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_menu_facility  ON canteen_menu(facility_id);
CREATE INDEX idx_menu_available ON canteen_menu(facility_id, available);

-- ── canteen_orders (empty) ──
CREATE TABLE canteen_orders (
  request_id        INTEGER PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  pickup_at         TEXT NOT NULL,
  paid_at           TEXT,
  payment_reference TEXT,
  queue_position    INTEGER,
  prep_started_at   TEXT,
  prep_completed_at TEXT,
  ready_notified_at TEXT
);
CREATE INDEX idx_orders_queue ON canteen_orders(queue_position);
CREATE INDEX idx_orders_prep  ON canteen_orders(prep_started_at);

-- ── inventory (empty) ──
CREATE TABLE inventory (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  facility_id        INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  sku                TEXT NOT NULL,
  name               TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN (
                       'component','material','tool','book','sports_equipment')),
  quantity_total     INTEGER NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  unit               TEXT NOT NULL DEFAULT 'piece',
  requires_return    INTEGER NOT NULL DEFAULT 1,
  return_days        INTEGER,
  notes              TEXT,
  UNIQUE (facility_id, sku)
);
CREATE INDEX idx_inventory_facility ON inventory(facility_id);
CREATE INDEX idx_inventory_kind     ON inventory(kind);

-- ── library_books (empty) ──
CREATE TABLE library_books (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  isbn             TEXT UNIQUE,
  title            TEXT NOT NULL,
  author           TEXT,
  total_copies     INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  shelf_code       TEXT,
  notes            TEXT
);
CREATE INDEX idx_books_title  ON library_books(title);
CREATE INDEX idx_books_author ON library_books(author);

-- ── notifications (empty) ──
CREATE TABLE notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  kind       TEXT NOT NULL CHECK (kind IN (
               'approval','rejection','ready','overdue','reminder',
               'crowd_alert','system')),
  request_id INTEGER REFERENCES requests(id),
  read_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notifications_user    ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ── projects (empty) ──
CREATE TABLE projects (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id          INTEGER NOT NULL REFERENCES users(id),
  title               TEXT NOT NULL,
  description         TEXT,
  tech_stack          TEXT,
  required_components TEXT,
  status              TEXT NOT NULL DEFAULT 'planning' CHECK (status IN (
                        'planning','active','completed','abandoned')),
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_projects_student ON projects(student_id);
CREATE INDEX idx_projects_status  ON projects(status);

-- ── project_outcomes (empty) ──
CREATE TABLE project_outcomes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  facility_id   INTEGER NOT NULL REFERENCES facilities(id),
  outcome       TEXT NOT NULL CHECK (outcome IN ('success','partial','failed')),
  duration_days INTEGER,
  notes         TEXT,
  completed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_outcomes_project  ON project_outcomes(project_id);
CREATE INDEX idx_outcomes_facility ON project_outcomes(facility_id);

-- Delete the stubbed library facility
DELETE FROM facilities WHERE id = 48;