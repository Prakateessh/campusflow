DROP TABLE IF EXISTS library_loans;

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

-- Seed active loans
-- User 8 (User 1-CSE): 2 active loans
-- User 9 (User 2-ECE): 1 active loan
INSERT INTO library_loans (user_id, book_id, borrowed_at, due_date, returned_at, renewals) VALUES
  (8, 2,  datetime('now', '-7 days'),  datetime('now', '+7 days'),  NULL, 0),
  (8, 11, datetime('now', '-3 days'),  datetime('now', '+11 days'), NULL, 0),
  (9, 3,  datetime('now', '-10 days'), datetime('now', '+4 days'),  NULL, 0);