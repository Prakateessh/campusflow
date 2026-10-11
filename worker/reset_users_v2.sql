-- ═══════════════════════════════════════════════════════════════
-- CampusFlow — Clean user seed
--   All emails sourced from the ground-truth facility CSV.
--   Password for every account: 'demo' (prototype only).
-- Run: wrangler d1 execute campusflow-db --file=./reset_users_v2.sql --remote
-- ═══════════════════════════════════════════════════════════════

-- Wipe dependent rows first
DELETE FROM notifications;
DELETE FROM canteen_orders;
DELETE FROM approvals;
DELETE FROM request_items;
DELETE FROM requests;
DELETE FROM library_loans;
DELETE FROM users;

-- ── ADMIN ──
INSERT INTO users (id, email, name, role, department, sponsor_id, phone, password) VALUES
  (1, 'admin@cb.amrita.edu', 'Administration', 'admin', 'Administration', NULL, NULL, 'demo');

-- ── FACULTY (from CSV lab-incharge names) ──
INSERT INTO users (id, email, name, role, department, sponsor_id, phone, password) VALUES
  (2,  'j_aravinth@cb.amrita.edu',        'Dr. J. Aravinth',            'faculty', 'ECE',  NULL, NULL, 'demo'),
  (3,  'j_rolantgini@cb.amrita.edu',      'Dr. Rolant Gini J.',         'faculty', 'ECE',  NULL, NULL, 'demo'),
  (4,  's_krithiga@cb.amrita.edu',        'Dr. Kirthiga S.',            'faculty', 'ECE',  NULL, NULL, 'demo'),
  (5,  's_umashankar@cb.amrita.edu',      'Dr. Umashankar Subramaniam', 'faculty', 'EEE',  NULL, NULL, 'demo'),
  (6,  'b_rajathilagam@cb.amrita.edu',    'Dr. Rajathilagam B.',        'faculty', 'CSE',  NULL, NULL, 'demo'),
  (7,  'a_baskar@cb.amrita.edu',          'Dr. Baskar A.',              'faculty', 'CSE',  NULL, NULL, 'demo'),
  (8,  'a_arun@cb.amrita.edu',            'Dr. Arun A.',                'faculty', 'MECH', NULL, NULL, 'demo'),
  (9,  'a_sumesh@cb.amrita.edu',          'Dr. A. Sumesh',              'faculty', 'MECH', NULL, NULL, 'demo'),
  (10, 'bn_prashanth@blr.amrita.edu',     'Dr. Prashanth B. N.',        'faculty', 'MECH', NULL, NULL, 'demo'),
  (11, 'krishna@amrita.edu',              'Dr. Krishnashree Achuthan',  'faculty', 'CSE',  NULL, NULL, 'demo');

-- ── TECHNICIANS (department string MUST match worker's DEPT_CATEGORIES) ──
INSERT INTO users (id, email, name, role, department, sponsor_id, phone, password) VALUES
  (12, 'l_vidhya@cb.amrita.edu',         'Vidya L',              'technician', 'ECE Labs',     NULL, NULL, 'demo'),
  (13, 'kp_peeyush@cb.amrita.edu',       'Peeyush K. P.',        'technician', 'CSE Labs',     NULL, NULL, 'demo'),
  (14, 'r_senthilkumar@cb.amrita.edu',   'Mr. R. Senthilkumar',  'technician', 'MECH Labs',    NULL, NULL, 'demo'),
  (15, 'm_akhil1@cb.amrita.edu',         'Dr. Akhil Mohan',      'technician', 'Chemical Labs',NULL, NULL, 'demo'),
  (16, 's_umashankar_tech@cb.amrita.edu','Prof. Umashankar',     'technician', 'EEE Labs',     NULL, NULL, 'demo');

-- ── SERVICE PROVIDERS ──
INSERT INTO users (id, email, name, role, department, sponsor_id, phone, password) VALUES
  (17, 'canteen@cb.amrita.edu', 'Canteen Staff', 'service_provider', 'Canteen', NULL, NULL, 'demo'),
  (18, 'library@cb.amrita.edu', 'Library Staff', 'service_provider', 'Library', NULL, NULL, 'demo');

-- ── STUDENTS (sponsor_id references faculty above) ──
INSERT INTO users (id, email, name, role, department, sponsor_id, phone, password) VALUES
  (19, 'arjun.k@cb.amrita.edu',   'Arjun K.',    'student', 'CSE',  2,  NULL, 'demo'),
  (20, 'priya.nair@cb.amrita.edu','Priya Nair',  'student', 'ECE',  3,  NULL, 'demo'),
  (21, 'rahul.sharma@cb.amrita.edu','Rahul Sharma','student','MECH',8, NULL, 'demo'),
  (22, 'divya.menon@cb.amrita.edu','Divya Menon','student', 'CSE',  6,  NULL, 'demo'),
  (23, 'karthik.raj@cb.amrita.edu','Karthik Raj','student', 'EEE',  5,  NULL, 'demo');