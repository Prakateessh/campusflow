-- ═══════════════════════════════════════════════════════════════
-- CampusFlow — Clean all invented data
--   Keeps: facilities, users, canteen_menu, library_books,
--          store_items, inventory
--   Deletes: every request, approval, order, notification, loan
-- Run: wrangler d1 execute campusflow-db --file=./clean_fake_data.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM notifications;
DELETE FROM canteen_orders;
DELETE FROM approvals;
DELETE FROM request_items;
DELETE FROM requests;
DELETE FROM library_loans;
DELETE FROM projects;
DELETE FROM project_outcomes;
DELETE FROM crowd_log;

-- Reset auto-increment counters so demo starts clean
DELETE FROM sqlite_sequence WHERE name IN (
  'requests', 'request_items', 'approvals',
  'canteen_orders', 'notifications', 'library_loans'
);