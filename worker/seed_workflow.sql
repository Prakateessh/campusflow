-- ═══════════════════════════════════════════════════════════════
-- Demo requests — one in each state for testing the queue
-- Run: wrangler d1 execute campusflow-db --file=./seed_workflow.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM approvals;
DELETE FROM request_items;
DELETE FROM requests;

-- ── Submitted — waiting on faculty sponsor (Faculty 1-CSE, id 2) ──
INSERT INTO requests
  (kind, requester_id, sponsor_id, facility_id, title, description, purpose, status,
   scheduled_start, scheduled_end, created_at, submitted_at)
VALUES
  ('lab', 8, 2, 20, 'Raspberry Pi for sensor prototype',
   'Need 1 Raspberry Pi 4 and 2 hours at bench 4.',
   'Testing soil moisture sensors for final year IoT project.',
   'submitted',
   datetime('now', '+1 day', '+7 hours'),
   datetime('now', '+1 day', '+9 hours'),
   datetime('now'), datetime('now'));

-- ── Pending approval — waiting on technician ──
INSERT INTO requests
  (kind, requester_id, sponsor_id, facility_id, title, description, purpose, status,
   scheduled_start, scheduled_end, created_at, submitted_at, approved_at)
VALUES
  ('lab', 9, 3, 45, 'Welding session for drone frame',
   'Need 2-hour supervised session.',
   'Building aluminium frame for aerospace club drone.',
   'pending_approval',
   datetime('now', '+2 days', '+4 hours'),
   datetime('now', '+2 days', '+6 hours'),
   datetime('now', '-1 day'),
   datetime('now', '-1 day'),
   datetime('now', '-1 day', '+2 hours'));

-- ── Approval log for the pending request ──
INSERT INTO approvals (request_id, approver_id, approver_role, decision, comments, decided_at)
SELECT
  id, 3, 'faculty', 'approved', 'Approved. Bring safety gear.', datetime('now', '-1 day', '+2 hours')
FROM requests
WHERE title = 'Welding session for drone frame'
LIMIT 1;