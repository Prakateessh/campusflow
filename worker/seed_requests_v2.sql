-- ═══════════════════════════════════════════════════════════════
-- Demo requests — one in each workflow state
--   Uses real user ids from reset_users_v2.sql
-- Run: wrangler d1 execute campusflow-db --file=./seed_requests_v2.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM approvals;
DELETE FROM request_items;
DELETE FROM requests;

-- ── 1. Submitted — waiting on Faculty 1 (Dr. Aravinth, id 2) ──
INSERT INTO requests
  (kind, requester_id, sponsor_id, facility_id, title, description, purpose, status,
   scheduled_start, scheduled_end, created_at, submitted_at)
VALUES
  ('lab', 19, 2, 20, 'Raspberry Pi for sensor prototype',
   'Need 1 Raspberry Pi 4 and 2 hours at bench 4.',
   'Testing soil moisture sensors for final year IoT project on smart irrigation.',
   'submitted',
   datetime('now', '+1 day', '+7 hours'),
   datetime('now', '+1 day', '+9 hours'),
   datetime('now'), datetime('now'));

-- ── 2. Pending approval — waiting on ECE technician (id 12) ──
INSERT INTO requests
  (kind, requester_id, sponsor_id, facility_id, title, description, purpose, status,
   scheduled_start, scheduled_end, created_at, submitted_at, approved_at)
VALUES
  ('lab', 20, 3, 18, 'FPGA access for digital design assignment',
   'Need Basys 3 board for a week.',
   'Digital design coursework — implementing a finite state machine on FPGA.',
   'pending_approval',
   datetime('now', '+2 days', '+10 hours'),
   datetime('now', '+2 days', '+12 hours'),
   datetime('now', '-1 day'),
   datetime('now', '-1 day'),
   datetime('now', '-1 day', '+2 hours'));

INSERT INTO approvals (request_id, approver_id, approver_role, decision, comments, decided_at)
SELECT id, 3, 'faculty', 'approved', 'Approved. Return the board by next week.', datetime('now', '-1 day', '+2 hours')
FROM requests
WHERE title = 'FPGA access for digital design assignment'
LIMIT 1;

-- ── 3. Pending approval — waiting on MECH technician (id 14) ──
INSERT INTO requests
  (kind, requester_id, sponsor_id, facility_id, title, description, purpose, status,
   scheduled_start, scheduled_end, created_at, submitted_at, approved_at)
VALUES
  ('lab', 21, 8, 45, 'Welding session for drone frame',
   'Need 2-hour supervised session.',
   'Building aluminium frame for aerospace club drone.',
   'pending_approval',
   datetime('now', '+2 days', '+4 hours'),
   datetime('now', '+2 days', '+6 hours'),
   datetime('now', '-2 days'),
   datetime('now', '-2 days'),
   datetime('now', '-2 days', '+3 hours'));

INSERT INTO approvals (request_id, approver_id, approver_role, decision, comments, decided_at)
SELECT id, 8, 'faculty', 'approved', 'Approved. Bring safety gear.', datetime('now', '-2 days', '+3 hours')
FROM requests
WHERE title = 'Welding session for drone frame'
LIMIT 1;

-- ── 4. Approved — fully approved, scheduled ──
INSERT INTO requests
  (kind, requester_id, sponsor_id, facility_id, title, description, purpose, status,
   scheduled_start, scheduled_end, created_at, submitted_at, approved_at)
VALUES
  ('lab', 22, 6, 22, 'SEM imaging of PCB samples',
   '3 PCB cross-sections.',
   'Verifying solder joint integrity for a robotics project.',
   'approved',
   datetime('now', '+3 days', '+9 hours'),
   datetime('now', '+3 days', '+10 hours'),
   datetime('now', '-3 days'),
   datetime('now', '-3 days'),
   datetime('now', '-2 days'));

INSERT INTO approvals (request_id, approver_id, approver_role, decision, comments, decided_at)
SELECT id, 6, 'faculty', 'approved', 'Approved.', datetime('now', '-2 days', '-4 hours')
FROM requests WHERE title = 'SEM imaging of PCB samples' LIMIT 1;

INSERT INTO approvals (request_id, approver_id, approver_role, decision, comments, decided_at)
SELECT id, 15, 'technician', 'approved', 'Slot booked.', datetime('now', '-2 days')
FROM requests WHERE title = 'SEM imaging of PCB samples' LIMIT 1;