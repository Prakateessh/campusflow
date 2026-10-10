-- ═══════════════════════════════════════════════════════════════
-- CampusFlow — App Data Seed (v2, FK-safe order)
-- Run: wrangler d1 execute campusflow-db --file=./seed_app.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM notifications;
DELETE FROM canteen_orders;
DELETE FROM approvals;
DELETE FROM request_items;
DELETE FROM requests;
DELETE FROM canteen_menu;
DELETE FROM inventory;
DELETE FROM library_books;
DELETE FROM project_outcomes;
DELETE FROM projects;
DELETE FROM users;

-- ═══════════ USERS ═══════════
INSERT INTO users (id, email, name, role, department, sponsor_id, phone) VALUES
  (1, 'admin@amrita.edu',    'Admin',             'admin',            NULL,        NULL, '9000000001'),
  (2, 'priya@amrita.edu',    'Dr. Priya Nair',    'faculty',          'CSE',       NULL, '9000000002'),
  (3, 'ramesh@amrita.edu',   'Dr. Ramesh Kumar',  'faculty',          'ECE',       NULL, '9000000003'),
  (4, 'suresh@amrita.edu',   'Suresh M.',         'technician',       'ECE Labs',  NULL, '9000000004'),
  (5, 'meena@amrita.edu',    'Meena R.',          'technician',       'Innovation',NULL, '9000000005'),
  (6, 'kumar@amrita.edu',    'Kumar S.',          'service_provider', 'Canteen',   NULL, '9000000006'),
  (7, 'lakshmi@amrita.edu',  'Lakshmi V.',        'service_provider', 'Library',   NULL, '9000000007'),
  (8, 'ashwin@amrita.edu',   'Ashwin Raj',        'student',          'CSE',       2,    '9000000008'),
  (9, 'divya@amrita.edu',    'Divya Menon',       'student',          'ECE',       2,    '9000000009'),
  (10,'rahul@amrita.edu',    'Rahul Sharma',      'student',          'MECH',      3,    '9000000010');

-- ═══════════ CANTEEN MENU (must come before request_items) ═══════════
INSERT INTO canteen_menu (id, facility_id, name, description, price_cents, prep_time_minutes, category, available, display_order) VALUES
  (1, 40, 'Masala Dosa',                'Crispy dosa with potato masala',           6000,  10, 'breakfast', 1, 1),
  (2, 40, 'Idli (2 pcs)',               'Steamed rice cakes with sambar & chutney', 3000,  5,  'breakfast', 1, 2),
  (3, 40, 'Poori Masala',               'Fried bread with potato curry',            5000,  8,  'breakfast', 1, 3),
  (4, 40, 'Filter Coffee',              'Traditional South Indian coffee',          2000,  3,  'beverage',  1, 4),
  (5, 40, 'Masala Chai',                'Spiced tea',                               1500,  3,  'beverage',  1, 5),
  (6, 40, 'Veg Fried Rice',             'Wok-tossed rice with vegetables',          8000,  12, 'meal',      1, 6),
  (7, 40, 'Curd Rice',                  'Cooling yogurt rice with tempering',       4000,  5,  'meal',      1, 7),
  (8, 40, 'Paneer Butter Masala + Roti', 'Rich paneer curry with 2 rotis',          12000, 15, 'meal',      1, 8),
  (9, 40, 'Veg Biryani',                'Fragrant basmati rice with veggies',       10000, 15, 'meal',      1, 9),
  (10,40, 'Samosa (2 pcs)',             'Crispy fried pastry with potato filling',  2500,  5,  'snack',     1, 10),
  (11,40, 'Vada (2 pcs)',               'Medu vada with chutney',                   3000,  6,  'snack',     1, 11),
  (12,40, 'Fresh Lime Soda',            'Sweet or salted',                          2500,  4,  'beverage',  1, 12);

-- ═══════════ REQUESTS ═══════════
INSERT INTO requests (id, kind, requester_id, sponsor_id, facility_id, title, description, status, scheduled_start, scheduled_end, created_at, submitted_at, approved_at) VALUES
  (1, 'lab', 8, 2, 20, 'Raspberry Pi + bench slot',
   'Need 1 Raspberry Pi 4 and 2 hours at bench 4 to prototype the sensor loop.',
   'approved',
   datetime('now', '+1 day', '+7 hours'),
   datetime('now', '+1 day', '+9 hours'),
   datetime('now', '-2 days'), datetime('now', '-2 days'), datetime('now', '-1 day')),

  (2, 'lab', 9, 2, 22, 'SEM imaging — 3 PCB samples',
   'Need to image 3 PCB cross-sections to inspect solder joints. Sample prep done.',
   'pending_approval',
   datetime('now', '+2 days', '+6 hours'),
   datetime('now', '+2 days', '+7 hours'),
   datetime('now', '-6 hours'), datetime('now', '-6 hours'), NULL),

  (3, 'canteen', 8, NULL, 40, 'Lunch pre-order — 2x Masala Dosa',
   'Pickup at 1 PM, will pay in-app.',
   'scheduled',
   datetime('now', '+3 hours'),
   datetime('now', '+3 hours'),
   datetime('now', '-30 minutes'), datetime('now', '-30 minutes'), datetime('now', '-25 minutes')),

  (4, 'lab', 10, 3, 45, 'Welding for drone frame — 2 hours',
   'Need to weld an aluminium frame. Bringing my own material.',
   'submitted',
   datetime('now', '+3 days', '+4 hours'),
   datetime('now', '+3 days', '+6 hours'),
   datetime('now', '-1 hour'), datetime('now', '-1 hour'), NULL),

  (5, 'library', 9, NULL, 6, 'Renewal — Introduction to Algorithms',
   'Need 14 more days to finish chapter 6.',
   'completed',
   NULL, NULL,
   datetime('now', '-3 days'), datetime('now', '-3 days'), datetime('now', '-3 days'));

-- ═══════════ REQUEST ITEMS ═══════════
INSERT INTO request_items (id, request_id, item_type, inventory_id, menu_item_id, quantity, unit, notes) VALUES
  (1, 1, 'inventory', NULL, NULL, 1, 'piece', 'Raspberry Pi 4 (4GB) with case and PSU'),
  (2, 1, 'slot',      NULL, NULL, 1, 'slot',  'Bench 04 · 2 hours · supervised'),
  (3, 2, 'service',   NULL, NULL, 3, 'run',   '3 PCB cross-sections'),
  (4, 3, 'menu_item', NULL, 1,    2, 'plate', 'Extra chutney on one'),
  (5, 4, 'slot',      NULL, NULL, 1, 'slot',  '2-hour supervised session'),
  (6, 5, 'inventory', NULL, NULL, 1, 'book',  'CLRS — Introduction to Algorithms');

-- ═══════════ APPROVALS ═══════════
INSERT INTO approvals (id, request_id, approver_id, approver_role, decision, comments, decided_at) VALUES
  (1, 1, 2, 'faculty',          'approved', 'Fine, but return the Pi by end of week.',     datetime('now', '-1 day', '-2 hours')),
  (2, 1, 4, 'technician',       'approved', 'Bench 4 reserved. Bring your own SD card.',   datetime('now', '-1 day', '-1 hour')),
  (3, 5, 7, 'service_provider', 'approved', 'Renewed for 14 days.',                        datetime('now', '-3 days')),
  (4, 3, 6, 'service_provider', 'approved', 'Order confirmed. Awaiting payment.',          datetime('now', '-28 minutes'));

-- ═══════════ CANTEEN ORDERS ═══════════
INSERT INTO canteen_orders (request_id, pickup_at, paid_at, payment_reference, queue_position, prep_started_at, prep_completed_at, ready_notified_at) VALUES
  (3,
   datetime('now', '+3 hours'),
   datetime('now', '-20 minutes'),
   'UPI-DEMO-A7X9K2',
   1,
   datetime('now', '+2 hours', '+50 minutes'),
   NULL,
   NULL);

-- ═══════════ LIBRARY BOOKS ═══════════
INSERT INTO library_books (id, isbn, title, author, total_copies, available_copies, shelf_code) VALUES
  (1,  '978-0132350884', 'Clean Code',                               'Robert C. Martin',        5, 2, 'CS-A-01'),
  (2,  '978-0201616224', 'The Pragmatic Programmer',                 'Hunt & Thomas',           4, 3, 'CS-A-02'),
  (3,  '978-0262033848', 'Introduction to Algorithms',               'CLRS',                    6, 4, 'CS-A-03'),
  (4,  '978-0201633610', 'Design Patterns',                          'Gang of Four',            3, 1, 'CS-A-04'),
  (5,  '978-0134610993', 'Artificial Intelligence: A Modern Approach','Russell & Norvig',        4, 2, 'CS-B-01'),
  (6,  '978-0131873742', 'Digital Signal Processing',                'Proakis & Manolakis',     5, 3, 'EC-A-01'),
  (7,  '978-0190853464', 'Microelectronic Circuits',                 'Sedra & Smith',           6, 4, 'EC-A-02'),
  (8,  '978-0138147570', 'Signals and Systems',                      'Oppenheim & Willsky',     5, 2, 'EC-A-03'),
  (9,  '978-0132126953', 'Computer Networks',                        'Tanenbaum',               4, 2, 'CS-C-01'),
  (10, '978-1118063330', 'Operating System Concepts',                'Silberschatz',            5, 3, 'CS-C-02'),
  (11, '978-0133918922', 'Engineering Mechanics: Statics',           'Hibbeler',                4, 2, 'ME-A-01'),
  (12, '978-8131808146', 'Strength of Materials',                    'R.K. Bansal',             6, 5, 'ME-A-02'),
  (13, '978-0073398273', 'Fluid Mechanics',                          'Cengel & Cimbala',        3, 1, 'ME-A-03'),
  (14, '978-0073402611', 'Organic Chemistry',                        'Morrison & Boyd',         4, 3, 'CH-A-01'),
  (15, '978-0980232776', 'Linear Algebra Done Right',                'Sheldon Axler',           3, 2, 'MA-A-01');

-- ═══════════ NOTIFICATIONS ═══════════
INSERT INTO notifications (id, user_id, title, body, kind, request_id, read_at, created_at) VALUES
  (1, 8, 'Request approved',  'Your Raspberry Pi request is approved. Bench 4 reserved.',   'approval', 1, NULL,                       datetime('now', '-1 day', '-1 hour')),
  (2, 8, 'Sponsor approval',  'Dr. Priya Nair approved your Smart Irrigation request.',      'approval', 1, datetime('now', '-1 day'),  datetime('now', '-1 day', '-2 hours')),
  (3, 9, 'Awaiting approval', 'Your SEM imaging request is under review by the technician.','system',   2, NULL,                       datetime('now', '-5 hours')),
  (4, 8, 'Payment received',  'Payment confirmed. Your order is #1 in the queue.',           'system',   3, NULL,                       datetime('now', '-20 minutes')),
  (5, 9, 'Renewal complete',  'Introduction to Algorithms renewed for 14 days.',             'approval', 5, datetime('now', '-3 days'), datetime('now', '-3 days'));