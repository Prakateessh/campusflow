-- ═══════════════════════════════════════════════════════════════
-- Student ↔ Advisor mapping table
-- Run: wrangler d1 execute campusflow-db --file=./student_advisors.sql --remote
-- ═══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS student_advisors;

CREATE TABLE student_advisors (
  student_id INTEGER NOT NULL REFERENCES users(id),
  advisor_id INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (student_id, advisor_id)
);

CREATE INDEX idx_student_advisors_student ON student_advisors(student_id);

-- Dummy data: every student linked to every faculty for now
INSERT INTO student_advisors (student_id, advisor_id)
SELECT s.id, f.id
FROM users s, users f
WHERE s.role = 'student' AND f.role = 'faculty';