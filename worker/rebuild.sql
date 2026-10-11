-- ═══════════════════════════════════════════════════════════════
-- CampusFlow — Rebuild users + facility contacts from CSV
-- Run: wrangler d1 execute campusflow-db --file=./rebuild.sql --remote
-- ═══════════════════════════════════════════════════════════════

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS facility_contacts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS canteen_orders;
DROP TABLE IF EXISTS approvals;
DROP TABLE IF EXISTS request_items;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS library_loans;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('student','faculty','technician','service_provider','admin')),
  department  TEXT,
  sponsor_id  INTEGER REFERENCES users(id),
  phone       TEXT,
  password    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_sponsor ON users(sponsor_id);

CREATE TABLE requests (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  kind              TEXT NOT NULL CHECK (kind IN ('lab','canteen','library','sports','store')),
  requester_id      INTEGER NOT NULL REFERENCES users(id),
  sponsor_id        INTEGER REFERENCES users(id),
  facility_id       INTEGER REFERENCES facilities(id),
  title             TEXT NOT NULL,
  description       TEXT,
  purpose           TEXT,
  return_by         TEXT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','pending_approval','approved','rejected','scheduled','in_progress','completed','cancelled','overdue')),
  scheduled_start   TEXT,
  scheduled_end     TEXT,
  recurrence_rule   TEXT,
  parent_request_id INTEGER REFERENCES requests(id),
  cancellation_reason TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at      TEXT,
  approved_at       TEXT,
  completed_at      TEXT,
  cancelled_at      TEXT
);
CREATE INDEX idx_requests_requester ON requests(requester_id);
CREATE INDEX idx_requests_sponsor   ON requests(sponsor_id);
CREATE INDEX idx_requests_facility  ON requests(facility_id);
CREATE INDEX idx_requests_status    ON requests(status);

CREATE TABLE request_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id   INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  item_type    TEXT NOT NULL CHECK (item_type IN ('inventory','menu_item','service','slot','material','book','sports_equipment')),
  inventory_id INTEGER,
  menu_item_id INTEGER,
  quantity     INTEGER NOT NULL DEFAULT 1,
  unit         TEXT,
  notes        TEXT
);
CREATE INDEX idx_items_request ON request_items(request_id);

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

CREATE TABLE library_loans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  book_id     INTEGER NOT NULL REFERENCES library_books(id),
  borrowed_at TEXT NOT NULL DEFAULT (datetime('now')),
  due_date    TEXT NOT NULL,
  returned_at TEXT,
  renewals    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_loans_user ON library_loans(user_id, returned_at);

CREATE TABLE notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT,
  kind       TEXT NOT NULL,
  request_id INTEGER REFERENCES requests(id),
  read_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════
-- FACILITY CONTACTS — maps facility to its in-charge faculty
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE facility_contacts (
  facility_id INTEGER NOT NULL REFERENCES facilities(id),
  user_id     INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (facility_id, user_id)
);
CREATE INDEX idx_contacts_user ON facility_contacts(user_id);

PRAGMA foreign_keys = ON;

-- ═══════════════════════════════════════════════════════════════
-- FACULTY — every CSV contact becomes a user
-- ═══════════════════════════════════════════════════════════════
INSERT INTO users (email, name, role, department, password) VALUES
  ('p_sudheesh@cb.amrita.edu',          'Sudheesh P.',              'faculty', 'ECE',        'demo'),
  ('bn_prashanth@blr.amrita.edu',       'Dr. Prashanth B. N.',      'faculty', 'MECH',       'demo'),
  ('idealab@cb.amrita.edu',             'Dr. Sasangan Ramanathan',  'faculty', 'Innovation', 'demo'),
  ('c_lakshmik@cb.amrita.edu',          'Mr. C. Lakshmikanthan',    'faculty', 'MECH',       'demo'),
  ('a_arun@cb.amrita.edu',              'Dr. Arun A.',              'faculty', 'MECH',       'demo'),
  ('s_natarajamani@cb.amrita.edu',      'Dr. Natarajamani S.',      'faculty', 'ECE',        'demo'),
  ('s_adarsh@cb.amrita.edu',            'Dr. Adarsh S.',            'faculty', 'ECE',        'demo'),
  ('ks_anusha@cb.amrita.edu',           'Dr. Anusha K. S.',         'faculty', 'ECE',        'demo'),
  ('l_vidhya@cb.amrita.edu',            'Vidya L',                  'faculty', 'ECE',        'demo'),
  ('j_aravinth@cb.amrita.edu',          'Dr. J. Aravinth',          'faculty', 'ECE',        'demo'),
  ('m_navya@cb.amrita.edu',             'Dr. Navya Mohan',          'faculty', 'ECE',        'demo'),
  ('j_rolantgini@cb.amrita.edu',        'Dr. Rolant Gini J.',       'faculty', 'ECE',        'demo'),
  ('a_baskar@cb.amrita.edu',            'Dr. Baskar A.',            'faculty', 'CSE',        'demo'),
  ('kp_peeyush@cb.amrita.edu',          'Peeyush K. P.',            'faculty', 'ECE',        'demo'),
  ('s_umashankar@cb.amrita.edu',        'Dr. Umashankar Subramaniam','faculty','EEE',        'demo'),
  ('m_akhil1@cb.amrita.edu',            'Dr. Akhil Mohan',          'faculty', 'CEN',        'demo'),
  ('vm_akhil@cb.amrita.edu',            'Dr. Akhil V. M.',          'faculty', 'AI',         'demo'),
  ('v_amrutha1@cb.amrita.edu',          'Dr. Amrutha Veluppal',     'faculty', 'AI',         'demo'),
  ('j_govindarajan@cb.amrita.edu',      'Dr. J. Govindarajan',      'faculty', 'CSE',        'demo'),
  ('s_vishnu1@cb.amrita.edu',           'Dr. S. Vishnu',            'faculty', 'CSE',        'demo'),
  ('b_rajathilagam@cb.amrita.edu',      'Dr. Rajathilagam B.',      'faculty', 'CSE',        'demo'),
  ('bala@am.amrita.edu',                'Dr. Balakrishnan Shankar', 'faculty', 'Engineering','demo'),
  ('n_mohankumar@cb.amrita.edu',        'Mohankumar N.',            'faculty', 'ECE',        'demo'),
  ('s_krithiga@cb.amrita.edu',          'Dr. Kirthiga S.',          'faculty', 'ECE',        'demo'),
  ('n_madhumohan@cb.amrita.edu',        'Dr. Madhu Mohan N.',       'faculty', 'ECE',        'demo'),
  ('m_saimurugan@cb.amrita.edu',        'Dr. Saimurugan M.',        'faculty', 'MECH',       'demo'),
  ('krishna@amrita.edu',                'Dr. Krishnashree Achuthan','faculty', 'CSE',        'demo'),
  ('a_sumesh@cb.amrita.edu',            'Dr. A. Sumesh',            'faculty', 'MECH',       'demo'),
  ('r_senthilkumar@cb.amrita.edu',      'Mr. R. Senthilkumar',      'faculty', 'MECH',       'demo'),
  ('ar_vijayanarayanan@cb.amrita.edu',  'Dr. Vijayanarayanan A. R.','faculty', 'Civil',      'demo'),
  ('k_srinivasan@cb.amrita.edu',        'Mr. K. Srinivasan',        'faculty', 'Civil',      'demo');

-- ═══════════════════════════════════════════════════════════════
-- STAFF
-- ═══════════════════════════════════════════════════════════════
INSERT INTO users (email, name, role, department, password) VALUES
  ('admin@cb.amrita.edu',        'Administration', 'admin',            'Administration', 'demo'),
  ('canteen@cb.amrita.edu',      'Canteen Staff',  'service_provider', 'Canteen',        'demo'),
  ('library@cb.amrita.edu',      'Library Staff',  'service_provider', 'Library',        'demo');

-- ═══════════════════════════════════════════════════════════════
-- STUDENTS — Amrita email format
-- ═══════════════════════════════════════════════════════════════
INSERT INTO users (email, name, role, department, password) VALUES
  ('cb.en.u4cse21001@cb.students.amrita.edu',  'Student 1-CSE',  'student', 'CSE',  'demo'),
  ('cb.en.u4cse21002@cb.students.amrita.edu',  'Student 2-CSE',  'student', 'CSE',  'demo'),
  ('cb.en.u4ece21001@cb.students.amrita.edu',  'Student 3-ECE',  'student', 'ECE',  'demo'),
  ('cb.en.u4ece21002@cb.students.amrita.edu',  'Student 4-ECE',  'student', 'ECE',  'demo'),
  ('cb.en.u4mech21001@cb.students.amrita.edu', 'Student 5-MECH', 'student', 'MECH', 'demo');

-- ═══════════════════════════════════════════════════════════════
-- FACILITY CONTACTS — one row per (facility, faculty)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO facility_contacts (facility_id, user_id)
SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-01' AND u.email = 'p_sudheesh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-01' AND u.email = 'bn_prashanth@blr.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-02' AND u.email = 'idealab@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-01' AND u.email = 'c_lakshmik@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-02' AND u.email = 'a_arun@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-03' AND u.email = 's_natarajamani@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-04' AND u.email = 's_adarsh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-05' AND u.email = 'ks_anusha@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-06' AND u.email = 'l_vidhya@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-02' AND u.email = 'j_aravinth@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-07' AND u.email = 'j_aravinth@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-08' AND u.email = 'm_navya@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-09' AND u.email = 'j_rolantgini@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-03' AND u.email = 'a_baskar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-02' AND u.email = 'kp_peeyush@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'N-02' AND u.email = 's_umashankar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'N-03' AND u.email = 'm_akhil1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-03' AND u.email = 'vm_akhil@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-03' AND u.email = 'v_amrutha1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-04' AND u.email = 'j_govindarajan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-04' AND u.email = 's_vishnu1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-05' AND u.email = 'b_rajathilagam@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'CH-02' AND u.email = 'bala@am.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-10' AND u.email = 'n_mohankumar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-11' AND u.email = 's_krithiga@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-12' AND u.email = 'n_madhumohan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-04' AND u.email = 'm_saimurugan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-04' AND u.email = 'krishna@amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-05' AND u.email = 'a_sumesh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-05' AND u.email = 'r_senthilkumar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-06' AND u.email = 'ar_vijayanarayanan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-06' AND u.email = 'k_srinivasan@cb.amrita.edu';